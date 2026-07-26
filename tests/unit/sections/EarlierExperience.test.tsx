import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EarlierExperience } from "@/sections/EarlierExperience";

describe("EarlierExperience (Foundations)", () => {
  it("renders its heading", () => {
    render(<EarlierExperience />);
    expect(
      screen.getByRole("heading", { name: /earlier experience/i }),
    ).toBeInTheDocument();
  });

  it("opens a certificate in the lightbox when a Certificate button is clicked", () => {
    render(<EarlierExperience />);
    const certButtons = screen.getAllByRole("button", { name: /certificate/i });
    expect(certButtons.length).toBeGreaterThan(0);

    fireEvent.click(certButtons[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
