import { Briefcase, Calendar, ExternalLink, MapPin } from "lucide-react";
import {
  type MotionValue,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import type { CompanyExperience, ExperienceRole } from "@/data/content";
import { asset, cn, durationSince } from "@/lib/utils";

/** Ongoing roles compute their tenure live; past roles use the stored value. */
function roleDuration(role: ExperienceRole): string | undefined {
  if (role.current) {
    return durationSince(role.period.split("—")[0]) || role.duration;
  }
  return role.duration;
}

/** "Mar 2026 — Present" → the two ends, trimmed. */
function periodEnds(period: string): { start: string; end: string } {
  const [start = "", end = ""] = period.split("—").map((s) => s.trim());
  return { start, end };
}

interface TimelineEntryProps {
  item: CompanyExperience;
  /** Scroll-driven rail fill progress (0–1). Omitted under reduced motion. */
  fillProgress?: MotionValue<number>;
  /** This entry's approximate position along the rail (0–1). */
  position?: number;
}

/**
 * One company on the vertical experience timeline. Its logo rides a glowing node
 * on the shared rail; the card carries the full employment span in a header
 * chip, every role held there (newest first, so a promotion path reads as one
 * card), and a holographic pedestal of the brand that fills what would
 * otherwise be dead width. The rail line itself lives in the parent so it can
 * run unbroken between companies.
 */
export function TimelineEntry({
  item,
  fillProgress,
  position = 0,
}: Readonly<TimelineEntryProps>) {
  const {
    organization,
    image,
    link,
    location,
    locationType,
    totalDuration,
    description,
    current,
    roles,
  } = item;

  // Brighten this node's ring once the scroll fill passes it. Without
  // `fillProgress` (reduced motion) the fallback stays fully lit.
  const fallback = useMotionValue(1);
  const nodeGlow = useTransform(
    fillProgress ?? fallback,
    [position - 0.08, position],
    [0, 1],
  );

  const multiRole = roles.length > 1;
  const newest = roles[0];
  const oldest = roles[roles.length - 1];
  // Header span runs from the earliest start to the latest end across all roles.
  const span = `${periodEnds(oldest.period).start} — ${periodEnds(newest.period).end}`;
  const spanDuration = totalDuration ?? roleDuration(newest);

  return (
    <div className="group relative pl-16 sm:pl-24">
      {/* Logo node on the rail */}
      <span
        aria-hidden
        className="absolute left-8 top-9 z-10 -translate-x-1/2 -translate-y-1/2 sm:left-10 sm:top-10"
      >
        <span className="relative grid h-11 w-11 place-items-center sm:h-14 sm:w-14">
          {current && (
            <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/40" />
          )}
          <motion.span
            style={{ opacity: nodeGlow }}
            className={cn(
              "absolute inset-0 rounded-full blur-[6px]",
              current ? "bg-cyan-400/50" : "bg-accent-500/50",
            )}
          />
          <motion.span
            style={{ opacity: nodeGlow }}
            className={cn(
              "absolute inset-0 rounded-full ring-2",
              current ? "ring-cyan-400/70" : "ring-accent-400/60",
            )}
          />
          <span className="relative h-9 w-9 overflow-hidden rounded-full bg-white ring-4 ring-ink-950 sm:h-12 sm:w-12">
            <img
              src={asset(image)}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain p-1.5"
            />
          </span>
        </span>
      </span>

      {/* Connector from node to card */}
      <span
        aria-hidden
        className="absolute left-[3.25rem] top-9 h-px w-4 -translate-y-1/2 bg-gradient-to-r from-white/25 to-transparent sm:left-[4.25rem] sm:top-10 sm:w-5"
      />

      <article className="glass glass-hover spotlight overflow-hidden rounded-2xl shadow-lg shadow-black/20 hover:shadow-accent-500/20">
        <div className="grid lg:grid-cols-[1fr_13rem]">
          <div className="min-w-0 p-5 sm:p-6">
            {/* Header: identity left, employment span right */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                  <h3 className="font-display text-lg font-semibold leading-tight text-white sm:text-xl">
                    {organization}
                  </h3>
                  {current && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-gradient-to-r from-accent-500/20 to-cyan-500/20 px-2.5 py-0.5 font-mono text-2xs font-medium uppercase tracking-wider text-cyan-200">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      </span>
                      <span>Current</span>
                    </span>
                  )}
                </div>

                {location && (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-xs text-ink-400">
                    <MapPin
                      aria-hidden
                      className="h-3.5 w-3.5 text-accent-400/80"
                    />
                    <span>
                      {location}
                      {locationType ? ` · ${locationType}` : ""}
                    </span>
                  </p>
                )}
              </div>

              <div
                className={cn(
                  // Hugs its text on a phone; only takes a fixed column and
                  // right-aligns once it sits beside the company name.
                  "w-fit shrink-0 rounded-xl border px-3 py-2 sm:min-w-[11rem] sm:text-right",
                  current
                    ? "border-cyan-400/25 bg-cyan-500/[0.06]"
                    : "border-white/10 bg-white/[0.03]",
                )}
              >
                <span className="flex items-center gap-1.5 font-mono text-xs text-ink-200 sm:justify-end">
                  <Calendar
                    aria-hidden
                    className={cn(
                      "h-3.5 w-3.5",
                      current ? "text-cyan-400" : "text-accent-400",
                    )}
                  />
                  {span}
                </span>
                {spanDuration && (
                  <span
                    className={cn(
                      "mt-0.5 block font-mono text-xs",
                      current ? "text-cyan-300/80" : "text-ink-400",
                    )}
                  >
                    {spanDuration}
                  </span>
                )}
              </div>
            </div>

            {/* Roles */}
            {multiRole ? (
              <ol className="relative mt-5 space-y-3.5">
                <span
                  aria-hidden
                  className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-accent-400/40 via-white/10 to-transparent"
                />
                {roles.map((r, i) => (
                  <li key={`${r.title}__${r.period}`} className="relative pl-6">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full ring-4 ring-ink-950",
                        r.current
                          ? "bg-gradient-to-br from-accent-400 to-cyan-400 shadow-[0_0_10px_2px] shadow-cyan-500/40"
                          : i === 0
                            ? "bg-gradient-to-br from-accent-500 to-accent-400"
                            : "bg-ink-600",
                      )}
                    />
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 lg:flex-nowrap lg:justify-between">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h4 className="font-medium leading-tight text-white">
                          {r.title}
                        </h4>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-2xs uppercase tracking-wide text-ink-300">
                          {r.type}
                        </span>
                      </div>
                      {/* Date columns line up on lg. Below that they wrap
                          freely — held rigid, they run off the edge of the card
                          on a 320px screen. The widths are minimums rather than
                          fixed: a live tenure grows a word longer every so often
                          ("1 yr 1 mo" → "1 yr 2 mos"), and a rigid column breaks
                          it across two lines when it does. */}
                      <div
                        data-testid="role-dates"
                        className="flex flex-wrap items-baseline gap-x-3 font-mono text-xs text-ink-400 lg:shrink-0 lg:flex-nowrap lg:gap-x-4"
                      >
                        <span className="whitespace-nowrap lg:min-w-[10.5rem] lg:text-right">
                          {r.period}
                        </span>
                        {roleDuration(r) && (
                          <span className="whitespace-nowrap text-ink-300 lg:min-w-[6rem] lg:text-right">
                            {roleDuration(r)}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                {/* Icon and title wrap as one unit, so a long title never
                    leaves the briefcase stranded on a line of its own. */}
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    aria-hidden
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-lg",
                      current
                        ? "bg-cyan-500/15 text-cyan-300"
                        : "bg-accent-500/15 text-accent-300",
                    )}
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                  </span>
                  <h4 className="font-medium leading-tight text-white">
                    {newest.title}
                  </h4>
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-2xs uppercase tracking-wide text-ink-300">
                  {newest.type}
                </span>
              </div>
            )}

            {description && (
              <p className="mt-4 border-t border-white/5 pt-4 text-sm leading-relaxed text-ink-400">
                {description}
              </p>
            )}

            {link && (
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit ${organization} (opens in a new tab)`}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md font-mono text-xs font-medium text-accent-300 outline-none transition-colors hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-accent-400/60"
              >
                <span>Visit</span>
                <ExternalLink
                  aria-hidden
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </a>
            )}
          </div>

          {/* Brand pedestal — decorative, fills the right on wide screens */}
          <div
            aria-hidden
            className={cn(
              "relative hidden overflow-hidden border-l border-white/5 lg:block",
              current
                ? "bg-gradient-to-br from-cyan-500/[0.08] via-transparent to-accent-500/[0.05]"
                : "bg-gradient-to-br from-accent-500/[0.08] via-transparent to-fuchsia-500/[0.05]",
            )}
          >
            {/* Ambient wash behind the whole group */}
            <div
              className={cn(
                "absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-[70%] rounded-full blur-2xl",
                current ? "bg-cyan-400/20" : "bg-accent-500/20",
              )}
            />
            {/* Light beam from the logo down onto the platform */}
            <div
              className={cn(
                "absolute left-1/2 top-1/2 h-16 w-14 -translate-x-1/2 -translate-y-[6%] [mask-image:linear-gradient(to_bottom,black,transparent)]",
                current
                  ? "bg-gradient-to-b from-cyan-400/25 to-transparent"
                  : "bg-gradient-to-b from-accent-400/25 to-transparent",
              )}
            />
            {/* Glow pooled on the platform. It tightens and fades as the tile
                drifts up, which is what sells the height. */}
            <div className="absolute left-1/2 top-1/2 translate-y-[42%]">
              <div
                className={cn(
                  "qma-coin-shadow h-6 w-24 -translate-x-1/2 rounded-[50%] blur-md",
                  current ? "bg-cyan-400/35" : "bg-accent-500/35",
                )}
              />
            </div>
            {/* Platform disc the logo appears to rest on */}
            <div
              className={cn(
                "absolute left-1/2 top-1/2 h-14 w-16 -translate-x-1/2 rounded-[50%] border",
                current ? "border-cyan-400/30" : "border-accent-400/30",
              )}
              style={{
                transform:
                  "translate(-50%, 34%) perspective(120px) rotateX(66deg)",
              }}
            />
            {/* Logo hovering over the plinth: drifts on the shared float clock
                while turning on its own axis. Both faces carry the mark, so a
                full turn never shows the brand mirrored. */}
            <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-[78%]">
              <div className="relative h-full w-full motion-safe:animate-float">
                <div
                  className={cn(
                    "absolute -inset-4 rounded-full blur-xl",
                    current ? "bg-cyan-400/25" : "bg-accent-500/25",
                  )}
                />
                <div className="qma-coin relative h-full w-full">
                  <div className="qma-coin-spin">
                    {(["left", "right", "top", "bottom"] as const).map(
                      (rim) => (
                        <span
                          key={rim}
                          className={`qma-coin-rim qma-coin-rim--${rim}`}
                        />
                      ),
                    )}
                    {(["front", "back"] as const).map((face) => (
                      <div
                        key={face}
                        className={cn(
                          "qma-coin-face overflow-hidden rounded-xl bg-white shadow-[0_22px_45px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/20",
                          face === "back" && "qma-coin-face--back",
                        )}
                      >
                        <img
                          src={asset(image)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-contain p-3.5"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
