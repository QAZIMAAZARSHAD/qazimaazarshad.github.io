import { describe, it, expect } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { GoogleMe } from "@/components/google/GoogleMe";
import { profile } from "@/data/content";

function openModal() {
  render(<GoogleMe />);
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /google me/i }));
  return screen.getByRole("dialog");
}

describe("GoogleMe", () => {
  it("opens a mock search modal with the knowledge panel and a real Google link", () => {
    const dialog = openModal();

    // Knowledge panel mirrors the Person entity.
    expect(
      within(dialog).getByRole("heading", { name: profile.name }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(`${profile.role} at ${profile.company}`),
    ).toBeInTheDocument();

    // Real Google search link, encoding the full name.
    const googleLink = within(dialog).getByRole("link", {
      name: /open in google/i,
    });
    expect(googleLink.getAttribute("href")).toContain("google.com/search");
    expect(googleLink.getAttribute("href")).toContain(
      encodeURIComponent(profile.name),
    );
  });

  it("hardens every outbound link with rel=noreferrer", () => {
    const dialog = openModal();
    for (const link of within(dialog).getAllByRole("link")) {
      if (link.getAttribute("target") === "_blank") {
        expect(link.getAttribute("rel") ?? "").toContain("noreferrer");
      }
    }
  });

  // The Wikidata item this used to cite has since been deleted.
  it("does not cite a knowledge-graph source", () => {
    const dialog = openModal();
    expect(dialog).toBeInTheDocument();
    expect(screen.queryByText(/source: wikidata/i)).toBeNull();
  });

  it("focuses the close button on open and restores focus to the trigger on close", async () => {
    render(<GoogleMe />);
    const trigger = screen.getByRole("button", { name: /google me/i });
    trigger.focus();
    fireEvent.click(trigger);

    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger).toHaveFocus();
  });
});
