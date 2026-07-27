import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional Tailwind class names, de-duplicating conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Resolve a path inside /public against the deployment base URL.
 * Works both locally ("/") and on GitHub Pages ("/My-Portfolio/").
 * Usage: asset("images/projects/movie.jpg")
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base}${path.replace(/^\//, "")}`;
}

const MONTH_ABBR = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/**
 * Live tenure label from a "Mon YYYY" start (e.g. "Mar 2026") to now, counted
 * inclusively the way LinkedIn does — so an ongoing role stays current without
 * a hardcoded duration. Returns e.g. "5 mos", "1 yr", "2 yrs 3 mos".
 */
export function durationSince(
  startLabel: string,
  now: Date = new Date(),
): string {
  const [mon, yearStr] = startLabel.trim().split(/\s+/);
  const m = MONTH_ABBR.indexOf((mon ?? "").slice(0, 3).toLowerCase());
  const year = Number.parseInt(yearStr ?? "", 10);
  if (m < 0 || Number.isNaN(year)) return "";

  const months =
    Math.max(0, (now.getFullYear() - year) * 12 + (now.getMonth() - m)) + 1;
  const yrs = Math.floor(months / 12);
  const mos = months % 12;

  const parts: string[] = [];
  if (yrs) parts.push(`${yrs} yr${yrs > 1 ? "s" : ""}`);
  if (mos) parts.push(`${mos} mo${mos > 1 ? "s" : ""}`);
  return parts.join(" ") || "1 mo";
}

/**
 * Whole years completed since a "Mon YYYY" start (e.g. "Aug 2022"), floored —
 * i.e. it only ticks up on the anniversary month. Used to keep "years of
 * experience" dynamic. Returns 0 for an invalid/future start.
 */
export function completedYearsSince(
  startLabel: string,
  now: Date = new Date(),
): number {
  const [mon, yearStr] = startLabel.trim().split(/\s+/);
  const m = MONTH_ABBR.indexOf((mon ?? "").slice(0, 3).toLowerCase());
  const year = Number.parseInt(yearStr ?? "", 10);
  if (m < 0 || Number.isNaN(year)) return 0;

  let years = now.getFullYear() - year;
  if (now.getMonth() < m) years -= 1; // anniversary month not reached yet this year
  return Math.max(0, years);
}
