import { test, expect, devices } from "@playwright/test";

test.use({ ...devices["Pixel 7"] });

test.describe("Mobile behavior (regression guards)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page
      .locator('[data-testid="preloader"]')
      .waitFor({ state: "detached" })
      .catch(() => {});
  });

  // Guards the bug where filtered/initial project cards rendered at opacity:0
  // (invisible but occupying layout) until a filter was toggled.
  test("all project cards are visible on load", async ({ page }) => {
    await page.locator("#projects").scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const cards = page.locator("#projects button:has(img)");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toHaveCSS("opacity", "1");
    }
  });

  // Guards the bug where tapping a drawer link snapped back to the top / never
  // scrolled (body scroll-lock + focus-return race).
  test("mobile drawer link scrolls to its section", async ({ page }) => {
    await page.getByRole("button", { name: "Open menu" }).click();

    const drawer = page.locator("#mobile-menu");
    await expect(drawer).toBeVisible();

    await drawer.getByRole("link", { name: "Contact", exact: true }).click();

    await expect(drawer).toBeHidden();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator("#contact")).toBeInViewport();
  });

  test("hamburger toggles the drawer with all nav links", async ({ page }) => {
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.click();

    const drawer = page.locator("#mobile-menu");
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('a[href^="#"]')).toHaveCount(9);

    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(drawer).toBeHidden();
  });
});
