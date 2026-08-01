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

interface StartDate {
  month: number;
  year: number;
  /** Day of month; 1 when the label carries no day. */
  day: number;
}

/**
 * Parse a start label. Accepts "Mon YYYY" ("Aug 2022") and, where the exact
 * date matters, a leading day ("22 Aug 2022"). Returns null if unparseable.
 */
function parseStart(startLabel: string): StartDate | null {
  const parts = startLabel.trim().split(/\s+/);
  const leadingDay = Number.parseInt(parts[0] ?? "", 10);
  const hasDay = !Number.isNaN(leadingDay);
  const [mon, yearStr] = hasDay ? parts.slice(1) : parts;

  const month = MONTH_ABBR.indexOf((mon ?? "").slice(0, 3).toLowerCase());
  const year = Number.parseInt(yearStr ?? "", 10);
  if (month < 0 || Number.isNaN(year)) return null;

  return { month, year, day: hasDay ? leadingDay : 1 };
}

/**
 * Live tenure label from a "Mon YYYY" start (e.g. "Mar 2026") to now, counted
 * inclusively the way LinkedIn does — so an ongoing role stays current without
 * a hardcoded duration. Returns e.g. "5 mos", "1 yr", "2 yrs 3 mos".
 * Month granularity: any day in the label is ignored, as on a CV.
 */
export function durationSince(
  startLabel: string,
  now: Date = new Date(),
): string {
  const start = parseStart(startLabel);
  if (!start) return "";
  const { month: m, year } = start;

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
 * Whole years completed since a start date, floored — so it ticks up on the
 * anniversary itself, not at the top of the anniversary month. Give it the day
 * ("22 Aug 2022") when the exact date matters; a bare "Mon YYYY" is read as the
 * 1st. Used to keep "years of experience" dynamic. Returns 0 for an
 * invalid/future start.
 */
export function completedYearsSince(
  startLabel: string,
  now: Date = new Date(),
): number {
  const start = parseStart(startLabel);
  if (!start) return 0;
  const { month: m, year, day } = start;

  let years = now.getFullYear() - year;
  const monthsIn = now.getMonth() - m;
  // Anniversary not reached yet this year: earlier month, or the right month
  // but before the day.
  if (monthsIn < 0 || (monthsIn === 0 && now.getDate() < day)) years -= 1;
  return Math.max(0, years);
}
