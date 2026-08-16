import {
  useCallback,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { LogoTile } from "@/components/timeline/LogoTile";
import { TruncatedText } from "@/components/ui/TruncatedText";
import type { ExperienceItem } from "@/data/content";
import { EASE_GLIDE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Cards beyond this many places from the front are parked out of sight. */
const VISIBLE_DEPTH = 2;

interface Accent {
  pill: string;
  rule: string;
  wash: string;
  tick: string;
}

/**
 * Each kind of role gets its own hue, so moving through the deck shifts the
 * ambient colour and the run of internships reads apart from the community
 * work at a glance.
 */
const ACCENTS: Record<string, Accent> = {
  Externship: {
    pill: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
    rule: "from-cyan-400/80",
    wash: "bg-cyan-500/20",
    tick: "bg-cyan-400",
  },
  "Open Source": {
    pill: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    rule: "from-emerald-400/80",
    wash: "bg-emerald-500/20",
    tick: "bg-emerald-400",
  },
  Ambassador: {
    pill: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    rule: "from-amber-400/80",
    wash: "bg-amber-500/20",
    tick: "bg-amber-400",
  },
  Community: {
    pill: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200",
    rule: "from-fuchsia-400/80",
    wash: "bg-fuchsia-500/20",
    tick: "bg-fuchsia-400",
  },
};

const FALLBACK: Accent = {
  pill: "border-white/15 bg-white/[0.04] text-ink-200",
  rule: "from-accent-400/80",
  wash: "bg-accent-500/20",
  tick: "bg-accent-400",
};

const accentFor = (type: string): Accent => ACCENTS[type] ?? FALLBACK;

/** Where a card sits given its distance from the front of the deck. */
function slotFor(distance: number, reduce: boolean) {
  if (reduce) {
    return { x: "0%", z: 0, rotateY: 0, opacity: distance === 0 ? 1 : 0 };
  }
  const side = Math.sign(distance);
  const steps = Math.min(Math.abs(distance), VISIBLE_DEPTH);
  return {
    // Thrown well clear of the front card so a neighbour's near edge never
    // overlaps it, and dimmed hard so the stack reads as background rather
    // than a second thing competing for the eye.
    x: `${side * steps * 104}%`,
    z: -steps * 240,
    rotateY: -side * steps * 30,
    opacity: Math.abs(distance) > VISIBLE_DEPTH ? 0 : 1 - steps * 0.55,
  };
}

function DeckCard({
  item,
  front,
  onViewCertificate,
}: {
  readonly item: ExperienceItem;
  readonly front: boolean;
  readonly onViewCertificate: () => void;
}) {
  const accent = accentFor(item.type);

  return (
    <article
      className={cn(
        // Opaque rather than `glass`: the cards stack, and at the usual 3%
        // white the one in front would have four others reading through it.
        "relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border bg-gradient-to-br from-ink-900 via-ink-900 to-ink-950 p-5 transition-[filter,border-color] duration-500 sm:p-6",
        front
          ? "border-white/20 shadow-2xl shadow-black/50"
          : "border-white/10 blur-[2px]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r via-white/25 to-transparent",
          accent.rule,
        )}
      />

      <div className="flex items-start gap-4">
        <LogoTile
          src={item.image}
          alt={`${item.organization} logo`}
          className="h-14 w-14"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold leading-snug text-white sm:text-lg">
            {item.role}
          </h3>
          <TruncatedText
            as="p"
            text={item.organization}
            className="truncate text-sm text-ink-300"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider",
            accent.pill,
          )}
        >
          {item.type}
        </span>
        <span className="font-mono text-[11px] text-ink-400">
          {item.period}
        </span>
      </div>

      <TruncatedText
        as="p"
        text={item.description}
        className="line-clamp-5 text-sm leading-relaxed text-ink-400"
      />

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
          front ? "opacity-0" : "opacity-100",
        )}
      />
    </article>
  );
}

interface FoundationsDeckProps {
  readonly items: readonly ExperienceItem[];
  readonly onViewCertificate: (item: ExperienceItem) => void;
}

/**
 * The early roles as a deck of cards seen in perspective, one face-on at the
 * front and the rest falling away behind it. There are sixteen of them and they
 * are all variations on the same beat, so a grid of sixteen just asks to be
 * skipped — dealt out like this only the current one competes for attention.
 *
 * Drag, arrow keys, the chevrons, and the ticks all move the deck; every card
 * stays in the document so the content is still there to be found.
 */
