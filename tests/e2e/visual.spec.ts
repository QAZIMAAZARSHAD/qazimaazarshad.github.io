import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * Visual regression tests — one element screenshot per section, plus the
 * navbar and a filtered projects state.
 *
 * Determinism: reduced-motion is enabled BEFORE navigation so the animated
 * canvas particle background is disabled and global CSS freezes animations.
 * We also wait for web fonts and let each Framer scroll-reveal settle before
 * capturing an element (not full-page) screenshot.
 */

const SECTION_IDS = [
  "hero",
  "about",
  "experience",
  "projects",
  "skills",
  "education",
  "achievements",
  "contact",
] as const;

async function settleSection(page: Page, section: Locator): Promise<void> {
  await section.scrollIntoViewIfNeeded();
  // Wait for the section's heading so the Framer reveal has settled.
  await expect(section.getByRole("heading").first()).toBeVisible();
  // Give scroll-triggered reveals a beat to finish.
  await page.waitForTimeout(500);
}

test.beforeEach(async ({ page }) => {
  // Disable canvas particle animation + freeze CSS animations before load.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  // Wait for the preloader to fade out so screenshots capture the real page.
  await page
    .locator('[data-testid="preloader"]')
    .waitFor({ state: "detached" })
    .catch(() => {});
});

test("navbar", async ({ page }) => {
  await expect(page.locator("nav").first()).toHaveScreenshot("navbar.png");
});

for (const id of SECTION_IDS) {
  test(`section: ${id}`, async ({ page }) => {
    const section = page.locator(`#${id}`);
    await settleSection(page, section);
    await expect(section).toHaveScreenshot(`${id}.png`);
  });
}

test("projects filtered by Game", async ({ page }) => {
  const projects = page.locator("#projects");
  await settleSection(page, projects);

  await page.getByRole("button", { name: "Game", exact: true }).click();
  // Let the grid re-mount / re-run its entrance animation and settle.
  await page.waitForTimeout(500);

  const grid = projects.locator("div.grid").first();
  await expect(grid).toBeVisible();
  await expect(grid).toHaveScreenshot("projects-filtered-game.png");
});
