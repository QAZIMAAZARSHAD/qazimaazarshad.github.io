import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Achievements } from "@/sections/Achievements";

describe("Achievements", () => {
  it("renders its heading", () => {
    render(<Achievements />);
    expect(
      screen.getByRole("heading", { name: /awards & achievements/i }),
    ).toBeInTheDocument();
  });

  it("opens a certificate lightbox when a linked achievement is clicked", () => {
    render(<Achievements />);
    fireEvent.click(
      screen.getByRole("button", { name: /national engineering olympiad/i }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows a two-image gallery for the Gold Medal (photo + certificate)", () => {
    render(<Achievements />);
    fireEvent.click(
      screen.getByRole("button", { name: /international humanity olympiad/i }),
    );
    expect(screen.getAllByRole("button", { name: /view image/i })).toHaveLength(
      2,
    );
  });
});
