import { test, expect, type Page, type Locator } from "@playwright/test";
import { enterSite } from "./intro";

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
  "certifications",
  "hobbies",
  "contact",
] as const;

/**
 * Take the header out of the shot.
 *
 * It floats over whatever is behind it, so it lands in section screenshots and
 * carries its own state into them — docked or not, which item is current — none
 * of which belongs to the section underneath. That state moves whenever the
 * page above changes length, which is how a nav reorder came to sit in these
 * baselines unnoticed, under the diff tolerance, until an unrelated section
 * grew and pushed it over. The header has two snapshots of its own, and its
 * current-item behaviour is asserted in navigation.spec.ts.
 *
 * It is fixed, so hiding it reflows nothing.
 */
async function hideHeader(page: Page): Promise<void> {
  await page.addStyleTag({ content: "header{display:none !important}" });
}

async function settleSection(page: Page, section: Locator): Promise<void> {
  await hideHeader(page);
  await section.scrollIntoViewIfNeeded();
  // Wait for the section's heading so the Framer reveal has settled.
  await expect(section.getByRole("heading").first()).toBeVisible();
  // Force any lazy images in the section to load so screenshots are complete
  // and deterministic (e.g. the certificate gallery previews).
  await section
    .evaluate((el: HTMLElement) => {
      const imgs = Array.from(el.querySelectorAll("img"));
      imgs.forEach((img) => {
        img.loading = "eager";
      });
      return Promise.all(
        imgs.map((img) =>
          img.complete
            ? null
            : new Promise((resolve) => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
              }),
        ),
      );
    })
    .catch(() => {});
  // Give scroll-triggered reveals a beat to finish.
  await page.waitForTimeout(500);
}

test.beforeEach(async ({ page }) => {
  // Disable canvas particle animation + freeze CSS animations before load.
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Freeze "now" so the live current-role tenure ("X mos") is deterministic
  // and doesn't drift the experience snapshot month-to-month in CI.
  await page.addInitScript(() => {
    const FIXED = new Date("2026-07-15T00:00:00Z").getTime();
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
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  // Wait for the preloader to fade out so screenshots capture the real page.
  await enterSite(page);
  // Hide always-on floating widgets so they don't leak into section snapshots.
  await page.addStyleTag({
    content:
      '[aria-label="Ask my portfolio — AI assistant"],[aria-label="Back to top"],[data-testid="visit-counter"],[data-testid="love-count"],[aria-label="Section navigation"],.qma-cursor-layer{display:none !important}',
  });
});

test("navbar", async ({ page }) => {
  await expect(
    page.getByRole("navigation", { name: "Primary" }),
  ).toHaveScreenshot("navbar.png");
});

// The docked state is the headline of the header design, so guard it too.
test("navbar (docked)", async ({ page }) => {
  await page.mouse.wheel(0, 800);
  await expect(page.getByTestId("nav-dock")).toHaveAttribute(
    "data-docked",
    "true",
  );
  await page.waitForTimeout(700); // let the morph settle
  await expect(page.getByTestId("nav-dock")).toHaveScreenshot(
    "navbar-docked.png",
  );
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
  await hideHeader(page);
  await footer.scrollIntoViewIfNeeded();
  await expect(footer.getByRole("heading").first()).toBeVisible();
  await page.waitForTimeout(500);
  await expect(footer).toHaveScreenshot("footer.png");
});

// The signature wraps to two lines here, so this also guards the light staying
// on a single word instead of flooding the whole name on narrow screens.
test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  // The floating tech badges sit far enough outside the ring on a wide screen
  // that the desktop baseline says nothing about them here, where the portrait
  // shrinks and they can end up over the face.
  test("hero (mobile)", async ({ page }) => {
    const hero = page.locator("#hero");
    await settleSection(page, hero);
    await expect(hero).toHaveScreenshot("hero-mobile.png");
  });

  test("footer (mobile)", async ({ page }) => {
    const footer = page.locator("footer");
    await hideHeader(page);
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.getByRole("heading").first()).toBeVisible();
    await page.waitForTimeout(500);
    await expect(footer).toHaveScreenshot("footer-mobile.png");
  });
});

test("command palette", async ({ page }) => {
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog", { name: /command palette/i });
  await expect(dialog).toBeVisible();
  await page.waitForTimeout(300);
  await expect(dialog).toHaveScreenshot("command-palette.png");
});
