import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/sections/Footer";
import { profile } from "@/data/content";

describe("Footer", () => {
  it("leads with the signature name as its heading", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: profile.name }),
    ).toBeInTheDocument();
  });

  it("keeps the copyright with the current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${year} ${profile.name}`)),
    ).toBeInTheDocument();
  });

  it("no longer duplicates the navbar or repeats the build stack", () => {
    render(<Footer />);
    expect(
      screen.queryByRole("navigation", { name: /footer/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/built with/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^explore$/i)).not.toBeInTheDocument();
  });

  it("drops the redundant in-footer scroll-to-top control", () => {
    render(<Footer />);
    expect(
      screen.queryByRole("button", { name: /jump to top/i }),
    ).not.toBeInTheDocument();
  });
});