export function FoundationsDeck({
  items,
  onViewCertificate,
}: Readonly<FoundationsDeckProps>) {
  const reduce = useReducedMotion() ?? false;
  const [front, setFront] = useState(0);
  const baseId = useId();
  const railRef = useRef<HTMLDivElement>(null);
  const count = items.length;
  const current = items[front];

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
    <div
      role="group"
      aria-roledescription="carousel"
      aria-labelledby={`${baseId}-label`}
      className="relative"
    >
      <span id={`${baseId}-label`} className="sr-only">
        Earlier experience and community roles
      </span>

      {/* Behind the deck: a wash in the current role's colour, and the plate
          number, which gives the stage something to sit against. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] sm:h-[22rem]"
      >
        <div
          className={cn(
            "absolute left-1/2 top-1/2 h-64 w-[38rem] max-w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[90px] transition-colors duration-700",
            accentFor(current.type).wash,
          )}
        />
        {/* A lit shelf, so the deck reads as standing on something. */}
        <div
          className={cn(
            "absolute bottom-1 left-1/2 h-10 w-[26rem] max-w-[85%] -translate-x-1/2 rounded-[50%] blur-2xl transition-colors duration-700",
            accentFor(current.type).wash,
          )}
        />
        <div className="absolute inset-x-0 bottom-0 mx-auto h-px w-[80%] max-w-[36rem] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      {/* Clips the back of the deck, which is thrown wider than the viewport on
          a phone, and feathers it out rather than cutting it off. */}
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]">
        <motion.div
          drag={reduce ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.14}
          onDragEnd={onDragEnd}
          style={{ perspective: 1500, touchAction: "pan-y" }}
          className="relative h-[24rem] cursor-grab active:cursor-grabbing sm:h-[22rem]"
        >
          {items.map((item, index) => {
            const distance = distanceFrom(index);
            const isFront = distance === 0;
            const parked = Math.abs(distance) > VISIBLE_DEPTH;

            return (
              <div
                key={`${item.role}__${item.organization}`}
                // preserve-3d so the stage's vanishing point reaches the card
                // inside; z-index because each wrapper is its own 3D context, so
                // the cards cannot sort against each other by depth and a
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
                    "relative h-[20rem] w-[min(84vw,28rem)] sm:h-[19rem]",
                    !parked && "pointer-events-auto",
                  )}
                >
                  <div
                    id={panelId(index)}
                    role="tabpanel"
                    aria-roledescription="slide"
                    aria-labelledby={tabId(index)}
                    inert={!isFront}
                    className="h-full"
                  >
                    <DeckCard
                      item={item}
                      front={isFront}
                      onViewCertificate={() => onViewCertificate(item)}
                    />
                  </div>

                  {/* Pull a neighbour to the front by clicking it. Keyboard users
                    have the chevrons and the ticks, so this stays out of the
                    tab order rather than adding fifteen stops. */}
                  {!isFront && !parked && (
                    <button
                      type="button"
                      aria-hidden
                      tabIndex={-1}
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

      <div className="mt-7 flex items-center justify-center gap-3 sm:gap-6">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous role"
          className="glass glass-hover grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-200 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-accent-400/60"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <div className="flex min-w-0 flex-col items-center gap-2.5">
          <div
            ref={railRef}
            role="tablist"
            aria-label="Choose a role"
            className="flex items-center gap-[2px] sm:gap-[3px]"
          >
            {items.map((item, index) => (
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
                className="group grid h-4 place-items-center rounded outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
              >
                <span
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    index === front
                      ? cn("w-4 sm:w-6", accentFor(item.type).tick)
                      : "w-1.5 bg-white/20 group-hover:bg-white/40 sm:w-2",
                  )}
                />
              </button>
            ))}
          </div>
          <p aria-hidden className="font-mono text-[11px] text-ink-400">
            {String(front + 1).padStart(2, "0")}
            <span className="text-ink-600"> / </span>
            {String(count).padStart(2, "0")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next role"
          className="glass glass-hover grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-200 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-accent-400/60"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        {`${front + 1} of ${count}: ${current.role} at ${current.organization}`}
      </p>
    </div>
  );
}
