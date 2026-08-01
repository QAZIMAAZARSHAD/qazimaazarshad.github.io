import { test, expect } from "@playwright/test";
import { enterSite } from "./intro";

async function ready(page: import("@playwright/test").Page) {
  await enterSite(page);
}

test.describe("Google Me", () => {
  test("opens a mock SERP with results, a knowledge panel, and a real Google link", async ({
    page,
  }) => {
    await page.goto("/");
    await ready(page);

    const trigger = page.getByRole("button", { name: /google me/i });
    await trigger.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // The rest of the app is inert while the modal is open.
    await expect(page.locator("#root")).toHaveAttribute("inert", "");

    // Knowledge panel mirrors the Person entity.
    await expect(
      dialog.getByRole("heading", { name: "Qazi Maaz Arshad" }),
    ).toBeVisible();
    await expect(
      dialog.getByText(/Software Engineer at Salesforce/i).first(),
    ).toBeVisible();

    // An organic result (scoped to the results list) links out.
    await expect(
      dialog.locator("ol").getByRole("link", { name: /LinkedIn/i }),
    ).toBeVisible();

    // The real Google search opens in a new tab.
    const googleLink = dialog.getByRole("link", { name: /open in google/i });
    await expect(googleLink).toHaveAttribute("href", /google\.com\/search/);
    await expect(googleLink).toHaveAttribute("target", "_blank");

    // Closing restores focus to the trigger (WCAG 2.4.3).
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.locator("#root")).not.toHaveAttribute("inert", "");
    await expect(trigger).toBeFocused();
  });
});
