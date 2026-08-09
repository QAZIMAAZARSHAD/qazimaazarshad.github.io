import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Education } from "@/sections/Education";
import { education } from "@/data/content";

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...actual, useReducedMotion: () => true };
});

const rows = () => within(screen.getByRole("list")).getAllByRole("listitem");

describe("Education", () => {
  it("keeps every qualification, in the order the data gives them", () => {
    render(<Education />);
    const listed = rows();
    expect(listed).toHaveLength(education.length);
    for (const [i, item] of education.entries()) {
      expect(listed[i]).toHaveTextContent(item.degree);
      expect(listed[i]).toHaveTextContent(item.institution);
      expect(listed[i]).toHaveTextContent(item.score);
    }
  });

  // A list, not a grid of cards: the entries run in time order, and that order
  // is the point of the section.
  it("presents them as an ordered record", () => {
    render(<Education />);
    expect(screen.getByRole("list").tagName).toBe("OL");
  });

  it("still titles each qualification as a heading", () => {
    render(<Education />);
    for (const item of education) {
      expect(
        screen.getByRole("heading", { name: item.degree }),
      ).toBeInTheDocument();
    }
  });

  // Only the finishing year is drawn large, so the full period has to reach
  // assistive tech some other way or the range is lost to it.
  it("gives the whole period to assistive tech, not just the year shown", () => {
    render(<Education />);
    for (const [i, item] of education.entries()) {
      expect(rows()[i]).toHaveTextContent(item.period);
    }
  });

  it("marks where a period is a span rather than a single year", () => {
    render(<Education />);
    const ranged = education.filter(
      (item) => (item.period.match(/\d{4}/g) ?? []).length > 1,
    );
    for (const item of ranged) {
      const start = item.period.match(/\d{4}/)?.[0];
      expect(screen.getByText(`from ${start}`)).toBeInTheDocument();
    }
  });

  // Scoped per row rather than looked up by name: two entries share both an
  // institution and a link, so either lookup matches more than one of them.
  it("opens each institution safely, and says which record it is", () => {
    render(<Education />);
    const listed = rows();
    for (const [i, item] of education.entries()) {
      if (!item.link) continue;
      const link = within(listed[i]).getByRole("link");
      expect(link).toHaveAttribute("href", item.link);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute(
        "rel",
        expect.stringContaining("noreferrer"),
      );
      // The degree is the only thing separating the two Barrows entries.
      expect(link.getAttribute("aria-label")).toContain(item.degree);
    }
  });

  // Stated by the data, not alongside it — a fourth entry has to widen this on
  // its own rather than leave the header quietly wrong.
  it("sums the record from the entries themselves", () => {
    render(<Education />);
    const years = education
      .flatMap((item) => item.period.match(/\d{4}/g) ?? [])
      .sort();
    expect(
      screen.getByText(
        `${education.length} records · ${years[0]} — ${years[years.length - 1]}`,
      ),
    ).toBeInTheDocument();
  });
});
