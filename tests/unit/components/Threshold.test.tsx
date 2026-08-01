import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Threshold } from "@/components/threshold/Threshold";
import { earliestYear, education } from "@/data/content";

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...actual, useReducedMotion: () => true };
});

describe("Threshold", () => {
  it("marks the line between working life and everything before it", () => {
    render(<Threshold />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Where the habit started",
    );
    expect(screen.getByText(/nobody asked me to build/i)).toBeInTheDocument();
  });

  // Some of what sits below is recent hobby work rather than university work,
  // so the copy has to cover both or it misrepresents the projects.
  it("says the years below span both ends, not just university", () => {
    render(<Threshold />);
    const copy =
      screen.getByText(/nobody asked me to build/i).textContent ?? "";
    expect(copy).toContain(String(earliestYear));
    expect(copy).toMatch(/from this year/i);
  });

  it("leads somewhere — the first section past the line", () => {
    render(<Threshold />);
    expect(screen.getByRole("link", { name: /keep going/i })).toHaveAttribute(
      "href",
      "#earlier",
    );
  });

  it("lands on the far year immediately under reduced motion", () => {
    const { container } = render(<Threshold />);
    const year = container.querySelector("p[aria-hidden]");
    expect(year).toHaveTextContent(String(earliestYear));
  });

  it("keeps the scenery and the year out of the accessibility tree", () => {
    const { container } = render(<Threshold />);
    // The year is decoration: the paragraph already states the range in prose.
    expect(container.querySelector("p[aria-hidden]")).toBeTruthy();
  });
});

describe("earliestYear", () => {
  // Hardcoding the year would let the divider claim a date the sections below
  // it don't actually support.
  it("is the oldest year any education entry mentions", () => {
    const years = education.flatMap((item) =>
      [...item.period.matchAll(/\d{4}/g)].map((m) => Number(m[0])),
    );
    expect(earliestYear).toBe(Math.min(...years));
    expect(earliestYear).toBeLessThan(new Date().getFullYear());
  });

  // Math.min() of an empty list is Infinity, which the copy would print
  // verbatim and the counter would wind towards forever.
  it("is a real year, never Infinity", () => {
    expect(Number.isFinite(earliestYear)).toBe(true);
    expect(earliestYear).toBeGreaterThan(1900);
  });
});
