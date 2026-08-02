import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwind from "../../tailwind.config.js";

const ROOT = process.cwd();
const SRC = resolve(ROOT, "src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry) ? [full] : [];
  });
}

/**
 * The resolved theme, not `theme.extend`. Reading the extension alone gets it
 * wrong in both directions: it skips shades that a built-in scale never had
 * (cyan-1000 is just as dead as accent-950), and it would quietly stop covering
 * a palette that ever moved out of `extend` — the one case where unlisted
 * shades really are deleted rather than merged.
 */
const palettes = resolveConfig(tailwind).theme.colors as unknown as Record<
  string,
  Record<string, string> | string
>;

const defines = (palette: string, shade: string): boolean => {
  const scale = palettes[palette];
  if (typeof scale !== "object") return false;
  return Object.prototype.hasOwnProperty.call(scale, shade);
};

const names = Object.keys(palettes).join("|");

/** `text-accent-400`, `bg-ink-900/40`, `from-cyan-300`. */
const CLASS = new RegExp(`-(${names})-(\\d+)`, "g");
/** `shadow-[0_0_10px_theme(colors.accent.400)]`, which the class form misses. */
const THEME = new RegExp(`theme\\(\\s*['"]?colors\\.(${names})\\.(\\d+)`, "g");

describe("colour palette", () => {
  // A shade the theme doesn't define produces no CSS at all — the element
  // silently keeps whatever it inherited. A door monogram written as
  // text-accent-950 read as pale lavender on a white wall and looked designed.
  it("never names a shade the theme doesn't define", () => {
    const scanned = [...sourceFiles(SRC), resolve(ROOT, "index.html")];

    const offenders: string[] = [];
    for (const file of scanned) {
      const source = readFileSync(file, "utf8");
      for (const pattern of [CLASS, THEME]) {
        for (const [, palette, shade] of source.matchAll(pattern)) {
          if (!defines(palette, shade)) {
            offenders.push(
              `${file.replace(ROOT + "/", "")}: ${palette}-${shade}`,
            );
          }
        }
      }
    }

    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("is scanning real files against a real theme", () => {
    expect(sourceFiles(SRC).length).toBeGreaterThan(20);
    // Invented here, so unlisted shades of it resolve to nothing.
    expect(defines("accent", "400")).toBe(true);
    expect(defines("accent", "950")).toBe(false);
    // Extends a built-in scale, which `extend` merges rather than replaces.
    expect(defines("cyan", "100")).toBe(true);
    expect(defines("cyan", "1000")).toBe(false);
  });

  // The class form would not have caught this one.
  it("reads shades named through theme() as well as through classes", () => {
    const sample = "shadow-[0_0_10px_theme(colors.accent.950)]";
    const [, palette, shade] = [...sample.matchAll(THEME)][0];
    expect([palette, shade]).toEqual(["accent", "950"]);
    expect(defines(palette, shade)).toBe(false);
  });
});
