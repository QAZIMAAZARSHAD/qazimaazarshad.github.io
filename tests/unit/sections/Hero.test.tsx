import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/sections/Hero";
import { IntroProvider } from "@/components/effects/IntroProvider";
import { profile } from "@/data/content";

describe("Hero", () => {
  it("names the page once, in full, for assistive tech", () => {
    render(<Hero />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveAccessibleName(profile.name);
  });

  // The glint over the accent word is clipped to its glyphs, which means the
  // glyphs have to be there. Drawn in the markup it would repeat the word in
  // the h1 — invisible on screen, but not to anything reading the text.
  it("spells the name out exactly once in the heading text", () => {
    render(<Hero />);
    const text = screen.getByRole("heading", { level: 1 }).textContent ?? "";
    for (const word of profile.name.split(" ")) {
      expect(text.split(word).length - 1, word).toBe(2); // sr-only copy + visible
    }
  });

  it("renders the portrait and the calls to action", () => {
    render(<Hero />);
    expect(
      screen.getByAltText(`Portrait of ${profile.name}`),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /view projects/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /get in touch/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /download resume/i }),
    ).toBeInTheDocument();
  });

  it("holds the glint back until the intro hands over", () => {
    const { container } = render(
      <IntroProvider>
        <Hero />
      </IntroProvider>,
    );
    expect(container.querySelector(".qma-sheen")).toBeNull();
  });

  it("glints once the page is on screen", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector(".qma-sheen")).not.toBeNull();
  });
});
