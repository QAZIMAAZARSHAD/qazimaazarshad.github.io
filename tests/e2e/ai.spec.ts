import { test, expect } from "@playwright/test";

// Note: the actual in-browser inference needs WebGPU (not available in headless
// CI), so these tests verify the UI, wiring, and graceful fallback only — never
// the model download/inference.
test.describe("AI assistant", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page
      .locator('[data-testid="preloader"]')
      .waitFor({ state: "detached" })
      .catch(() => {});
  });

  const panel = (page: import("@playwright/test").Page) =>
    page.getByRole("dialog", { name: /ask my portfolio/i });

  test("opens from the floating launcher and shows the assistant", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /ask my portfolio/i }).click();

    await expect(panel(page)).toBeVisible();
    await expect(panel(page).getByText("Ask my portfolio")).toBeVisible();

    // Depending on WebGPU support, either the load CTA or the fallback shows.
    await expect(
      page
        .getByRole("button", { name: "Start chat" })
        .or(page.getByText(/in-browser AI needs WebGPU/i)),
    ).toBeVisible();
  });

  test("opens from the command palette and closes with Escape", async ({
    page,
  }) => {
    await page.keyboard.press("ControlOrMeta+k");
    await page.getByRole("button", { name: /ask the ai assistant/i }).click();

    await expect(panel(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();
  });
});
