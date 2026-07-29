import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Hobbies, HOBBY_META } from "@/sections/Hobbies";
import { hobbies } from "@/data/content";
import { playStrum } from "@/lib/sound";

vi.mock("@/lib/sound", () => ({ playStrum: vi.fn() }));

describe("Hobbies", () => {
  it("renders its heading and every hobby chip", () => {
    render(<Hobbies />);
    expect(
      screen.getByRole("heading", { name: /beyond the code/i }),
    ).toBeInTheDocument();
    for (const hobby of hobbies) {
      expect(screen.getByText(hobby)).toBeInTheDocument();
    }
  });

  it("defines a HOBBY_META entry (with an effect word) for every hobby", () => {
    for (const hobby of hobbies) {
      const meta = HOBBY_META[hobby];
      expect(meta, `HOBBY_META for "${hobby}"`).toBeDefined();
      expect(meta.effect.word.trim(), `effect word for "${hobby}"`).not.toBe(
        "",
      );
      expect(meta.effect.color, `effect color for "${hobby}"`).toMatch(
        /^#[0-9a-f]{3,8}$/i,
      );
    }
  });

  it("renders the Food chip with a custom samosa icon image", () => {
    render(<Hobbies />);
    const foodButton = screen.getByRole("button", { name: /food/i });
    const img = foodButton.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toContain("samosa");
  });

  it("fires a themed impact word when a chip is clicked", () => {
    render(<Hobbies />);
    fireEvent.click(screen.getByRole("button", { name: /badminton/i }));
    expect(screen.getByText("Smash!")).toBeInTheDocument();
  });

  it("plays the strum only for the sound-enabled Music chip", () => {
    expect(HOBBY_META.Music.effect.sound).toBe(true);
    render(<Hobbies />);

    fireEvent.click(screen.getByRole("button", { name: /badminton/i }));
    expect(playStrum).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /^music/i }));
    expect(playStrum).toHaveBeenCalledTimes(1);
  });
});
