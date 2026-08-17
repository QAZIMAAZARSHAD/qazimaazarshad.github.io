import { test, expect, type Page } from "@playwright/test";
import { enterSite } from "./intro";

/**
 * The role rows carry two mono columns, a period and a tenure. The tenure of an
 * ongoing role is computed against the clock, so it gains a character on its own
 * every so often — "1 yr 1 mo" becomes "1 yr 2 mos" — and it once did exactly
 * that inside a column that had a single pixel of room left, breaking the words
 * across two lines with no code change to blame.
 *
 * These run the clock forward rather than only checking today, so the next such
 * break shows up here instead of on the live site.
 */

/** Pin `now` so the live tenure is deterministic. */
async function freezeClock(page: Page, iso: string): Promise<void> {
  await page.addInitScript((at) => {
    const FIXED = new Date(at).getTime();
    const OriginalDate = Date;
    class FrozenDate extends OriginalDate {
      constructor(...args: ConstructorParameters<typeof Date>) {
        if (args.length === 0) super(FIXED);
        else super(...args);
      }
      static now() {
        return FIXED;
      }
    }
    globalThis.Date = FrozenDate as DateConstructor;
  }, iso);
}

async function openExperience(page: Page): Promise<void> {
  await page.goto("/");
  await enterSite(page);
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#experience").scrollIntoViewIfNeeded();
  await expect(page.locator("#experience").first()).toBeVisible();
}

/** Any period or tenure that is occupying more than one line. */
function wrappedRuns(page: Page) {
  return page.locator("#experience").evaluate((section) => {
    const wrapped: string[] = [];
    for (const group of section.querySelectorAll(
      '[data-testid="role-dates"]',
    )) {
      for (const el of group.children) {
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
        const lines = Math.round(
          el.getBoundingClientRect().height / lineHeight,
        );
        if (lines > 1) {
          wrapped.push(`${el.textContent?.trim()} (${lines} lines)`);
        }
      }
    }
    return wrapped;
  });
}

test.describe("Experience dates", () => {
  test("neither column breaks across lines at any desktop width", async ({
    page,
  }) => {
    await freezeClock(page, "2026-07-15T00:00:00Z");

    for (const width of [1024, 1180, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await openExperience(page);
      // Polled rather than measured once: on a loaded runner the row can be
      // caught mid-reflow and report a height it does not settle at.
      await expect
        .poll(() => wrappedRuns(page), { message: `at ${width}px` })
        .toEqual([]);
    }
  });

  /**
   * Regression: the tenure column was a fixed 4.5rem, which fit "1 yr 1 mo" with
   * a pixel to spare and split the moment the role ticked over to "1 yr 2 mos".
   * Years from now the same row reads "5 yrs 3 mos" and has to stay on one line.
   */
  test("a tenure that has grown for years still sits on one line", async ({
    page,
  }) => {
    await freezeClock(page, "2030-06-15T00:00:00Z");
    await page.setViewportSize({ width: 1280, height: 900 });
    await openExperience(page);

    // The ongoing role should now be reporting a long, multi-word tenure.
    await expect(
      page
        .locator("#experience")
        .getByText(/\d+ yrs \d+ mos/)
        .first(),
    ).toBeVisible();

    await expect.poll(() => wrappedRuns(page)).toEqual([]);
  });

  test("the dates stay inside the card on a narrow phone", async ({ page }) => {
    await freezeClock(page, "2030-06-15T00:00:00Z");
    await page.setViewportSize({ width: 320, height: 800 });
    await openExperience(page);

    const spilling = await page.locator("#experience").evaluate((section) => {
      const edge = section.getBoundingClientRect().right;
      return [...section.querySelectorAll("*")].filter(
        (el) => el.getBoundingClientRect().right > edge + 1,
      ).length;
    });
    expect(spilling).toBe(0);
  });
});
