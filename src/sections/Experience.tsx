import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TimelineEntry } from "@/components/timeline/TimelineEntry";
import { experience } from "@/data/content";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export function Experience() {
  return (
    <Section id="experience">
      <SectionHeading
        kicker="Journey"
        title="Where I've made an impact"
        description="My professional path building enterprise-scale products — from a Software Development Intern at Informatica to a full-stack engineer at Salesforce."
      />

      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-8 top-2 bottom-4 w-px -translate-x-1/2 bg-gradient-to-b from-accent-500/60 via-accent-400/25 to-transparent sm:left-10"
        />

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="space-y-5 sm:space-y-6"
        >
          {experience.map((item) => (
            <motion.li key={item.organization} variants={fadeUp}>
              <TimelineEntry item={item} />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </Section>
  );
}
