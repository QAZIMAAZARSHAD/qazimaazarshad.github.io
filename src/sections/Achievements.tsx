import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { achievements, hobbies } from "@/data/content";
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

      {/* Beyond the code — hobbies */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-16"
      >
        <motion.div variants={fadeUp} className="mb-6 flex flex-col gap-3">
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent-300">
            <span className="h-px w-6 bg-accent-400/60" />
            <span>Off the clock</span>
          </span>
          <h3 className="flex items-center gap-2.5 font-display text-2xl font-bold text-white sm:text-3xl">
            <Sparkles className="h-6 w-6 text-cyan-400" strokeWidth={1.75} aria-hidden />
            Beyond the code
          </h3>
        </motion.div>

        <motion.ul variants={staggerContainer} className="flex flex-wrap gap-2.5">
          {hobbies.map((hobby) => (
            <motion.li key={hobby} variants={fadeUp}>
              <span className="glass glass-hover inline-flex items-center rounded-full px-4 py-2 text-sm text-ink-200 transition-transform duration-300 hover:-translate-y-0.5 hover:text-accent-200">
                {hobby}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </Section>
  );
}
