import type { Page } from "@playwright/test";

/**
 * Get past the entry sequence and onto the page.
 *
 * The intro is a door the visitor opens (which is what lets the browser play
 * the music) followed by a greeting. Tests that aren't about the intro itself
 * open the door, skip the greeting, and wait for the overlay to go — which is
 * also far quicker than sitting through all of it.
 *
 * Safe to call on any page load: if the intro has already gone, this is a no-op.
 */
export async function enterSite(
  page: Page,
  options: { keyboard?: boolean } = {},
): Promise<void> {
  const intro = page.locator('[data-testid="preloader"]');
  if ((await intro.count()) === 0) return;

  const door = page.getByRole("button", { name: /enter the site/i });
  await door.waitFor({ timeout: 15_000 }).catch(() => {});

  if (options.keyboard) {
    // The door takes focus on arrival, so this never touches the pointer —
    // which matters for anything asserting on pointer-driven behaviour.
    await page.keyboard.press("Enter").catch(() => {});
  } else {
    await door.click({ timeout: 15_000 }).catch(() => {});
  }

  // The door plays a brief opening first, and only the greeting can be
  // skipped — so wait for it to arrive before cutting through.
  await page
    .getByTestId("welcome")
    .waitFor({ state: "visible", timeout: 15_000 })
    .catch(() => {});
  await page.keyboard.press("Escape").catch(() => {});

  await intro.waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});
}
