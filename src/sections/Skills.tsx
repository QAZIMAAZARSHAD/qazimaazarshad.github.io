import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { staggerContainer, viewportOnce } from "@/lib/motion";
import { skillGroups, topSkills } from "@/data/content";
import { SkillCard } from "@/components/skills/SkillCard";

export function Skills() {
  return (
    <Section id="skills">
      <SectionHeading kicker="Toolbox" title="Skills & technologies" />

      {/* Top / headline skills */}
      <Reveal className="mb-10">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500">
            Top skills
          </span>
          <div className="flex flex-wrap gap-2.5">
            {topSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-accent-400/30 bg-accent-500/10 px-4 py-2 text-sm font-medium text-accent-100"
              >
                {skill}
              </span>
            ))}
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
    </Section>
  );
}
