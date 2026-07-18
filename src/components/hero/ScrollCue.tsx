import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/** Animated "scroll down" affordance anchored to the bottom of the hero. */
export function ScrollCue() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.a
      href="#about"
      aria-label="Scroll to the About section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.6 }}
      className="group absolute inset-x-0 bottom-6 mx-auto flex w-fit flex-col items-center gap-2 text-ink-400 transition-colors duration-300 hover:text-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
    >
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em]">
        Scroll
      </span>
      <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] transition-colors duration-300 group-hover:border-accent-400/40">
        <motion.span
          animate={reduceMotion ? undefined : { y: [0, 4, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 1.6, ease: "easeInOut", repeat: Infinity }
          }
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </motion.span>
      </span>
    </motion.a>
  );
}
