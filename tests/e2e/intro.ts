import type { Page } from "@playwright/test";

/**
 * Open the door, skip the greeting, and wait for the intro to clear.
 *
 * Every step throws: this runs in the beforeEach of most of the suite, so a
 * broken entry has to fail here rather than surface as an unrelated assertion.
 */
export async function enterSite(
  page: Page,
  options: { keyboard?: boolean } = {},
): Promise<void> {
  const intro = page.locator('[data-testid="preloader"]');
  // Attached, not counted: after goto({ waitUntil: "commit" }) React hasn't
  // mounted, so a count reads 0 and skips the helper.
  await intro.waitFor({ state: "attached", timeout: 15_000 });

  const door = page.getByRole("button", { name: /enter the site/i });
  await door.waitFor({ timeout: 15_000 });

  if (options.keyboard) {
    // Never touches the pointer, for specs asserting on pointer-driven state.
    await page.keyboard.press("Enter");
  } else {
    await door.click({ timeout: 15_000 });
  }

  // Only the greeting can be skipped, so wait for it before cutting through.
  await page
    .getByTestId("welcome")
    .waitFor({ state: "visible", timeout: 15_000 });
  await page.keyboard.press("Escape");

  await intro.waitFor({ state: "detached", timeout: 15_000 });

  // click() leaves the pointer at viewport centre, hovering whatever page
  // content lands under it.
  if (!options.keyboard) await page.mouse.move(0, 0);
}
