import { test, expect } from "@playwright/test";
import { enterSite } from "./intro";

async function ready(page: import("@playwright/test").Page) {
  await enterSite(page);
}

test.describe("Foundations — earlier experience certificates", () => {
  test("a Certificate button opens the shared lightbox and closes", async ({
    page,
  }) => {
    await page.goto("/#earlier");
    await ready(page);
    await page.locator("#earlier").scrollIntoViewIfNeeded();

    const certButton = page
      .locator("#earlier")
      .getByRole("button", { name: /certificate/i })
      .first();
    await expect(certButton).toBeVisible();
    await certButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("img").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
