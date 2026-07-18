import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LogoTile } from "@/components/timeline/LogoTile";
import { earlierExperience, type ExperienceItem } from "@/data/content";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** How many cards to show before the visitor expands the rest. */
const INITIAL_COUNT = 6;

const easeOut: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

function EarlierCard({ item }: { readonly item: ExperienceItem }) {
  return (
    <article className="glass glass-hover flex h-full flex-col gap-4 rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <LogoTile
          src={item.image}
          alt={`${item.organization} logo`}
          className="h-12 w-12"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold leading-snug text-white">
            {item.role}
          </h3>
          <p className="truncate text-sm text-ink-300">{item.organization}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-accent-200">
          {item.type}
        </span>
        <span className="font-mono text-[11px] text-ink-400">{item.period}</span>
      </div>

      <p className="line-clamp-3 text-sm leading-relaxed text-ink-400">
        {item.description}
      </p>

      {item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          aria-label={`Visit ${item.organization}`}
          className="mt-auto inline-flex items-center gap-1.5 font-mono text-xs font-medium text-accent-300 transition-colors duration-300 hover:text-accent-200"
        >
          Visit
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      )}
    </article>
  );
}

export function EarlierExperience() {
  const [expanded, setExpanded] = useState(false);

  const primary = earlierExperience.slice(0, INITIAL_COUNT);
  const rest = earlierExperience.slice(INITIAL_COUNT);
  const keyOf = (item: ExperienceItem) => `${item.role}__${item.organization}`;

  return (
    <Section id="earlier">
      <SectionHeading
        kicker="Foundations"
        title="Earlier experience & community"
        description="Internships, open-source programs, campus ambassadorships, and student-org leadership from my university years — where it all started."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {primary.map((item) => (
          <motion.div key={keyOf(item)} variants={fadeUp}>
            <EarlierCard item={item} />
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="rest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {rest.map((item, i) => (
              <motion.div
                key={keyOf(item)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.35, delay: i * 0.04, ease: easeOut }}
              >
                <EarlierCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {rest.length > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="glass glass-hover group inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-ink-200 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-accent-400/60"
          >
            {expanded
              ? "Show less"
              : `Show all ${earlierExperience.length} roles`}
            <ChevronDown
              aria-hidden
              className={cn(
                "h-4 w-4 text-accent-300 transition-transform duration-300",
                expanded && "rotate-180",
              )}
            />
          </button>
        </div>
      )}
    </Section>
  );
}
