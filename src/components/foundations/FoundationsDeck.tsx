import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import {
  BadgeCheck,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock,
  Cloud,
  Code2,
  Database,
  ExternalLink,
  FolderGit2,
  GitPullRequest,
  Globe,
  Compass,
  Megaphone,
  Rocket,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { LogoTile } from "@/components/timeline/LogoTile";
import type { ExperienceItem, RoleMetric } from "@/data/content";
import { EASE_GLIDE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Cards beyond this many places from the front are parked out of sight. */
const VISIBLE_DEPTH = 2;

type IconComponent = ComponentType<{ className?: string }>;

type CategoryId = "Open Source" | "Externship" | "Ambassador" | "Community";

interface Category {
  id: CategoryId;
  Icon: IconComponent;
  /** Category pill on a card. */
  pill: string;
  /** Featured badge + emblem ring + metric icons. */
  accentText: string;
  ring: string;
  wash: string;
  tick: string;
  /** Top rule on the spotlight card. */
  rule: string;
}

const CATEGORIES: Record<CategoryId, Category> = {
  "Open Source": {
    id: "Open Source",
    Icon: Code2,
    pill: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    accentText: "text-emerald-300",
    ring: "ring-emerald-400/50",
    wash: "bg-emerald-500/20",
    tick: "bg-emerald-400",
    rule: "from-emerald-400/80",
  },
  Externship: {
    id: "Externship",
    Icon: Briefcase,
    pill: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
    accentText: "text-cyan-300",
    ring: "ring-cyan-400/50",
    wash: "bg-cyan-500/20",
    tick: "bg-cyan-400",
    rule: "from-cyan-400/80",
  },
  Ambassador: {
    id: "Ambassador",
    Icon: Megaphone,
    pill: "border-accent-400/30 bg-accent-500/10 text-accent-200",
    accentText: "text-accent-300",
    ring: "ring-accent-400/50",
    wash: "bg-accent-500/20",
    tick: "bg-accent-400",
    rule: "from-accent-400/80",
  },
  Community: {
    id: "Community",
    Icon: Users,
    pill: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200",
    accentText: "text-fuchsia-300",
    ring: "ring-fuchsia-400/50",
    wash: "bg-fuchsia-500/20",
    tick: "bg-fuchsia-400",
    rule: "from-fuchsia-400/80",
  },
};

/** The raw `type` on the data is itself the filterable bucket. */
function categoryOf(type: string): Category {
  return CATEGORIES[type as CategoryId] ?? CATEGORIES.Externship;
}

/** A themed icon for a metric, chosen from words already in its label. */
function iconForMetric(label: string): IconComponent {
  const l = label.toLowerCase();
  if (/\bprs?\b|merged/.test(l)) return GitPullRequest;
  if (/issue/.test(l)) return CircleDot;
  if (/rank/.test(l)) return Trophy;
  if (/workshop|event|edition/.test(l)) return Calendar;
  if (/duration|program|tenure|month|\bmo\b|\byr\b|year|day/.test(l))
    return Clock;
  if (/contributor|team|applicant|peer|student|registration|role/.test(l))
    return Users;
  if (/campaign|drive|sponsor/.test(l)) return Megaphone;
  if (/model|row|data/.test(l)) return Database;
  if (/site|website|domain/.test(l)) return Globe;
  if (/sales|lift/.test(l)) return TrendingUp;
  if (/cloud|azure|security/.test(l)) return Cloud;
  if (/\bapps?\b|portal|screen|shipped/.test(l)) return Rocket;
  if (/project/.test(l)) return FolderGit2;
  if (/tech|commerce/.test(l)) return Code2;
  return Sparkles;
}

// Quantified tokens: "Top-30", "~10%", "150+", "5–6", "25,000", or a bare
// number. The look-behind/ahead keep it off number–letter blends like "2k19".
/** Static class names so Tailwind can see every column count it must emit. */
const SM_COLUMNS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

const HIGHLIGHT =
  /(Top-\d+|(?<![A-Za-z])~?\d[\d,]*(?:[–-]\d+)?\+?%?(?![A-Za-z]))/g;

/**
 * Emphasises the quantified claims already written into a description —
 * "150+", "35%", "Top-30" — so the impact reads at a glance. It only ever
 * restyles text that is there; it never adds or changes a number.
 */
function highlight(text: string, className: string): ReactNode[] {
  return text.split(HIGHLIGHT).map((chunk, i) =>
    // Odd indices are the captured matches.
    i % 2 === 1 ? (
      <span key={`${chunk}-${i}`} className={cn("font-semibold", className)}>
        {chunk}
      </span>
    ) : (
      <span key={`t-${i}`}>{chunk}</span>
    ),
  );
}

/** Where a card sits given its distance from the front of the deck. */
function slotFor(distance: number, reduce: boolean) {
  if (reduce) {
    return { x: "0%", z: 0, rotateY: 0, opacity: distance === 0 ? 1 : 0 };
  }
  const side = Math.sign(distance);
  const steps = Math.min(Math.abs(distance), VISIBLE_DEPTH);
  return {
    // Thrown well clear of the front card so a neighbour's near edge never
    // overlaps it, and dimmed hard so the stack reads as background.
    x: `${side * steps * 104}%`,
    z: -steps * 240,
    rotateY: -side * steps * 30,
    opacity: Math.abs(distance) > VISIBLE_DEPTH ? 0 : 1 - steps * 0.55,
  };
}

function MetricGrid({
  metrics,
  category,
}: {
  readonly metrics: RoleMetric[];
  readonly category: Category;
}) {
  return (
    <div
      className={cn(
        // Hairline dividers come from the container showing through a 1px gap.
        // Two-up on a phone so labels have room to read in full; one row once
        // there is width for it.
        "grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10",
        SM_COLUMNS[Math.min(metrics.length, 4)],
      )}
    >
      {metrics.map((metric) => {
        const Icon = iconForMetric(metric.label);
        return (
          <div
            key={metric.label}
            className="flex min-w-0 flex-col gap-1 bg-ink-900 px-3 py-2.5"
          >
            <Icon
              className={cn("h-3.5 w-3.5", category.accentText)}
              aria-hidden
            />
            <span className="font-display text-lg font-bold leading-none text-white">
              {metric.value}
            </span>
            <span className="text-[10px] leading-tight text-ink-400">
              {metric.label}
            </span>
          </div>
        );
      })}
      {/* An odd count leaves a hole in the two-up phone layout, which would
          otherwise show as a lit block of the divider colour. */}
      {metrics.length % 2 === 1 && (
        <div aria-hidden className="bg-ink-900 sm:hidden" />
      )}
    </div>
  );
}

function DeckCard({
  item,
  spotlight,
  onViewCertificate,
}: {
  readonly item: ExperienceItem;
  readonly spotlight: boolean;
  readonly onViewCertificate: () => void;
}) {
  const category = categoryOf(item.type);

  return (
    <article
      className={cn(
        // Opaque rather than `glass`: the cards stack, and at the usual 3%
        // white the one in front would have others reading through it. Height
        // follows content so the spotlight's metric strip is never clipped.
        "relative flex flex-col gap-4 overflow-hidden rounded-2xl border bg-gradient-to-br from-ink-900 via-ink-900 to-ink-950 p-5 transition-[border-color] duration-500 sm:p-6",
        spotlight
          ? "border-white/20 shadow-2xl shadow-black/50"
          : "border-white/10",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r via-white/25 to-transparent",
          category.rule,
        )}
      />

      <div className="flex items-start gap-4">
        <LogoTile
          src={item.image}
          alt={`${item.organization} logo`}
          className={spotlight ? "h-14 w-14" : "h-12 w-12"}
        />
        <div className="min-w-0 flex-1">
          {spotlight && item.featured && (
            <span
              className={cn(
                "mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
                category.accentText,
              )}
            >
              <Star className="h-3 w-3 fill-current" aria-hidden />
              Featured
            </span>
          )}
          <h3
            className={cn(
              "font-display font-semibold leading-snug text-white",
              spotlight ? "text-lg sm:text-xl" : "text-base",
            )}
          >
            {item.role}
          </h3>
          {/* Wraps rather than clips: several org names are long enough to be
              cut mid-word, and a hover tooltip is no help on touch. */}
          <p className="text-sm leading-snug text-ink-300">
            {item.organization}
          </p>
        </div>

        {spotlight && (
          <span
            aria-hidden
            className="relative hidden h-14 w-14 shrink-0 place-items-center sm:grid"
          >
            <span
              className={cn(
                "absolute inset-0 rounded-full blur-md",
                category.wash,
              )}
            />
            <span
              className={cn(
                "grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-ink-950/60 ring-1",
                category.ring,
              )}
            >
              <category.Icon className={cn("h-6 w-6", category.accentText)} />
            </span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider",
            category.pill,
          )}
        >
          {category.id}
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-400">
          <Calendar className="h-3 w-3" aria-hidden />
          {item.period}
        </span>
      </div>

      <p
        className={cn(
          "text-sm leading-relaxed text-ink-400",
          // The card in focus reads in full; the ones behind it are scenery.
          !spotlight && "line-clamp-4",
        )}
      >
        {spotlight
          ? highlight(item.description, category.accentText)
          : item.description}
      </p>

      {spotlight && item.metrics && item.metrics.length > 0 && (
        <MetricGrid metrics={item.metrics} category={category} />
      )}

      {(item.link || item.certificate) && (
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-1">
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              aria-label={`Visit ${item.organization}`}
              className="inline-flex items-center gap-1.5 rounded font-mono text-xs font-medium text-accent-300 outline-none transition-colors duration-300 hover:text-accent-200 focus-visible:ring-2 focus-visible:ring-accent-400/60"
            >
              Visit
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
          {item.certificate && (
            <button
              type="button"
              onClick={onViewCertificate}
              aria-label={`View ${item.organization} certificate`}
              className="inline-flex items-center gap-1.5 rounded font-mono text-xs font-medium text-ink-300 outline-none transition-colors duration-300 hover:text-white focus-visible:ring-2 focus-visible:ring-accent-400/60"
            >
              Certificate
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>
      )}

      {/* Depth of field: everything but the front card sinks into the dark. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl bg-ink-950/45 transition-opacity duration-500",
          spotlight ? "opacity-0" : "opacity-100",
        )}
      />
    </article>
  );
}

function FilterBar({
  categories,
  active,
  onChange,
  counts,
  total,
}: {
  readonly categories: CategoryId[];
  readonly active: CategoryId | "All";
  readonly onChange: (next: CategoryId | "All") => void;
  readonly counts: Record<CategoryId, number>;
  readonly total: number;
}) {
  const chip = (
    id: CategoryId | "All",
    label: string,
    Icon: IconComponent | null,
    count: number,
  ) => {
    const isActive = id === active;
    return (
      <button
        key={id}
        type="button"
        aria-pressed={isActive}
        onClick={() => onChange(id)}
        className={cn(
          "inline-flex min-h-[40px] items-center gap-2 rounded-full px-3.5 py-2 font-mono text-xs font-medium transition-all duration-300",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
          isActive
            ? "bg-gradient-to-r from-accent-500 to-cyan-500 text-white shadow-lg shadow-accent-500/25"
            : "glass glass-hover text-ink-300 hover:text-white",
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
        {label}
        <span
          className={cn(
            "rounded-full px-1.5 text-[10px]",
            isActive ? "bg-white/20 text-white" : "bg-white/10 text-ink-400",
          )}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <fieldset className="m-0 mb-8 flex flex-wrap gap-2 border-0 p-0">
      <legend className="sr-only">Filter foundations by focus area</legend>
      {chip("All", "All", null, total)}
      {categories.map((id) => chip(id, id, CATEGORIES[id].Icon, counts[id]))}
    </fieldset>
  );
}

/**
 * Thematic chips for the summary — the chapter's flavour, not the filter
 * buckets. Spelling is intentional: casual nouns that read as the chapter's
 * texture rather than job titles.
 */
const FOCUS_THEMES = [
  {
    label: "Leadership",
    pill: "border-accent-400/30 bg-accent-500/10 text-accent-200",
  },
  {
    label: "Friends",
    pill: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200",
  },
  {
    label: "Learnings",
    pill: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
  },
  { label: "Fun", pill: "border-amber-400/30 bg-amber-500/10 text-amber-200" },
  {
    label: "Campaigns",
    pill: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  },
  {
    label: "Event Management",
    pill: "border-indigo-400/30 bg-indigo-500/10 text-indigo-200",
  },
  { label: "Sales", pill: "border-rose-400/30 bg-rose-500/10 text-rose-200" },
  { label: "Marketing", pill: "border-sky-400/30 bg-sky-500/10 text-sky-200" },
  {
    label: "Ideas",
    pill: "border-violet-400/30 bg-violet-500/10 text-violet-200",
  },
  {
    label: "Influencer",
    pill: "border-orange-400/30 bg-orange-500/10 text-orange-200",
  },
  {
    label: "Open Source",
    pill: "border-lime-400/30 bg-lime-500/10 text-lime-200",
  },
] as const;

/**
 * A closing note rather than a scoreboard: the years actively spanned and the
 * flavour of the chapter — thematic pills instead of a wall of roll-up counts.
 */
function SummaryBar({ items }: { readonly items: readonly ExperienceItem[] }) {
  const span = useMemo(() => {
    const years = items
      .flatMap((item) => item.period.match(/\d{4}/g) ?? [])
      .map(Number);
    return years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—";
  }, [items]);

  return (
    <div className="mt-10 flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
      <div className="flex items-center gap-3.5 sm:max-w-[16rem]">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-500/20 to-cyan-500/20 ring-1 ring-white/10">
          <Compass className="h-5 w-5 text-accent-300" aria-hidden />
        </span>
        <p className="text-sm font-medium leading-snug text-ink-200">
          Before the title.{" "}
          <span className="text-ink-400">The chapter that still shows.</span>
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-center sm:justify-end sm:gap-8">
        <div className="flex shrink-0 items-end gap-6 sm:gap-8">
          <div className="flex flex-col gap-0.5">
            <span className="whitespace-nowrap bg-gradient-to-r from-accent-300 to-cyan-300 bg-clip-text font-display text-2xl font-bold text-transparent">
              {items.length}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-ink-400">
              Exp
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="whitespace-nowrap bg-gradient-to-r from-accent-300 to-cyan-300 bg-clip-text font-display text-2xl font-bold text-transparent">
              {span}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-ink-400">
              Active Years
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-ink-400">
            Focus Areas
          </span>
          <ul className="flex flex-wrap gap-1.5">
            {FOCUS_THEMES.map((theme) => (
              <li
                key={theme.label}
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                  theme.pill,
                )}
              >
                {theme.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface FoundationsDeckProps {
  readonly items: readonly ExperienceItem[];
  readonly onViewCertificate: (item: ExperienceItem) => void;
}

/**
 * The early roles as a filterable deck of cards in perspective: one spotlit at
 * the front with its logo emblem, the impact numbers already written into its
 * description, and a metrics strip; the rest fall away behind it, dimmed. A
 * focus-area filter re-slices the deck, and a summary bar sums up the whole
 * chapter beneath it.
 *
 * Drag, arrow keys, the chevrons, and the ticks all move the deck. Structurally
 * this is a WAI-ARIA tabs pattern (tablist + tabpanels with roving tabindex);
 * only the front panel is exposed to AT and pointers via `inert`.
 */
export function FoundationsDeck({
  items,
  onViewCertificate,
}: Readonly<FoundationsDeckProps>) {
  const reduce = useReducedMotion() ?? false;
  const [filter, setFilter] = useState<CategoryId | "All">("All");
  const [front, setFront] = useState(0);
  const baseId = useId();
  const railRef = useRef<HTMLDivElement>(null);

  // Only the focus areas actually present get a chip, with their tallies.
  const { categories, counts } = useMemo(() => {
    const tally = {} as Record<CategoryId, number>;
    for (const item of items) {
      const id = categoryOf(item.type).id;
      tally[id] = (tally[id] ?? 0) + 1;
    }
    const order: CategoryId[] = [
      "Open Source",
      "Externship",
      "Ambassador",
      "Community",
    ];
    return {
      categories: order.filter((id) => tally[id] > 0),
      counts: tally,
    };
  }, [items]);

  const visible = useMemo(
    () =>
      filter === "All"
        ? items
        : items.filter((i) => categoryOf(i.type).id === filter),
    [items, filter],
  );

  // A new filter deals a fresh hand from the top.
  useEffect(() => setFront(0), [filter]);

  const count = visible.length;
  const current = visible[Math.min(front, count - 1)] ?? visible[0];
  const currentCategory = categoryOf(current.type);

  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = (index: number) => `${baseId}-panel-${index}`;

  const go = useCallback(
    (delta: number) => setFront((i) => (i + delta + count) % count),
    [count],
  );

  /** Signed distance from the front, taking the shorter way round the loop. */
  const distanceFrom = (index: number) => {
    const raw = index - front;
    if (raw > count / 2) return raw - count;
    if (raw < -count / 2) return raw + count;
    return raw;
  };

  /** Roving focus across the picker, per the tabs pattern. */
  const onRailKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const jump: Record<string, number | undefined> = {
      ArrowLeft: (front - 1 + count) % count,
      ArrowRight: (front + 1) % count,
      Home: 0,
      End: count - 1,
    };
    const next = jump[event.key];
    if (next === undefined) return;

    event.preventDefault();
    setFront(next);
    const tabs = railRef.current?.querySelectorAll<HTMLElement>('[role="tab"]');
    tabs?.[next]?.focus();
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const thrown = info.offset.x + info.velocity.x * 0.12;
    if (thrown < -60) go(1);
    else if (thrown > 60) go(-1);
  };

  return (
    <div>
      <FilterBar
        categories={categories}
        active={filter}
        onChange={setFilter}
        counts={counts}
        total={items.length}
      />

      <div
        role="region"
        aria-labelledby={`${baseId}-label`}
        className="relative"
      >
        <span id={`${baseId}-label`} className="sr-only">
          Earlier experience and community roles
        </span>

        {/* Behind the deck: a wash in the current role's colour, on a shelf. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] sm:h-[27rem]"
        >
          <div
            className={cn(
              "absolute left-1/2 top-1/2 h-64 w-[38rem] max-w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[90px] transition-colors duration-700",
              currentCategory.wash,
            )}
          />
          <div
            className={cn(
              "absolute bottom-1 left-1/2 h-10 w-[26rem] max-w-[85%] -translate-x-1/2 rounded-[50%] blur-2xl transition-colors duration-700",
              currentCategory.wash,
            )}
          />
          <div className="absolute inset-x-0 bottom-0 mx-auto h-px w-[80%] max-w-[36rem] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        {/* Clips the back of the deck, thrown wider than the viewport on a
            phone, and feathers it out rather than cutting it off. */}
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]">
          <motion.div
            key={filter}
            drag={reduce || count <= 1 ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.14}
            onDragEnd={onDragEnd}
            style={{ perspective: 1500, touchAction: "pan-y" }}
            className="relative h-[38rem] cursor-grab active:cursor-grabbing sm:h-[27rem]"
          >
            {visible.map((item, index) => {
              const distance = distanceFrom(index);
              const isFront = distance === 0;
              const parked = Math.abs(distance) > VISIBLE_DEPTH;

              return (
                <div
                  key={`${item.role}__${item.organization}`}
                  // preserve-3d so the stage's vanishing point reaches the card
                  // inside; z-index because each wrapper is its own 3D context,
                  // so the cards cannot sort against each other by depth and a
                  // neighbour would otherwise paint over the front of the deck.
                  style={{
                    transformStyle: "preserve-3d",
                    zIndex: VISIBLE_DEPTH + 1 - Math.abs(distance),
                  }}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={slotFor(distance, reduce)}
                    transition={
                      parked
                        ? { duration: 0 }
                        : { duration: 0.6, ease: EASE_GLIDE }
                    }
                    className={cn(
                      // Height follows the card so the spotlight (with its
                      // metric strip) can stand taller than its neighbours.
                      "relative w-[min(84vw,30rem)]",
                      !parked && "pointer-events-auto",
                    )}
                  >
                    <div
                      id={panelId(index)}
                      role="tabpanel"
                      aria-labelledby={tabId(index)}
                      inert={!isFront}
                    >
                      <DeckCard
                        item={item}
                        spotlight={isFront}
                        onViewCertificate={() => onViewCertificate(item)}
                      />
                    </div>

                    {/* Pull a neighbour to the front by clicking it. Keyboard
                        users have the chevrons and the ticks, so this stays out
                        of the tab order rather than adding a stop per card. */}
                    {!isFront && !parked && (
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={`Show ${item.role} at ${item.organization}`}
                        onClick={() => setFront(index)}
                        className="absolute inset-0 rounded-2xl"
                      />
                    )}
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 sm:gap-7">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous role"
            className="glass glass-hover grid h-12 w-12 shrink-0 place-items-center rounded-full text-ink-200 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-accent-400/60 sm:h-14 sm:w-14"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          </button>

          <div className="flex min-w-0 flex-col items-center gap-3">
            <div
              ref={railRef}
              role="tablist"
              aria-label="Choose a role"
              className="flex items-center gap-[3px] sm:gap-1.5"
            >
              {visible.map((item, index) => (
                <button
                  key={`${item.role}__${item.organization}`}
                  type="button"
                  role="tab"
                  id={tabId(index)}
                  aria-controls={panelId(index)}
                  aria-selected={index === front}
                  aria-label={`${item.role} at ${item.organization}`}
                  tabIndex={index === front ? 0 : -1}
                  onClick={() => setFront(index)}
                  onKeyDown={onRailKeyDown}
                  className="group grid h-6 place-items-center rounded outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
                >
                  <span
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      index === front
                        ? cn("w-5 sm:w-8", categoryOf(item.type).tick)
                        : "w-1.5 bg-white/25 group-hover:bg-white/50 sm:w-2.5",
                    )}
                  />
                </button>
              ))}
            </div>
            <p
              aria-hidden
              className="font-mono text-sm tabular-nums tracking-wide text-ink-300"
            >
              <span className="font-semibold text-white">
                {String(front + 1).padStart(2, "0")}
              </span>
              <span className="text-ink-600"> / </span>
              {String(count).padStart(2, "0")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next role"
            className="glass glass-hover grid h-12 w-12 shrink-0 place-items-center rounded-full text-ink-200 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-accent-400/60 sm:h-14 sm:w-14"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          </button>
        </div>

        <p aria-live="polite" className="sr-only">
          {`${front + 1} of ${count}: ${current.role} at ${current.organization}`}
        </p>
      </div>

      <SummaryBar items={items} />
    </div>
  );
}
