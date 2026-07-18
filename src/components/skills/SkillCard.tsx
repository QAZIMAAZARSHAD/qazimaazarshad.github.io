import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { SkillGroup } from "@/data/content";
import { resolveSkillIcon } from "./iconMap";

interface SkillCardProps {
  group: SkillGroup;
  className?: string;
}

/**
 * A single skill-group card: gradient-tinted icon tile + group name header,
 * followed by the group's skills rendered as staggered chips. Inherits its
 * reveal animation from the parent grid's stagger container.
 */
export function SkillCard({ group, className }: Readonly<SkillCardProps>) {
  const Icon = resolveSkillIcon(group.icon);

  return (
    <motion.article
      variants={scaleIn}
      className={cn(
        "glass glass-hover group relative flex flex-col overflow-hidden rounded-3xl p-6",
        "hover:shadow-2xl hover:shadow-accent-500/20",
        className,
      )}
    >
      {/* Soft accent glow that intensifies on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-500/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-40"
      />

      <div className="relative flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500/20 to-cyan-400/10 text-accent-300 ring-1 ring-inset ring-white/10 transition-colors duration-300 group-hover:text-accent-200">
          <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </span>
        <h3 className="font-display text-lg font-semibold text-white">
          {group.name}
        </h3>
      </div>

      <motion.ul
        variants={staggerContainer}
        className="relative mt-6 flex flex-wrap gap-2"
      >
        {group.skills.map((skill) => (
          <motion.li key={skill} variants={fadeUp}>
            <span
              className={cn(
                "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5",
                "font-mono text-xs text-ink-300 transition-all duration-300",
                "hover:-translate-y-0.5 hover:border-accent-400/50 hover:bg-accent-500/10 hover:text-accent-200",
              )}
            >
              {skill}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </motion.article>
  );
}
