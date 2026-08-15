import { test, expect, type Page } from "@playwright/test";
import { enterSite } from "./intro";

const CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

async function konami(page: Page) {
  for (const key of CODE) await page.keyboard.press(key);
}

const isOn = (page: Page) =>
  page.evaluate(() => document.documentElement.dataset.synthwave !== undefined);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await enterSite(page, { keyboard: true });
});

test("the Konami code turns the page synthwave and Escape turns it back", async ({
  page,
}) => {
  await expect(page.getByTestId("synthwave-overlay")).toBeHidden();

  await konami(page);

  await expect(page.getByTestId("synthwave-overlay")).toBeVisible();
  await expect(page.getByTestId("synthwave-scenery")).toBeVisible();
  expect(await isOn(page)).toBe(true);

  await page.keyboard.press("Escape");

  await expect(page.getByTestId("synthwave-overlay")).toBeHidden();
  expect(await isOn(page)).toBe(false);
});

test("the avatar puts its shades on", async ({ page }) => {
  const shades = page.getByTestId("pixel-shades");
  await expect(shades).toHaveCSS("opacity", "0");

  await konami(page);

  await expect(shades).toHaveCSS("opacity", "1");
});

/**
 * A filtered ancestor becomes the containing block for its fixed descendants,
 * which would silently unpin the header the moment the mode turned on.
 */
test("leaves fixed furniture pinned to the viewport", async ({ page }) => {
  await konami(page);
  const header = page.locator("header").first();

  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(400);

  const top = await header.evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBe(0);
});

test("the overlay never swallows a click", async ({ page }) => {
  await konami(page);

  await page
    .getByRole("link", { name: /view projects/i })
    .first()
    .click();

  await expect(page.locator("#projects")).toBeInViewport();
});

const palette = (page: Page) =>
  page.getByRole("textbox", { name: /search commands/i });

test("is reachable without knowing the code at all", async ({ page }) => {
  await page.keyboard.press("Control+K");
  await palette(page).fill("synthwave");
  await page.keyboard.press("Enter");

  await expect(page.getByTestId("synthwave-overlay")).toBeVisible();
});

test("typing the code into a text field does not set it off", async ({
  page,
}) => {
  await page.keyboard.press("Control+K");
  await palette(page).click();
  await konami(page);

  await expect(page.getByTestId("synthwave-overlay")).toBeHidden();
});

test("the soundtrack can be silenced without dropping the visuals", async ({
  page,
}) => {
  await konami(page);

  await page.getByRole("button", { name: /mute the soundtrack/i }).click();

  await expect(
    page.getByRole("button", { name: /unmute the soundtrack/i }),
  ).toBeVisible();
  await expect(page.getByTestId("synthwave-overlay")).toBeVisible();
});

test("reduced motion still gets the mode, minus the moving parts", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await konami(page);

  await expect(page.getByTestId("synthwave-overlay")).toBeVisible();
  await expect(page.getByTestId("pixel-shades")).toHaveCSS("opacity", "1");
});
