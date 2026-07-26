import { test, expect } from "@playwright/test";

async function ready(page: import("@playwright/test").Page) {
  await page
    .locator('[data-testid="preloader"]')
    .waitFor({ state: "detached" })
    .catch(() => {});
}

test.describe("Hobbies — cinematic click effects", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#hobbies");
    await ready(page);
    await page.locator("#hobbies").scrollIntoViewIfNeeded();
  });

  test("clicking a hobby chip fires a themed impact word that then clears", async ({
    page,
  }) => {
    await page
      .locator("#hobbies")
      .getByRole("button", { name: /badminton/i })
      .click();

    const word = page.getByText("Smash!", { exact: true });
    await expect(word).toBeVisible();

    // The overlay auto-dismisses after its lifetime.
    await expect(word).toBeHidden({ timeout: 6000 });
  });

  test.describe("tooltip clamping on a narrow screen", () => {
    test.use({ viewport: { width: 360, height: 720 } });

    test("an edge chip's tooltip stays fully within the viewport", async ({
      page,
    }) => {
      // Movies is the first (left-edge) chip — its quip used to clip.
      await page
        .locator("#hobbies")
        .getByRole("button", { name: /^movies —/i })
        .focus();

      const tip = page.locator('div[role="tooltip"]');
      await expect(tip).toBeVisible();
      await expect(tip).toContainText("Beta, tumse na ho payega.");

      const box = await tip.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(360);
    });
  });

  test("the Food chip renders a custom image icon", async ({ page }) => {
    const foodIcon = page
      .locator("#hobbies")
      .getByRole("button", { name: /food/i })
      .locator("img");
    await expect(foodIcon).toHaveAttribute("src", /samosa/);
    await expect(foodIcon).toHaveJSProperty("complete", true);
  });

  test.describe("with motion", () => {
    test.use({ reducedMotion: "no-preference" });

    test("an image-based effect (Movies) shows its projectile image", async ({
      page,
    }) => {
      await page
        .locator("#hobbies")
        .getByRole("button", { name: /^movies —/i })
        .click();

      const projectile = page.locator('img[src*="bahubali"]');
      await expect(projectile.first()).toBeVisible();
    });
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("shows the word but no projectile image", async ({ page }) => {
      await page
        .locator("#hobbies")
        .getByRole("button", { name: /^movies —/i })
        .click();

      await expect(page.getByText("Jai", { exact: false })).toBeVisible();
      await expect(page.locator('img[src*="bahubali"]')).toHaveCount(0);
    });
  });
});
