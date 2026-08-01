import { describe, it, expect } from "vitest";
import { asset, cn, durationSince, completedYearsSince } from "@/lib/utils";

describe("cn", () => {
  it("merges multiple class names", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });

  it("de-duplicates conflicting Tailwind utilities, keeping the last", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm text-lg")).toBe("text-lg");
  });

  it("handles conditional / falsy values", () => {
    // The constant is the point: `cond && "class"` is how callers write this,
    // and cn has to drop the false.
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn("base", false && "hidden", null, undefined, "active")).toBe(
      "base active",
    );
    expect(cn("a", { b: true, c: false })).toBe("a b");
  });
});

describe("asset", () => {
  const base = import.meta.env.BASE_URL;

  it("prefixes the deployment BASE_URL", () => {
    expect(asset("images/x.png")).toBe(`${base}images/x.png`);
  });

  it("strips a leading slash so relative and absolute inputs match", () => {
    expect(asset("/images/x.png")).toBe(asset("images/x.png"));
  });

  it("result always begins with BASE_URL", () => {
    expect(asset("resume/cv.pdf").startsWith(base)).toBe(true);
  });
});

describe("durationSince", () => {
  it("counts months inclusively like LinkedIn", () => {
    expect(durationSince("Mar 2026", new Date(2026, 6, 15))).toBe("5 mos");
  });

  it("uses singular units and combines years + months", () => {
    expect(durationSince("Mar 2026", new Date(2026, 2, 1))).toBe("1 mo");
    expect(durationSince("Mar 2025", new Date(2026, 2, 1))).toBe("1 yr 1 mo");
    expect(durationSince("Jan 2024", new Date(2026, 0, 1))).toBe("2 yrs 1 mo");
  });

  it("ignores a day in the label, as a CV would", () => {
    expect(durationSince("22 Aug 2022", new Date(2022, 7, 1))).toBe(
      durationSince("Aug 2022", new Date(2022, 7, 1)),
    );
  });

  it("returns empty for an unparseable label", () => {
    expect(durationSince("whenever")).toBe("");
  });
});

describe("completedYearsSince", () => {
  it("ticks up on the anniversary itself, not at the top of that month", () => {
    // 22 Aug 2022 start:
    expect(completedYearsSince("22 Aug 2022", new Date(2026, 6, 27))).toBe(3); // Jul 2026
    expect(completedYearsSince("22 Aug 2022", new Date(2026, 7, 1))).toBe(3); // 1 Aug — not yet
    expect(completedYearsSince("22 Aug 2022", new Date(2026, 7, 21))).toBe(3); // day before
    expect(completedYearsSince("22 Aug 2022", new Date(2026, 7, 22))).toBe(4); // the day
    expect(completedYearsSince("22 Aug 2022", new Date(2026, 8, 3))).toBe(4); // after
    expect(completedYearsSince("22 Aug 2022", new Date(2023, 6, 1))).toBe(0); // <1
  });

  it("reads a day-less label as the 1st", () => {
    expect(completedYearsSince("Aug 2022", new Date(2026, 7, 1))).toBe(4);
    expect(completedYearsSince("Aug 2022", new Date(2026, 6, 31))).toBe(3);
  });

  it("returns 0 for an unparseable label", () => {
    expect(completedYearsSince("whenever")).toBe(0);
    expect(completedYearsSince("22 whenever 2022")).toBe(0);
  });
});
