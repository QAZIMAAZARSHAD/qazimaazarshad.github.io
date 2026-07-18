import { ExternalLink } from "lucide-react";
import type { ExperienceItem } from "@/data/content";
import { cn } from "@/lib/utils";
import { LogoTile } from "./LogoTile";

interface TimelineEntryProps {
  item: ExperienceItem;
}

/**
 * One node on the vertical experience timeline: a glowing rail dot + connector
 * aligned to a glass card. The rail line itself lives in the parent so it can
 * span every entry continuously.
 *
 * Geometry note: the dot / connector share the rail's x (`left-8 sm:left-10`,
 * centred via -translate-x-1/2) and sit at the vertical centre of the logo tile
 * (`top-12`), keeping them locked to the rail regardless of viewport.
 */
export function TimelineEntry({ item }: Readonly<TimelineEntryProps>) {
  const { role, organization, type, period, description, image, link, current } =
    item;

  return (
    <div className="group relative pl-14 sm:pl-20">
      {/* Rail node */}
      <span
        aria-hidden
        className="absolute left-8 top-12 z-10 -translate-x-1/2 -translate-y-1/2 sm:left-10"
      >
        <span className="relative flex h-4 w-4 items-center justify-center">
          {current && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/70" />
          )}
          <span
            className={cn(
              "relative h-3 w-3 rounded-full ring-4 ring-ink-950",
              current
                ? "bg-gradient-to-br from-accent-400 to-cyan-400 shadow-[0_0_14px_3px] shadow-cyan-500/50"
                : "bg-gradient-to-br from-accent-500 to-accent-400 shadow-[0_0_10px_1px] shadow-accent-500/40",
            )}
          />
        </span>
      </span>

      {/* Connector from rail to card */}
      <span
        aria-hidden
        className="absolute left-8 top-12 h-px w-6 -translate-y-1/2 bg-gradient-to-r from-accent-400/50 to-transparent sm:left-10 sm:w-10"
      />

      {/* Card */}
      <article className="glass glass-hover rounded-2xl p-5 shadow-lg shadow-black/20 hover:shadow-accent-500/20 sm:p-6">
        <div className="flex items-start gap-4">
          <LogoTile
            src={image}
            alt={`${organization} logo`}
            className="h-14 w-14"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <h3 className="font-display text-lg font-semibold leading-tight text-white sm:text-xl">
                {role}
              </h3>
              {current && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-gradient-to-r from-accent-500/20 to-cyan-500/20 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-cyan-200">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  </span>
                  <span>Current</span>
                </span>
              )}
            </div>

            <p className="mt-1 text-sm font-medium text-accent-200/90">
              {organization}
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide text-ink-300">
                {type}
              </span>
              <span className="font-mono text-xs text-ink-400">{period}</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-400">{description}</p>

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
      </article>
    </div>
  );
}
