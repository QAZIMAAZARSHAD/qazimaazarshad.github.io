import { test, expect, type Page } from "@playwright/test";

/** The live result count paragraph inside the Projects section. */
const count = (page: Page) => page.locator('#projects p[aria-live="polite"]');

/** A project card is a button labelled "View details for <title>". */
const card = (page: Page, title: string) =>
  page.getByRole("button", { name: `View details for ${title}` });

/**
 * Bring the projects grid into view and wait for the first card to finish its
 * entrance animation (opacity 1). This also latches the section's "has entered"
 * state so later filter changes animate immediately.
 */
async function revealProjects(page: Page): Promise<void> {
  await page.locator("#projects").scrollIntoViewIfNeeded();
  const firstCard = page
    .getByRole("button", { name: /^View details for / })
    .first();
  await firstCard.scrollIntoViewIfNeeded();
  await expect(firstCard).toBeVisible();
  await expect(firstCard).toHaveCSS("opacity", "1");
}

test.describe("Projects — filtering, search, and detail modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await revealProjects(page);
  });

  test("shows all 23 projects initially with visible cards", async ({
    page,
  }) => {
    await expect(count(page)).toHaveText(/^23 projects$/);

    // A couple of representative cards are fully rendered (not just attached).
    await expect(
      page.getByRole("heading", { name: "Movie Streaming Website" }),
    ).toBeVisible();
    await expect(card(page, "Movie Streaming Website")).toHaveCSS(
      "opacity",
      "1",
    );
  });

  test("filtering by Game shows exactly the 4 game cards, fully visible", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Game", exact: true }).click();

    await expect(count(page)).toHaveText(/^4 projects$/);

    const gameTitles = [
      "Blackjack Game",
      "Running Car Game",
      "Kung Fu House",
      "Light Bulb On/Off",
    ];

    for (const title of gameTitles) {
      const heading = page.getByRole("heading", { name: title });
      await expect(heading).toBeVisible();
      // Guards the fixed bug: cards must be truly visible (opacity 1),
      // not invisible-but-clickable.
      await expect(card(page, title)).toHaveCSS("opacity", "1");
    }

    // A non-game project must not be rendered at all.
    await expect(
      page.getByRole("heading", { name: "Movie Streaming Website" }),
    ).toHaveCount(0);
  });

  test("searching filters the grid and clearing restores all 23", async ({
    page,
  }) => {
    const search = page.getByRole("textbox", { name: "Search projects" });

    await search.fill("react");
    await expect(count(page)).toHaveText(/^1 project$/);
    await expect(
      page.getByRole("heading", { name: "Informatica Internship Showcase" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Movie Streaming Website" }),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(search).toHaveValue("");
    await expect(count(page)).toHaveText(/^23 projects$/);
  });

  test("clicking a card opens the detail dialog and it closes cleanly", async ({
    page,
  }) => {
    const title = "Informatica Internship Showcase";
    await card(page, title).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: title })).toBeVisible();

    const openLink = dialog.getByRole("link", { name: "Open project" });
    await expect(openLink).toHaveAttribute("target", "_blank");
    await expect(openLink).toHaveAttribute("href", /^https?:\/\//);

    // Escape closes the dialog.
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);

    // Reopen, then close by clicking the backdrop (top-left, away from card).
    await card(page, title).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.mouse.click(8, 8);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("filtering then clearing restores the full, visible grid", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Game", exact: true }).click();
    await expect(count(page)).toHaveText(/^4 projects$/);

    await page.getByRole("button", { name: "All", exact: true }).click();

    await expect(count(page)).toHaveText(/^23 projects$/);
    const restoredCard = card(page, "Movie Streaming Website");
    await restoredCard.scrollIntoViewIfNeeded();
    await expect(restoredCard).toBeVisible();
    await expect(restoredCard).toHaveCSS("opacity", "1");
  });
});
