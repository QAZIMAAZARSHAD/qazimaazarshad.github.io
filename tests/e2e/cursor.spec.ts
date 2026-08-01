import { test, expect } from "@playwright/test";
import { enterSite } from "./intro";

/**
 * Enter from the keyboard, so the pointer has genuinely not moved yet — these
 * tests assert on exactly that.
 */
async function ready(page: import("@playwright/test").Page) {
  await enterSite(page, { keyboard: true });
}

test.describe("Custom cursor", () => {
  test("activates on a mouse device and tracks hover + click", async ({
    page,
  }) => {
    await page.goto("/");
    await ready(page);

    const ring = page.locator(".qma-cursor-ring");
    await expect(ring).toHaveCount(1);

    // The native cursor is only taken over once the pointer actually moves.
    await expect(page.locator("html")).not.toHaveClass(/qma-cursor-active/);
    await page.mouse.move(200, 200, { steps: 2 });
    await expect(page.locator("html")).toHaveClass(/qma-cursor-active/);

    const button = page.getByRole("link", { name: /view projects/i });
    const btnBox = await button.boundingBox();
    await page.mouse.move(
      btnBox!.x + btnBox!.width / 2,
      btnBox!.y + btnBox!.height / 2,
      { steps: 4 },
    );
    await expect(ring).toHaveAttribute("data-hover", "true");

    const heading = page.getByRole("heading", { level: 1 });
    const hBox = await heading.boundingBox();
    await page.mouse.move(hBox!.x + 10, hBox!.y + hBox!.height / 2, {
      steps: 4,
    });
    await expect(ring).toHaveAttribute("data-hover", "false");

    await page.mouse.down();
    await expect(ring).toHaveAttribute("data-active", "true");
    await page.mouse.up();
    await expect(ring).toHaveAttribute("data-active", "false");
  });

  test.describe("touch device", () => {
    test.use({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });

    test("does not take over the native cursor", async ({ page }) => {
      await page.goto("/");
      await ready(page);
      await expect(page.locator("html")).not.toHaveClass(/qma-cursor-active/);
    });
  });

  test("renders no custom cursor layer under reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await ready(page);
    await expect(page.locator(".qma-cursor-layer")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveClass(/qma-cursor-active/);
  });
});
