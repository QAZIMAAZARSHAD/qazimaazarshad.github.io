import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TimelineEntry } from "@/components/timeline/TimelineEntry";
import { experience } from "@/data/content";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export function Experience() {
  const keyOf = (role: string, organization: string) =>
    `${role}__${organization}`;

  return (
    <Section id="experience">
      <SectionHeading
        kicker="Journey"
        title="Where I've made an impact"
        description="My professional path building enterprise-scale products — at Salesforce (R&D MDM Informatica) and Informatica."
      />

      <div className="relative">
        {/* Continuous gradient rail spanning every visible entry */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-8 top-2 bottom-4 w-px -translate-x-1/2 bg-gradient-to-b from-accent-500/60 via-accent-400/25 to-transparent sm:left-10"
        />

        {/* Roles, most-recent first (Salesforce, the current role, leads) */}
        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="space-y-5 sm:space-y-6"
        >
          {experience.map((item) => (
            <motion.li
              key={keyOf(item.role, item.organization)}
              variants={fadeUp}
            >
              <TimelineEntry item={item} />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </Section>
  );
}
