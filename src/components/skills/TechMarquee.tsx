import { useReducedMotion } from "framer-motion";
import { skillGroups, topSkills } from "@/data/content";
import { filterProjectsBySkill, isSkillFilterable } from "@/lib/skillFilter";
import { cn } from "@/lib/utils";

const techItems: string[] = Array.from(
  new Set([...topSkills, ...skillGroups.flatMap((group) => group.skills)]),
);

const chipBase = cn(
  "glass glass-hover inline-flex shrink-0 items-center rounded-full px-4 py-2",
  "font-mono text-xs text-ink-300 transition-colors duration-300",
);
const chipClickable = cn(
  "cursor-pointer hover:text-white",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
);

/** Left/right edge fade so chips dissolve into the background at the rails. */
const fadeMask =
  "linear-gradient(to right, transparent, black 10%, black 90%, transparent)";

interface TechChipProps {
  readonly skill: string;
  /** Duplicated copies are hidden from AT and taken out of the tab order. */
  readonly duplicate?: boolean;
  readonly className?: string;
}

/** Clickable only when the skill maps to real projects; otherwise display-only. */
function TechChip({ skill, duplicate, className }: TechChipProps) {
  if (!isSkillFilterable(skill)) {
    return (
      <span
        aria-hidden={duplicate || undefined}
        className={cn(chipBase, className)}
      >
        {skill}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => filterProjectsBySkill(skill)}
      aria-label={duplicate ? undefined : `Filter projects by ${skill}`}
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : undefined}
      className={cn(chipBase, chipClickable, className)}
    >
      {skill}
    </button>
  );
}

/**
 * Infinite, seamlessly-looping horizontal strip of tech chips (rendered twice
 * and translated by one copy's width). Pauses on hover, fades at both edges,
 * and degrades to a static wrapped row under prefers-reduced-motion.
 */
export function TechMarquee() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className="flex flex-wrap gap-2.5">
        {techItems.map((skill) => (
          <TechChip key={skill} skill={skill} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="group relative overflow-hidden py-1"
      style={{ maskImage: fadeMask, WebkitMaskImage: fadeMask }}
    >
      <div className="flex w-max [animation:qma-marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]">
        {[...techItems, ...techItems].map((skill, index) => (
          <TechChip
            key={`${skill}-${index}`}
            skill={skill}
            duplicate={index >= techItems.length}
            className="mr-2.5"
          />
        ))}
      </div>
    </div>
  );
}
