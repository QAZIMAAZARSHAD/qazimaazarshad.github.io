import { test, expect, type Page, type Locator } from "@playwright/test";
import { enterSite } from "./intro";

async function ready(page: Page) {
  await page.goto("/");
  await enterSite(page);
  await page.evaluate(() => document.fonts.ready);
  await page.locator("footer").scrollIntoViewIfNeeded();
  // Let the letters' entrance settle so the light has been measured.
  await page.waitForTimeout(800);
}

/** Centre of the light, in viewport coordinates. */
async function lightCentre(page: Page) {
  return page.evaluate(() => {
    // h2 → the positioned layer wrapper → the element carrying the CSS vars.
    const wrap = document.querySelector("footer h2")?.parentElement
      ?.parentElement as HTMLElement | null;
    if (!wrap) return null;
    const rect = wrap.getBoundingClientRect();
    const sx = Number.parseFloat(wrap.style.getPropertyValue("--sx"));
    const sy = Number.parseFloat(wrap.style.getPropertyValue("--sy"));
    return { x: rect.left + sx, y: rect.top + sy };
  });
}

async function centreOf(word: Locator) {
  const box = (await word.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

test.describe("Footer signature", () => {
  test("headlines the name and rests the light on the first name", async ({
    page,
  }) => {
    await ready(page);

    const footer = page.locator("footer");
    await expect(
      footer.getByRole("heading", { name: "Qazi Maaz Arshad" }),
    ).toBeVisible();

    const word = page.getByTestId("signature-highlight");
    await expect(word).toHaveText("MAAZ");

    // The resting light sits on "MAAZ", not at the block's midpoint.
    const light = await lightCentre(page);
    const target = await centreOf(word);
    expect(light).not.toBeNull();
    expect(Math.abs(light!.x - target.x)).toBeLessThan(4);
    expect(Math.abs(light!.y - target.y)).toBeLessThan(4);
  });

  test("the light follows the pointer and settles back on leaving", async ({
    page,
  }) => {
    await ready(page);

    const word = page.getByTestId("signature-highlight");
    const rest = await centreOf(word);

    await page.mouse.move(rest.x + 260, rest.y, { steps: 10 });
    await expect
      .poll(async () => (await lightCentre(page))!.x)
      .toBeGreaterThan(rest.x + 200);

    // Leaving the footer parks it back over "MAAZ".
    await page.mouse.move(rest.x, 5, { steps: 10 });
    await expect
      .poll(async () => Math.abs((await lightCentre(page))!.x - rest.x))
      .toBeLessThan(4);
  });

  test("keeps the visit counter and drops the duplicated link columns", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (
        window as unknown as { __VISIT_COUNTER_TEST__: boolean }
      ).__VISIT_COUNTER_TEST__ = true;
    });
    await page.route("**/abacus.jasoncameron.dev/**", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ value: 12431 }),
      }),
    );
    await ready(page);

    const footer = page.locator("footer");
    await expect(page.getByTestId("visit-counter")).toContainText("12,431");
    await expect(footer).toContainText("All rights reserved");

    // The old Explore/Connect columns and the in-footer top button are gone.
    await expect(
      footer.getByRole("navigation", { name: /footer/i }),
    ).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Jump to top" })).toHaveCount(
      0,
    );
    await expect(footer).not.toContainText("Built with");
  });

  // The wordmark is deliberately wider than every other column, so it alone can
  // reach the fixed scroll-dots — the last letter used to sit under them.
  //
  // Two things are being held at once, and the tighter one is the wrap. The
  // type is sized in vw against a column that loses a fixed inset, so the
  // narrow end of the lg range is where the name comes closest to spilling onto
  // a second line; 1150 and 1200 are there for that. Asserting the line count
  // also stops the clearance check passing for the wrong reason: a wrapped name
  // is short, so it clears the rail easily while looking nothing like intended.
  for (const width of [1025, 1150, 1200, 1280, 1440, 1600, 1920]) {
    test(`stays on one line and clears the scroll-dots rail at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await ready(page);

      const measured = await page.evaluate(() => {
        const heading = document.querySelector("footer h2");
        const rail = document.querySelector(
          'nav[aria-label="Section navigation"]',
        );
        if (!heading || !rail) return null;

        // Word boxes, not the heading block — the block always spans the
        // column, while the letters are what actually collide and wrap.
        const words = [...heading.querySelectorAll("span[aria-hidden] > span")];
        if (words.length === 0) return null;
        const boxes = words.map((w) => w.getBoundingClientRect());

        return {
          lines: new Set(boxes.map((b) => Math.round(b.top))).size,
          clearance:
            rail.getBoundingClientRect().left -
            Math.max(...boxes.map((b) => b.right)),
        };
      });

      expect(measured, "rail and wordmark both present").not.toBeNull();
      expect(measured!.lines, "wordmark stays on one line").toBe(1);
      expect(measured!.clearance).toBeGreaterThan(16);
    });
  }

  test.describe("touch device", () => {
    test.use({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });

    // Regression: on coarse pointers the mask used to be dropped entirely,
    // which lit every letter instead of just the highlighted word.
    test("still spotlights a single word", async ({ page }) => {
      await ready(page);

      const masked = await page.evaluate(() => {
        // The gradient copy is the span immediately after the heading.
        const layer = document.querySelector(
          "footer h2 + span",
        ) as HTMLElement | null;
        const wrap = document.querySelector("footer h2")?.parentElement
          ?.parentElement as HTMLElement | null;
        return {
          mask: layer?.style.maskImage || layer?.style.webkitMaskImage || "",
          sx: wrap?.style.getPropertyValue("--sx") ?? "",
        };
      });

      expect(masked.mask).toContain("radial-gradient");
      expect(masked.sx).not.toBe("");
    });
  });
});
