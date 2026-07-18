import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Projects } from "@/sections/Projects";
import { projects } from "@/data/content";

/** Reads the live "N project(s)" result-count text. */
function resultCount(container: HTMLElement): string {
  const el = container.querySelector('[aria-live="polite"]');
  return el?.textContent?.trim() ?? "";
}

const cardName = (title: string) => `View details for ${title}`;

const gameProject = projects.find((p) => p.category === "Game")!;
const nonGameProject = projects.find((p) => p.category !== "Game")!;
const gameCount = projects.filter((p) => p.category === "Game").length;

describe("Projects", () => {
  it("renders every project initially with the total count", () => {
    const { container } = render(<Projects />);

    expect(resultCount(container)).toBe(`${projects.length} projects`);
    expect(
      screen.getByRole("button", { name: cardName("Movie Streaming Website") }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: cardName("Blackjack Game") }),
    ).toBeInTheDocument();
  });

  it("filters to a single category when its tab is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<Projects />);

    await user.click(screen.getByRole("button", { name: "Game" }));

    expect(resultCount(container)).toBe(`${gameCount} projects`);
    expect(
      screen.getByRole("button", { name: cardName(gameProject.title) }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: cardName(nonGameProject.title) }),
    ).not.toBeInTheDocument();
  });

  it("filters by title / tech via the search box", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    await user.type(screen.getByRole("textbox", { name: "Search projects" }), "Blackjack");

    expect(
      screen.getByRole("button", { name: cardName("Blackjack Game") }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: cardName("Movie Streaming Website") }),
    ).not.toBeInTheDocument();
  });

  it("matches on tech tokens too", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    await user.type(
      screen.getByRole("textbox", { name: "Search projects" }),
      "scikit-learn",
    );

    expect(
      screen.getByRole("button", { name: cardName("YouTube Ad-view Prediction") }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: cardName("Blackjack Game") }),
    ).not.toBeInTheDocument();
  });

  it('selecting "All" restores the full list', async () => {
    const user = userEvent.setup();
    const { container } = render(<Projects />);

    await user.click(screen.getByRole("button", { name: "Game" }));
    expect(resultCount(container)).toBe(`${gameCount} projects`);

    await user.click(screen.getByRole("button", { name: "All" }));

    expect(resultCount(container)).toBe(`${projects.length} projects`);
    expect(
      screen.getByRole("button", { name: cardName(nonGameProject.title) }),
    ).toBeInTheDocument();
  });

  it("opens a detail modal for a card and closes it on Escape", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    await user.click(
      screen.getByRole("button", { name: cardName(gameProject.title) }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: gameProject.title }),
    ).toBeInTheDocument();

    const openLink = within(dialog).getByRole("link", { name: /Open project/i });
    expect(openLink).toHaveAttribute("href", gameProject.link);
    expect(openLink).toHaveAttribute("target", "_blank");

    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});
