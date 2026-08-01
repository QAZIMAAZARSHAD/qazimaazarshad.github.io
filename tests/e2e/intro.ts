import type { Page } from "@playwright/test";

/**
 * Get past the entry sequence and onto the page.
 *
 * The intro is a door the visitor opens (which is what lets the browser play
 * the music) followed by a greeting. Tests that aren't about the intro itself
 * open the door, skip the greeting, and wait for the overlay to go — which is
 * also far quicker than sitting through all of it.
 *
 * Every step throws on failure. This runs in the beforeEach of most of the
 * suite, so if entry breaks, it has to say so here rather than let each spec
 * die later on an unrelated assertion.
 */
export async function enterSite(
  page: Page,
  options: { keyboard?: boolean } = {},
): Promise<void> {
  const intro = page.locator('[data-testid="preloader"]');
  // Attached, not counted: after goto({ waitUntil: "commit" }) React hasn't
  // mounted yet, so a count would read 0 and skip the whole helper.
  await intro.waitFor({ state: "attached", timeout: 15_000 });

  const door = page.getByRole("button", { name: /enter the site/i });
  await door.waitFor({ timeout: 15_000 });

  if (options.keyboard) {
    // The door takes focus on arrival, so this never touches the pointer —
    // which matters for anything asserting on pointer-driven behaviour.
    await page.keyboard.press("Enter");
  } else {
    await door.click({ timeout: 15_000 });
  }

  // The door plays a brief opening first, and only the greeting can be
  // skipped — so wait for it to arrive before cutting through.
  await page
    .getByTestId("welcome")
    .waitFor({ state: "visible", timeout: 15_000 });
  await page.keyboard.press("Escape");

  await intro.waitFor({ state: "detached", timeout: 15_000 });

  // Park the pointer out of the way. door.click() leaves it at viewport
  // centre, where it sits over page content and hovers whatever lands there —
  // which silently baked a hovered project card into a visual baseline.
  if (!options.keyboard) await page.mouse.move(0, 0);
}
