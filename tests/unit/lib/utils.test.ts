import { describe, it, expect } from "vitest";
import { asset, cn } from "@/lib/utils";

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
