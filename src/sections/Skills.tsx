import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { staggerContainer, viewportOnce } from "@/lib/motion";
import { skillGroups, topSkills } from "@/data/content";
import { SkillCard } from "@/components/skills/SkillCard";
import { TechMarquee } from "@/components/skills/TechMarquee";
import { filterProjectsBySkill, isSkillFilterable } from "@/lib/skillFilter";
import { cn } from "@/lib/utils";

const topSkillBase =
  "rounded-full border border-accent-400/30 bg-accent-500/10 px-4 py-2 text-sm font-medium text-accent-100 transition-all duration-300";

export function Skills() {
  return (
    <Section id="skills">
      <SectionHeading kicker="Toolbox" title="Skills & technologies" />

      <Reveal className="mb-10">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-400">
            Top skills
          </span>
          <div className="flex flex-wrap gap-2.5">
            {topSkills.map((skill) =>
              isSkillFilterable(skill) ? (
                <button
                  key={skill}
                  type="button"
                  onClick={() => filterProjectsBySkill(skill)}
                  aria-label={`Filter projects by ${skill}`}
                  className={cn(
                    topSkillBase,
                    "cursor-pointer hover:-translate-y-0.5 hover:border-accent-400/60 hover:bg-accent-500/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
                  )}
                >
                  {skill}
                </button>
              ) : (
                <span key={skill} className={topSkillBase}>
                  {skill}
                </span>
              ),
            )}
          </div>
        </div>
      </Reveal>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {skillGroups.map((group) => (
          <SkillCard key={group.name} group={group} />
        ))}
      </motion.div>

      <Reveal className="mt-10">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-400">
            Everything in the toolbox
          </span>
          <TechMarquee />
        </div>
      </Reveal>
    </Section>
  );
}
