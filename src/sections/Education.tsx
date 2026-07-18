import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { LogoTile } from "@/components/timeline/LogoTile";
import { education, type EducationItem } from "@/data/content";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

function EducationCard({ item }: Readonly<{ item: EducationItem }>) {
  const body = (
    <div className="glass glass-hover flex h-full flex-col rounded-3xl p-6 shadow-lg shadow-black/20 hover:shadow-accent-500/20">
      <div className="flex items-start justify-between gap-4">
        <LogoTile
          src={item.image}
          alt={`${item.institution} logo`}
          className="h-16 w-16"
        />
        {item.link && (
          <ExternalLink
            aria-hidden
            className="h-4 w-4 text-ink-500 transition-colors duration-300 group-hover:text-accent-300"
          />
        )}
      </div>

      <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-white">
        {item.degree}
      </h3>
      <p className="mt-1.5 text-sm text-ink-300">{item.institution}</p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-accent-500 to-cyan-500 px-3 py-1 font-mono text-xs font-semibold text-white shadow-lg shadow-accent-500/25">
          {item.score}
        </span>
        <span className="font-mono text-xs text-ink-400">{item.period}</span>
      </div>
    </div>
  );

  const wrapper: ReactNode = item.link ? (
    <a
      href={item.link}
      target="_blank"
      rel="noreferrer"
      aria-label={`${item.institution} — ${item.degree} (opens in a new tab)`}
      className="group block h-full rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
    >
      {body}
    </a>
  ) : (
    <div className="group h-full">{body}</div>
  );

  return (
    <TiltCard max={6} className="h-full">
      {wrapper}
    </TiltCard>
  );
}

export function Education() {
  return (
    <Section id="education">
      <SectionHeading
        kicker="Education"
        title="Academic foundation"
        description="The institutions and milestones that grounded my path into software engineering."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {education.map((item) => (
          <motion.div
            key={`${item.degree}__${item.institution}`}
            variants={fadeUp}
            className="h-full"
          >
            <EducationCard item={item} />
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
