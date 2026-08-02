import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import tailwind from "../../tailwind.config.js";
import defaultColors from "tailwindcss/colors";

const SRC = resolve(process.cwd(), "src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry) ? [full] : [];
  });
}

const extended = (tailwind.theme?.extend?.colors ?? {}) as Record<
  string,
  Record<string, string>
>;

/**
 * Only palettes invented here can produce a dead class. `extend` merges with
 * Tailwind's defaults, so a name it already ships — cyan — keeps its whole
 * scale, and listing two shades doesn't remove the rest. `accent` and `ink`
 * exist nowhere else, so an unlisted shade of those resolves to nothing.
 */
const builtIn = new Set(Object.keys(defaultColors));
const palettes = Object.fromEntries(
  Object.entries(extended).filter(([name]) => !builtIn.has(name)),
);

describe("colour palette", () => {
  // A shade that isn't in the config produces no CSS at all — the element
  // silently keeps whatever it inherited. A door monogram written as
  // text-accent-950 read as pale lavender on a white wall and looked designed.
  it("never names a shade the config doesn't define", () => {
    const names = Object.keys(palettes).join("|");
    const used = new RegExp(`-(${names})-(\\d+)`, "g");

    const offenders: string[] = [];
    for (const file of sourceFiles(SRC)) {
      const source = readFileSync(file, "utf8");
      for (const [, palette, shade] of source.matchAll(used)) {
        if (!palettes[palette][shade]) {
          offenders.push(`${file.replace(SRC, "src")}: ${palette}-${shade}`);
        }
      }
    }

    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("is actually scanning something", () => {
    expect(sourceFiles(SRC).length).toBeGreaterThan(20);
    expect(Object.keys(palettes)).toContain("accent");
    expect(Object.keys(palettes)).toContain("ink");
    // cyan extends a built-in scale, so it is deliberately not audited.
    expect(Object.keys(palettes)).not.toContain("cyan");
  });
});
