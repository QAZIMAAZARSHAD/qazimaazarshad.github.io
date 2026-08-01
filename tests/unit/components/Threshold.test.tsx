import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Threshold } from "@/components/threshold/Threshold";
import { earliestYear, education, projects } from "@/data/content";

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
    render(<Threshold />);
    expect(screen.getByTestId("threshold-year")).toHaveTextContent(
      String(earliestYear),
    );
  });

  it("keeps the scenery and the year out of the accessibility tree", () => {
    const { container } = render(<Threshold />);

    // The year is decoration — the prose already states the range — and the
    // floor, horizon and glow are pure scenery.
    expect(screen.getByTestId("threshold-year")).toHaveAttribute("aria-hidden");
    expect(
      screen.queryByRole("paragraph", { name: String(earliestYear) }),
    ).toBeNull();

    const section = container.querySelector("section")!;
    const scenery = [...section.children].filter(
      (el) => el.tagName !== "DIV" || !el.querySelector("h2"),
    );
    expect(scenery.length).toBeGreaterThan(0);
    for (const el of section.querySelectorAll(
      ":scope > div:not(:last-child)",
    )) {
      expect(el).toHaveAttribute("aria-hidden");
    }
  });
});

describe("earliestYear", () => {
  // Stated outright rather than recomputed from `education`: re-deriving it
  // here would move with the data and could never disagree with it, which is
  // the disagreement worth catching.
  it("is 2016, the oldest year the sections below the line show", () => {
    expect(earliestYear).toBe(2016);
    expect(education.some((item) => item.period.includes("2016"))).toBe(true);
  });

  it("never reaches further back than the content it stands for", () => {
    const years = education.flatMap((item) =>
      [...item.period.matchAll(/\d{4}/g)].map((m) => Number(m[0])),
    );
    expect(earliestYear).toBe(Math.min(...years));
  });

  // The copy's other end — "the newest is from this year" — has nothing
  // deriving it, so it would quietly go stale the moment the newest project
  // did. This is what keeps that half of the sentence honest.
  it("has something below the line that really is from this year", () => {
    const thisYear = String(new Date().getFullYear());
    expect(
      projects.some((project) => project.date.includes(thisYear)),
      `a project dated ${thisYear}`,
    ).toBe(true);
  });
});
