import { test, expect, type Page } from "@playwright/test";

const intro = (page: Page) => page.locator('[data-testid="preloader"]');
const door = (page: Page) =>
  page.getByRole("button", { name: "Enter the site" });

test.describe("Entry door", () => {
  test("follows the loader and waits to be opened", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });

    // The loader comes first and holds before handing over.
    await expect(page.getByText("Loading")).toBeVisible({ timeout: 10_000 });
    await expect(door(page)).toBeVisible({ timeout: 10_000 });

    // The door has no timeout of its own — it stays until it is opened. There
    // is no event to await here; the point is that nothing happens.
    await page.waitForTimeout(1_500); // NOSONAR
    await expect(door(page)).toBeVisible();
    await expect(page.getByTestId("welcome")).toHaveCount(0);
  });

  test("takes focus so it can be opened without a mouse", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect(door(page)).toBeFocused({ timeout: 10_000 });

    await page.keyboard.press("Enter");
    await expect(page.getByTestId("welcome")).toBeVisible({ timeout: 10_000 });
  });

  // A stray key used to be able to dismiss the whole intro; while the door is
  // up it must do nothing, or the visitor never hears the greeting.
  test("ignores stray keys and clicks until it is actually opened", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect(door(page)).toBeVisible({ timeout: 10_000 });

    await page.keyboard.press("Escape");
    await page.mouse.click(60, 60);
    // Again, the assertion is that nothing followed from those.
    await page.waitForTimeout(400); // NOSONAR

    await expect(intro(page)).toBeVisible();
    await expect(door(page)).toBeVisible();
  });

  test("opens into the greeting, then the page", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await door(page).click({ timeout: 10_000 });

    await expect(page.getByTestId("welcome")).toBeVisible({ timeout: 10_000 });
    await expect(intro(page)).toHaveCount(0, { timeout: 15_000 });
    await expect(page.locator("#hero")).toBeVisible();
  });

  // Regression: the backdrop lived inside the door's entrance-animated wrapper,
  // and a transformed ancestor becomes the containing block for its full-screen
  // descendants — so it was boxed into that column until the transform settled.
  test("the scenery covers the viewport from the moment the door appears", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "commit" });
    await expect(door(page)).toBeVisible({ timeout: 10_000 });

    // Sampled immediately, while the entrance transform is still running.
    const box = await page.evaluate(() => {
      const r = document
        .querySelector('[data-testid="door-scenery"]')
        ?.getBoundingClientRect();
      return r ? { w: Math.round(r.width), h: Math.round(r.height) } : null;
    });

    expect(box).not.toBeNull();
    expect(box!.w).toBe(1280);
    expect(box!.h).toBe(800);
  });

  test.describe("reduced motion", () => {
    test("still opens, without the flight", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/", { waitUntil: "commit" });

      await door(page).click({ timeout: 10_000 });
      await expect(page.getByTestId("welcome")).toBeVisible({
        timeout: 10_000,
      });
      await expect(intro(page)).toHaveCount(0, { timeout: 10_000 });
    });
  });

  test.describe("visual", () => {
    test("closed door", async ({ page }) => {
      // Reduced motion stills the aurora and the flight, so this is stable.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto("/", { waitUntil: "commit" });
      await expect(door(page)).toBeVisible({ timeout: 10_000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400); // NOSONAR — let the entrance settle

      await expect(intro(page)).toHaveScreenshot("entry-door.png");
    });
  });
});
