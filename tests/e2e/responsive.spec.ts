import { test, expect } from "@playwright/test";
import { enterSite } from "./intro";

/**
 * Responsiveness tests across popular screen dimensions.
 *
 * For each viewport we assert there is no horizontal overflow, that the
 * navbar switches between the mobile hamburger and the desktop inline links
 * at the 1180px dock breakpoint, that the hero name renders, and we capture
 * a hero-section element screenshot for a visual record across dimensions.
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
