import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LogoTile } from "@/components/timeline/LogoTile";
import { education, type EducationItem } from "@/data/content";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

const sheet: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.1 } },
};

const entry: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const rule: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.9, ease: EASE } },
};

function yearsIn(period: string): string[] {
  return [...period.matchAll(/\d{4}/g)].map((m) => m[0]);
}

function recordSpan(items: readonly EducationItem[]): string | null {
  const years = items.flatMap((item) => yearsIn(item.period)).sort();
  if (years.length === 0) return null;
  const first = years[0];
  const last = years[years.length - 1];
  return first === last ? first : `${first} — ${last}`;
}

function Seal() {
  return (
    <span
      aria-hidden
      className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-500/25 to-cyan-500/10 ring-1 ring-white/15"
    >
      <span className="absolute inset-1.5 rounded-full border border-dashed border-white/20 motion-safe:animate-[spin_22s_linear_infinite]" />
      <span className="font-display text-[0.65rem] font-extrabold tracking-[0.15em] text-white/75">
        QMA
      </span>
    </span>
  );
}

function Record({
  item,
  first,
}: Readonly<{ item: EducationItem; first: boolean }>) {
  const years = yearsIn(item.period);
  const finished = years[years.length - 1];
  const started = years.length > 1 ? years[0] : null;

  const body = (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-4 px-1 py-7 sm:grid-cols-[5rem_auto_1fr_auto] sm:gap-x-6 sm:py-8">
      <div className="col-start-1 row-start-1 flex flex-col">
        <span className="sr-only">{item.period}</span>
        <span
          aria-hidden
          className="font-mono text-2xl font-semibold leading-none text-ink-300 transition-colors duration-300 group-hover:text-white sm:text-[1.75rem]"
        >
          {finished ?? item.period}
        </span>
        {started && (
          <span
            aria-hidden
            className="mt-1.5 font-mono text-[0.7rem] uppercase tracking-widest text-ink-500"
          >
            from {started}
          </span>
        )}
      </div>

      <LogoTile
        src={item.image}
        alt={`${item.institution} logo`}
        className="col-start-1 row-start-2 h-12 w-12 sm:col-start-2 sm:row-start-1"
      />

      <div className="col-span-2 col-start-2 row-start-2 min-w-0 sm:col-span-1 sm:col-start-3 sm:row-start-1">
        <h3 className="font-display text-base font-semibold leading-snug text-white sm:text-lg">
          {item.degree}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-400">
          {item.institution}
          {item.link && (
            <ArrowUpRight
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </p>
      </div>

      <span className="col-start-3 row-start-1 justify-self-end whitespace-nowrap font-mono text-sm font-semibold text-accent-200 transition-colors duration-300 group-hover:text-white sm:col-start-4 sm:text-base">
        {item.score}
      </span>
    </div>
  );

  const inner: ReactNode = item.link ? (
    <a
      href={item.link}
      target="_blank"
      rel="noreferrer"
      aria-label={`${item.institution} — ${item.degree} (opens in a new tab)`}
      className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
    >
      {body}
    </a>
  ) : (
    body
  );

  return (
    <motion.li variants={entry} className="group relative">
      <motion.span
        aria-hidden
        variants={rule}
        className={cn(
          "absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-white/15 via-white/10 to-transparent",
          first && "hidden sm:block",
        )}
      />
      <span
        aria-hidden
        className="absolute inset-y-4 -left-3 w-px origin-top scale-y-0 rounded-full bg-gradient-to-b from-accent-400 to-cyan-400 transition-transform duration-300 group-hover:scale-y-100"
      />
      <div className="rounded-2xl transition-colors duration-300 group-hover:bg-white/[0.025]">
        {inner}
      </div>
    </motion.li>
  );
}

export function Education() {
  const reduceMotion = useReducedMotion();
  const span = recordSpan(education);

  return (
    <Section id="education">
      <SectionHeading
        kicker="Education"
        title="Academic foundation"
        description="The institutions and milestones that grounded my path into software engineering."
      />

      <motion.div
        variants={fadeUp}
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={viewportOnce}
        className="glass spotlight overflow-hidden rounded-3xl px-5 shadow-xl shadow-black/25 sm:px-8"
      >
        <div className="flex items-center justify-between gap-4 pb-6 pt-7">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-400">
              Transcript
            </p>
            <p className="mt-1.5 font-mono text-[0.7rem] text-ink-500">
              {education.length} {education.length === 1 ? "record" : "records"}
              {span && ` · ${span}`}
            </p>
          </div>
          <Seal />
        </div>

        {/* The logo column is pinned to the tile's width — left on auto it
            collapses here, since nothing sits in it, and the headings drift
            off their columns. */}
        <div
          aria-hidden
          className="hidden pb-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-500 sm:grid sm:grid-cols-[5rem_3rem_1fr_auto] sm:gap-x-6 sm:px-1"
        >
          <span>Year</span>
          <span className="col-start-3">Qualification</span>
          <span className="justify-self-end">Result</span>
        </div>

        <motion.ol
          variants={sheet}
          initial={reduceMotion ? "show" : "hidden"}
          whileInView="show"
          viewport={viewportOnce}
          className="border-t border-white/10 pb-4 sm:border-t-0"
        >
          {education.map((item, i) => (
            <Record
              key={`${item.degree}__${item.institution}`}
              item={item}
              first={i === 0}
            />
          ))}
        </motion.ol>
      </motion.div>
    </Section>
  );
}
