import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { staggerContainer, viewportOnce } from "@/lib/motion";
import { achievements } from "@/data/content";
import { AchievementCard } from "@/components/achievements/AchievementCard";

export function Achievements() {
  return (
    <Section id="achievements">
      <SectionHeading kicker="Recognition" title="Awards & achievements" />

      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        {achievements.map((achievement, index) => (
          <AchievementCard key={achievement} text={achievement} index={index} />
        ))}
      </motion.ul>
    </Section>
  );
}
