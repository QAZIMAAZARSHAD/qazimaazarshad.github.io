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

    // Move across the name — the light tracks the cursor.
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
    await page.route("**/api.counterapi.dev/**", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ count: 12431 }),
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
