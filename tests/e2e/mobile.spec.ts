import { test, expect, devices } from "@playwright/test";
import { enterSite } from "./intro";
import { navSections } from "../../src/data/content";

test.use({ ...devices["Pixel 7"] });

test.describe("Mobile behavior (regression guards)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await enterSite(page);
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

  // Guards the bug where the label was wider than the phone and broke across
  // two lines mid-phrase ("SHOW ALL 23 / PROJECTS", "(17 / MORE)").
  for (const width of [320, 360, 390]) {
    test.describe(`the projects toggle at ${width}px`, () => {
      test.use({ viewport: { width, height: 800 } });

      test("keeps its label on one line, inside the screen", async ({
        page,
      }) => {
        const button = page.locator("#projects button[aria-expanded]");
        await button.scrollIntoViewIfNeeded();
        await expect(button).toBeVisible();

        const box = await button.evaluate((el) => {
          const cs = getComputedStyle(el);
          const padding =
            parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
          const rect = el.getBoundingClientRect();
          return {
            lines: Math.round(
              (rect.height - padding) / parseFloat(cs.lineHeight),
            ),
            left: rect.left,
            right: rect.right,
          };
        });

        expect(box.lines).toBe(1);
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(width);
      });
    });
  }

  test("hamburger toggles the drawer with all nav links", async ({ page }) => {
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.click();

    const drawer = page.locator("#mobile-menu");
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('a[href^="#"]')).toHaveCount(
      navSections.length,
    );

    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(drawer).toBeHidden();
  });
});
