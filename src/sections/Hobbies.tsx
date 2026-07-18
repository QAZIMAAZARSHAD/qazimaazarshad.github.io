import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { hobbies } from "@/data/content";

const HOBBY_META: Record<string, { emoji: string; quip: string }> = {
  Movies: { emoji: "🎬", quip: "Jai Mahishmati!" },
  "Web Series": { emoji: "📺", quip: "Valar Morghulis" },
  Anime: { emoji: "🍥", quip: "Tatakae! Tatakae!" },
  Music: { emoji: "🎧", quip: "Every commit has a soundtrack." },
  "Pro Wrestling (WWE)": { emoji: "🤼", quip: "Hustle, Loyalty, Respect" },
  Cricket: { emoji: "🏏", quip: "Cover drives & run chases." },
  Badminton: { emoji: "🏸", quip: "Smash first, ask later." },
  Chess: { emoji: "♟️", quip: "Three moves ahead." },
  "Video Games": { emoji: "🎮", quip: "One more run, promise." },
  Quizzing: { emoji: "🧠", quip: "Trivia? Bring it on." },
};
const DEFAULT_HOBBY = { emoji: "✨", quip: "Good vibes only." };

export function Hobbies() {
  return (
    <Section id="hobbies">
      <SectionHeading kicker="Off the clock" title="Beyond the code" />

      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="flex flex-wrap gap-3"
      >
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
    </Section>
  );
}
