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
  "earlier",
  "projects",
  "skills",
  "education",
  "achievements",
  "hobbies",
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
  // Hide always-on floating widgets so they don't leak into section snapshots.
  await page.addStyleTag({
    content:
      '[aria-label="Ask my portfolio — AI assistant"],[aria-label="Back to top"]{display:none !important}',
  });
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

test("footer", async ({ page }) => {
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer.getByRole("heading").first()).toBeVisible();
  await page.waitForTimeout(500);
  await expect(footer).toHaveScreenshot("footer.png");
});

test("command palette", async ({ page }) => {
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog", { name: /command palette/i });
  await expect(dialog).toBeVisible();
  await page.waitForTimeout(300);
  await expect(dialog).toHaveScreenshot("command-palette.png");
});
