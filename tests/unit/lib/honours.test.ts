import { describe, it, expect } from "vitest";
import { layoutHonours, parseHonour, toHonourGroups } from "@/lib/honours";
import { achievements } from "@/data/content";

function rowsAreFull(
  placed: ReturnType<typeof layoutHonours>,
  columns: number,
  widthOf: (span: string) => number,
): boolean {
  const total = placed.reduce((sum, p) => sum + widthOf(p.span), 0);
  return total % columns === 0;
}

const lgWidth = (span: string) =>
  Number(/lg:col-span-(\d)/.exec(span)?.[1] ?? 1);
const smWidth = (span: string) => (span.includes("sm:col-span-2") ? 2 : 1);

describe("parseHonour", () => {
  it("reads a gold medal as a gold-tier mark", () => {
    const h = parseHonour("Gold Medal — International Humanity Olympiad");
    expect(h).toMatchObject({
      markKind: "medal",
      mark: "Gold",
      tier: "gold",
      title: "International Humanity Olympiad",
    });
  });

  it("lifts the rank number out and keeps it for the count-up", () => {
    const h = parseHonour("All India Rank 49 — National Engineering Olympiad");
    expect(h).toMatchObject({
      markKind: "rank",
      mark: "AIR 49",
      value: 49,
      title: "National Engineering Olympiad",
    });
  });

  it("tiers ordinal places gold, silver, then bronze", () => {
    expect(parseHonour("1st Prize — A (University Level)").tier).toBe("gold");
    expect(parseHonour("2nd Prize — B (University Level)").tier).toBe("silver");
    expect(parseHonour("3rd Prize — C (University Level)").tier).toBe("bronze");
  });

  it("pulls the competition level off the title", () => {
    const h = parseHonour("1st Prize — Inter-School Quiz (District Level)");
    expect(h.title).toBe("Inter-School Quiz");
    expect(h.level).toBe("District");
  });

  it("treats a bare title (no level) as level-less", () => {
    const h = parseHonour("2nd Prize — University-Level Quiz");
    expect(h.title).toBe("University-Level Quiz");
    expect(h.level).toBeUndefined();
  });

  it("reads 'Winner' as a first-place, gold-tier mark", () => {
    const h = parseHonour("Winner — Badminton Championship (School Level)");
    expect(h).toMatchObject({
      markKind: "place",
      tier: "gold",
      level: "School",
    });
  });

  it("keeps the raw line as the key back into the links map", () => {
    const raw = "Gold Medal — International Humanity Olympiad";
    expect(parseHonour(raw).raw).toBe(raw);
  });
});

describe("toHonourGroups", () => {
  it("buckets every achievement without dropping or duplicating one", () => {
    const groups = toHonourGroups(achievements);
    const flat = groups.flatMap((g) => g.honours.map((h) => h.raw));
    expect(flat).toHaveLength(achievements.length);
    expect(new Set(flat)).toEqual(new Set(achievements));
  });

  it("orders olympiads, competitions, then sport", () => {
    const ids = toHonourGroups(achievements).map((g) => g.id);
    expect(ids).toEqual(["olympiads", "competitions", "sport"]);
  });

  it("omits a group entirely when nothing lands in it", () => {
    const ids = toHonourGroups([
      "Gold Medal — International Humanity Olympiad",
    ]).map((g) => g.id);
    expect(ids).toEqual(["olympiads"]);
  });
});

describe("layoutHonours", () => {
  it("places every achievement exactly once", () => {
    const placed = layoutHonours(achievements);
    expect(placed).toHaveLength(achievements.length);
    expect(new Set(placed.map((p) => p.honour.raw))).toEqual(
      new Set(achievements),
    );
  });

  it("opens on the two olympiads as featured plates", () => {
    const opening = layoutHonours(achievements).slice(0, 2);
    expect(opening.map((p) => p.variant)).toEqual(["featured", "featured"]);
    expect(opening.every((p) => /olympiad/i.test(p.honour.title))).toBe(true);
  });

  // Regression: the grid used to end on an empty cell in the bottom corner.
  it("fills every row at both grid widths", () => {
    const placed = layoutHonours(achievements);
    expect(rowsAreFull(placed, 6, lgWidth)).toBe(true);
    expect(rowsAreFull(placed, 2, smWidth)).toBe(true);
  });

  it("keeps rows full as the award list grows", () => {
    const extra = [
      "1st Prize — Extra One (University Level)",
      "2nd Prize — Extra Two (School Level)",
      "3rd Prize — Extra Three (District Level)",
    ];
    for (let i = 0; i <= extra.length; i++) {
      const placed = layoutHonours([...achievements, ...extra.slice(0, i)]);
      expect(rowsAreFull(placed, 6, lgWidth), `with ${i} extra`).toBe(true);
      expect(rowsAreFull(placed, 2, smWidth), `with ${i} extra`).toBe(true);
    }
  });
});
