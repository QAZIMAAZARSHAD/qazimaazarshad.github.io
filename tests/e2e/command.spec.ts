import { test, expect } from "@playwright/test";

test.describe("Command palette", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page
      .locator('[data-testid="preloader"]')
      .waitFor({ state: "detached" })
      .catch(() => {});
  });

  const dialog = (page: import("@playwright/test").Page) =>
    page.getByRole("dialog", { name: /command palette/i });

  test("opens with the keyboard shortcut and closes on Escape", async ({
    page,
  }) => {
    await page.keyboard.press("ControlOrMeta+k");
    await expect(dialog(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeHidden();
  });

  test("opens from the navbar button", async ({ page }) => {
    await page
      .getByRole("button", { name: /open command palette/i })
      .first()
      .click();
    await expect(dialog(page)).toBeVisible();
  });

  test("filters commands and navigates on Enter", async ({ page }) => {
    await page.keyboard.press("ControlOrMeta+k");
    await expect(dialog(page)).toBeVisible();

    await page
      .getByRole("textbox", { name: /search commands/i })
      .fill("projects");
    await page.keyboard.press("Enter");

    await expect(dialog(page)).toBeHidden();
    await expect(page).toHaveURL(/#projects$/);
    await expect(page.locator("#projects")).toBeInViewport();
  });

  test("exposes navigation, action and social commands", async ({ page }) => {
    await page.keyboard.press("ControlOrMeta+k");
    await expect(dialog(page)).toBeVisible();

    await expect(
      page.getByRole("button", { name: /go to hobbies/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /download résumé/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /open github/i }),
    ).toBeVisible();
  });
});
