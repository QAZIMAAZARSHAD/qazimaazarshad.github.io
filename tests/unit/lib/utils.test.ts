import { describe, it, expect } from "vitest";
import { asset, cn, durationSince } from "@/lib/utils";

describe("cn", () => {
  it("merges multiple class names", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });

  it("de-duplicates conflicting Tailwind utilities, keeping the last", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm text-lg")).toBe("text-lg");
  });

  it("handles conditional / falsy values", () => {
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

  it("returns empty for an unparseable label", () => {
    expect(durationSince("whenever")).toBe("");
  });
});
