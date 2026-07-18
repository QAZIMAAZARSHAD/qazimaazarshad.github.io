import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { achievements, hobbies } from "@/data/content";
import { AchievementCard } from "@/components/achievements/AchievementCard";

/** Playful emoji + one-liner per hobby (presentation only). */
const HOBBY_META: Record<string, { emoji: string; quip: string }> = {
  Movies: { emoji: "🎬", quip: "Popcorn optional, always in." },
  "Web Series": { emoji: "📺", quip: "Just one more episode…" },
  Anime: { emoji: "🍥", quip: "Subs over dubs." },
  Music: { emoji: "🎧", quip: "Every commit has a soundtrack." },
  "Pro Wrestling (WWE)": { emoji: "🤼", quip: "Ringside energy." },
  Cricket: { emoji: "🏏", quip: "Cover drives & run chases." },
  Badminton: { emoji: "🏸", quip: "Smash first, ask later." },
  Chess: { emoji: "♟️", quip: "Three moves ahead." },
  "Video Games": { emoji: "🎮", quip: "One more run, promise." },
  Quizzing: { emoji: "🧠", quip: "Trivia? Bring it on." },
};
const DEFAULT_HOBBY = { emoji: "✨", quip: "Good vibes only." };

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

        <motion.ul variants={staggerContainer} className="flex flex-wrap gap-3">
          {hobbies.map((hobby) => {
            const meta = HOBBY_META[hobby] ?? DEFAULT_HOBBY;
            return (
              <motion.li
                key={hobby}
                variants={fadeUp}
                whileHover={{ y: -4, scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="group relative"
              >
                <button
                  type="button"
                  aria-label={`${hobby} — ${meta.quip}`}
                  className="glass inline-flex cursor-default items-center gap-2 rounded-full px-4 py-2.5 text-sm text-ink-200 outline-none transition-colors duration-300 hover:border-accent-400/50 hover:text-white hover:shadow-lg hover:shadow-accent-500/20 focus-visible:border-accent-400/60 focus-visible:text-white"
                >
                  <span
                    aria-hidden
                    className="text-lg leading-none transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-125 group-focus-within:-rotate-12 group-focus-within:scale-125"
                  >
                    {meta.emoji}
                  </span>
                  <span className="font-medium">{hobby}</span>
                </button>

                {/* Playful quip tooltip */}
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg border border-white/10 bg-ink-900/95 px-2.5 py-1 font-mono text-[11px] text-cyan-200 opacity-0 shadow-xl backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
                >
                  {meta.quip}
                </span>
              </motion.li>
            );
          })}
        </motion.ul>
      </motion.div>
    </Section>
  );
}
