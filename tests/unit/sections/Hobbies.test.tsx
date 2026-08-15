import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Hobbies, HOBBY_META } from "@/sections/Hobbies";
import { hobbies } from "@/data/content";
import { playStrum } from "@/lib/sound";

vi.mock("@/lib/sound", () => ({ playStrum: vi.fn() }));

describe("Hobbies", () => {
  it("renders its heading and every hobby", () => {
    render(<Hobbies />);
    expect(
      screen.getByRole("heading", { name: /beyond the code/i }),
    ).toBeInTheDocument();
    for (const hobby of hobbies) {
      expect(screen.getByText(hobby)).toBeInTheDocument();
    }
  });

  it("shows each hobby's blurb under its label", () => {
    render(<Hobbies />);
    for (const hobby of hobbies) {
      expect(
        screen.getByText(HOBBY_META[hobby].blurb),
        `blurb for "${hobby}"`,
      ).toBeInTheDocument();
    }
  });

  it("carries each hobby's quip as a tooltip", () => {
    render(<Hobbies />);
    const tips = screen.getAllByRole("tooltip");
    const text = tips.map((t) => t.textContent).join(" ");
    for (const hobby of hobbies) {
      expect(text, `quip for "${hobby}"`).toContain(HOBBY_META[hobby].quip);
    }
  });

  it("names each hobby by its blurb for assistive tech", () => {
    render(<Hobbies />);
    expect(
      screen.getByRole("button", { name: /^movies:/i }),
    ).toHaveAccessibleName(`Movies: ${HOBBY_META.Movies.blurb}`);
  });

  it("carries the closing quote", () => {
    render(<Hobbies />);
    expect(
      screen.getByText(/hobbies don.t just fill time/i),
    ).toBeInTheDocument();
  });

  it("defines a HOBBY_META entry (with an effect word and blurb) for every hobby", () => {
    for (const hobby of hobbies) {
      const meta = HOBBY_META[hobby];
      expect(meta, `HOBBY_META for "${hobby}"`).toBeDefined();
      expect(meta.effect.word.trim(), `effect word for "${hobby}"`).not.toBe(
        "",
      );
      expect(meta.blurb.trim(), `blurb for "${hobby}"`).not.toBe("");
      expect(meta.effect.color, `effect color for "${hobby}"`).toMatch(
        /^#[0-9a-f]{3,8}$/i,
      );
    }
  });

  it("renders Food with a custom samosa icon image", () => {
    render(<Hobbies />);
    const foodButton = screen.getByRole("button", { name: /^food:/i });
    const img = foodButton.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toContain("samosa");
  });

  it("fires a themed impact word when a hobby is clicked", () => {
    render(<Hobbies />);
    fireEvent.click(screen.getByRole("button", { name: /^badminton:/i }));
    expect(screen.getByText("Smash!")).toBeInTheDocument();
  });

  it("plays the strum only for the sound-enabled Music hobby", () => {
    expect(HOBBY_META.Music.effect.sound).toBe(true);
    render(<Hobbies />);

    fireEvent.click(screen.getByRole("button", { name: /^badminton:/i }));
    expect(playStrum).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /^music:/i }));
    expect(playStrum).toHaveBeenCalledTimes(1);
  });
});
