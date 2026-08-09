/**
 * Derives the shape of an award card from the `achievements` strings, which
 * stay the source of truth — the AI context reads them and `achievementLinks`
 * is keyed by them.
 */

export type MarkKind = "medal" | "rank" | "place";

export type Tier = "gold" | "silver" | "bronze" | "accent";

export interface Honour {
  /** Still the key into `achievementLinks`. */
  readonly raw: string;
  readonly markKind: MarkKind;
  readonly mark: string;
  readonly tier: Tier;
  readonly value?: number;
  readonly title: string;
  readonly level?: Level;
  readonly group: HonourGroupId;
}

export type Level =
  "School" | "District" | "University" | "National" | "International";

export type HonourGroupId = "olympiads" | "competitions" | "sport";

export interface HonourGroup {
  readonly id: HonourGroupId;
  readonly label: string;
  readonly honours: readonly Honour[];
}

const GROUP_ORDER: ReadonlyArray<{ id: HonourGroupId; label: string }> = [
  { id: "olympiads", label: "Olympiads" },
  { id: "competitions", label: "Competitions" },
  { id: "sport", label: "Sport" },
];

const LEVEL = /\((School|District|University)[^)]*\)\s*$/i;

const PLACE_TIER: Record<number, Tier> = {
  1: "gold",
  2: "silver",
  3: "bronze",
};

/** Olympiads state their reach in the title rather than a trailing "(…)". */
const SCOPE = /^(International|National)\b/i;

function splitLevel(text: string): { title: string; level?: Level } {
  const match = LEVEL.exec(text);
  if (!match) {
    const title = text.trim();
    const scope = SCOPE.exec(title)?.[1];
    return {
      title,
      level: scope
        ? ((scope[0].toUpperCase() + scope.slice(1).toLowerCase()) as Level)
        : undefined,
    };
  }
  const level = (match[1][0].toUpperCase() +
    match[1].slice(1).toLowerCase()) as Level;
  return { title: text.slice(0, match.index).trim(), level };
}

function groupOf(honour: Omit<Honour, "group">): HonourGroupId {
  if (/olympiad/i.test(honour.title)) return "olympiads";
  if (/badminton|swimming|cricket/i.test(honour.title)) return "sport";
  return "competitions";
}

export function parseHonour(raw: string): Honour {
  const honour = describe(raw);
  return { ...honour, group: groupOf(honour) };
}

function describe(raw: string): Omit<Honour, "group"> {
  const [prefix, rest = ""] = raw.split(" — ");
  const { title, level } = splitLevel(rest);

  if (/gold/i.test(prefix)) {
    return { raw, markKind: "medal", mark: "Gold", tier: "gold", title, level };
  }

  const rank = /rank\s+(\d+)/i.exec(prefix);
  if (rank) {
    return {
      raw,
      markKind: "rank",
      mark: `AIR ${rank[1]}`,
      tier: "accent",
      value: Number(rank[1]),
      title,
      level,
    };
  }

  const place = /^(\d+)(?:st|nd|rd|th)\b/i.exec(prefix);
  if (place) {
    const tier = PLACE_TIER[Number(place[1])] ?? "bronze";
    return { raw, markKind: "place", mark: place[0], tier, title, level };
  }

  // "Winner" and any other first-place phrasing.
  return { raw, markKind: "place", mark: "Won", tier: "gold", title, level };
}

export function toHonourGroups(achievements: readonly string[]): HonourGroup[] {
  const buckets = new Map<HonourGroupId, Honour[]>();
  for (const raw of achievements) {
    const honour = parseHonour(raw);
    const id = groupOf(honour);
    const bucket = buckets.get(id);
    if (bucket) bucket.push(honour);
    else buckets.set(id, [honour]);
  }

  return GROUP_ORDER.flatMap(({ id, label }) => {
    const honours = buckets.get(id);
    return honours && honours.length > 0 ? [{ id, label, honours }] : [];
  });
}

export function toHonourList(achievements: readonly string[]): Honour[] {
  return toHonourGroups(achievements).flatMap((group) => [...group.honours]);
}

export type CardVariant = "featured" | "compact";

export interface PlacedHonour {
  readonly honour: Honour;
  readonly variant: CardVariant;
  readonly span: string;
}

function plateSpan(index: number, count: number): string {
  const lonely = count % 2 === 1 && index === count - 1;
  return lonely ? "sm:col-span-2 lg:col-span-6" : "sm:col-span-2 lg:col-span-3";
}

function compactSpan(index: number, count: number): string {
  const last = index === count - 1;
  const lastTwo = index >= count - 2;

  let lg = "lg:col-span-2";
  if (count % 3 === 1 && last) lg = "lg:col-span-6";
  else if (count % 3 === 2 && lastTwo) lg = "lg:col-span-3";

  return count % 2 === 1 && last ? `sm:col-span-2 ${lg}` : lg;
}

/**
 * Spans are derived from the counts rather than hand-placed, so adding or
 * removing an award can't strand an empty cell in the corner of the grid.
 */
export function layoutHonours(achievements: readonly string[]): PlacedHonour[] {
  const list = toHonourList(achievements);

  const featured = list.filter((h) => h.group === "olympiads");
  const compact = list.filter((h) => h.group !== "olympiads");

  return [
    ...featured.map((honour, i) => ({
      honour,
      variant: "featured" as const,
      span: plateSpan(i, featured.length),
    })),
    ...compact.map((honour, i) => ({
      honour,
      variant: "compact" as const,
      span: compactSpan(i, compact.length),
    })),
  ];
}
