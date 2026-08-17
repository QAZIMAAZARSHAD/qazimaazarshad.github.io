import { test, expect, type Page } from "@playwright/test";
import { enterSite } from "./intro";

/**
 * An ongoing role's tenure is computed against the clock, so it gains a
 * character on its own over time ("1 yr 1 mo" → "1 yr 2 mos"). These run the
 * clock forward as well as checking today.
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
  // One test per width; five intros in a single test outran the CI timeout.
  for (const width of [1024, 1180, 1280, 1440, 1920]) {
    test(`neither column breaks across lines at ${width}px`, async ({
      page,
    }) => {
      await freezeClock(page, "2026-07-15T00:00:00Z");
      await page.setViewportSize({ width, height: 900 });
      await openExperience(page);

      // Polled: a loaded runner can catch the row mid-reflow.
      await expect.poll(() => wrappedRuns(page)).toEqual([]);
    });
  }

  test("a tenure that has grown for years still sits on one line", async ({
    page,
  }) => {
    await freezeClock(page, "2030-06-15T00:00:00Z");
    await page.setViewportSize({ width: 1280, height: 900 });
    await openExperience(page);

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
