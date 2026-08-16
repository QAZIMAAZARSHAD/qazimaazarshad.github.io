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

/** The role currently dealt to the front of the deck. */
function front(page: import("@playwright/test").Page) {
  return page.locator('#earlier [role="tab"][aria-selected="true"]');
}

test.describe("Foundations — the deck", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#earlier");
    await ready(page);
    await page.locator("#earlier").scrollIntoViewIfNeeded();
  });

  test("the chevrons deal forwards and back, wrapping at the ends", async ({
    page,
  }) => {
    const first = await front(page).getAttribute("aria-label");

    await page.getByRole("button", { name: "Next role" }).click();
    const second = await front(page).getAttribute("aria-label");
    expect(second).not.toBe(first);

    await page.getByRole("button", { name: "Previous role" }).click();
    await expect(front(page)).toHaveAttribute("aria-label", first!);

    // Back past the start lands on the last card rather than stopping dead.
    await page.getByRole("button", { name: "Previous role" }).click();
    const last = page.locator('#earlier [role="tab"]').last();
    await expect(last).toHaveAttribute("aria-selected", "true");
  });

  test("a swipe across the deck advances it", async ({ page }) => {
    const first = await front(page).getAttribute("aria-label");
    const stage = page.locator('#earlier [role="tabpanel"]').first();
    const box = (await stage.boundingBox())!;
    const y = box.y + box.height / 2;

    await page.mouse.move(box.x + box.width * 0.7, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.1, y, { steps: 12 });
    await page.mouse.up();

    await expect(front(page)).not.toHaveAttribute("aria-label", first!);
  });

  test("only the card at the front can be reached", async ({ page }) => {
    const panels = page.locator('#earlier [role="tabpanel"]');
    await expect(panels.first()).not.toHaveAttribute("inert", /.*/);
    await expect(panels.nth(1)).toHaveAttribute("inert", /.*/);

    // The picker is a single tab stop, not one per role.
    const tabbable = await page
      .locator('#earlier [role="tab"]')
      .evaluateAll((els) => els.filter((el) => el.tabIndex === 0).length);
    expect(tabbable).toBe(1);
  });
});
