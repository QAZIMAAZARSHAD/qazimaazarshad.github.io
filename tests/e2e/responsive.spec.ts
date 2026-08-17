import { test, expect, type Page } from "@playwright/test";
import { enterSite } from "./intro";

/**
 * Per viewport: no horizontal overflow, the navbar switches between hamburger
 * and inline links at the 1180px dock breakpoint, the hero name renders, and a
 * hero screenshot is kept as a visual record.
 */

interface Viewport {
  name: string;
  width: number;
  height: number;
}

const VIEWPORTS: Viewport[] = [
  { name: "iphone-se", width: 375, height: 667 },
  { name: "iphone-14", width: 390, height: 844 },
  { name: "pixel-7", width: 412, height: 915 },
  { name: "ipad-mini", width: 768, height: 1024 },
  { name: "ipad-pro", width: 1024, height: 1366 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "desktop-fhd", width: 1920, height: 1080 },
];

// Matches Navbar's `min-[1180px]:` desktop dock (not Tailwind `xl` / 1280 —
// WebKit's scrollbar would otherwise leave 1280 CSS-px windows on the mobile
// chrome).
const DESKTOP_NAV_BREAKPOINT = 1180;

test.beforeEach(async ({ page }) => {
  // Reduced motion disables the canvas particles + freezes CSS animations.
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const viewport of VIEWPORTS) {
  test(`layout @ ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await enterSite(page);

    // No horizontal overflow — catches layout blowouts.
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(viewport.width + 1);

    const hamburger = page.getByRole("button", { name: "Open menu" });
    // Scope to the Primary navigation so we don't match any other nav landmark.
    const desktopLink = page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "About", exact: true });

    if (viewport.width < DESKTOP_NAV_BREAKPOINT) {
      await expect(hamburger).toBeVisible();
      await expect(desktopLink).toBeHidden();
    } else {
      await expect(desktopLink).toBeVisible();
      await expect(hamburger).toBeHidden();
    }

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const hero = page.locator("#hero");
    await hero.scrollIntoViewIfNeeded();
    await expect(hero.getByRole("heading").first()).toBeVisible();
    await page.waitForTimeout(500);
    await expect(hero).toHaveScreenshot(`hero-${viewport.name}.png`);
  });
}

/**
 * The shell steps up at 1536 and 1920 rather than sitting at one flat cap.
 * Asserted as steps, not exact pixels, so the widths stay retunable.
 */
test.describe("The shell widens on large displays", () => {
  const shellWidth = (page: Page) =>
    page
      .locator("#hero .container-page")
      .evaluate((el) => el.getBoundingClientRect().width);

  test("content keeps its share of the width as the monitor grows", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await enterSite(page);
    const atLaptop = await shellWidth(page);

    await page.setViewportSize({ width: 1600, height: 900 });
    await page.waitForTimeout(200);
    const atWide = await shellWidth(page);

    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.waitForTimeout(200);
    const atMonitor = await shellWidth(page);

    expect(atWide).toBeGreaterThan(atLaptop);
    expect(atMonitor).toBeGreaterThan(atWide);

    // Better than half the screen, rather than the 45% it sat at before.
    expect(atMonitor / 2560).toBeGreaterThan(0.5);
  });

  test("the deck grows with the shell instead of staying a small island", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await enterSite(page);

    const card = page.locator("#earlier [role='tabpanel']").first();
    await card.scrollIntoViewIfNeeded();
    const atLaptop = await card.evaluate(
      (el) => el.getBoundingClientRect().width,
    );

    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.waitForTimeout(400);
    const atMonitor = await card.evaluate(
      (el) => el.getBoundingClientRect().width,
    );

    expect(atMonitor).toBeGreaterThan(atLaptop);
  });
});
