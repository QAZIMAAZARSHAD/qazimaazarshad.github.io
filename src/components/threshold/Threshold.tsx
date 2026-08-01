import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ChevronDown, Undo2 } from "lucide-react";
import { earliestYear } from "@/data/content";

/** The stretch of scroll over which the year winds back. */
const REWIND_FROM = 0.18;
const REWIND_TO = 0.62;

/**
 * The seam between the working life above and everything that led to it below.
 *
 * Scrolling into it winds a year counter backwards from now to the earliest
 * date the content below can support, over a floor that recedes to a horizon —
 * so the separation is something you travel through rather than a rule on the
 * page. Under reduced motion it simply arrives at the far year.
 */
export function Threshold() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(reduceMotion ? earliestYear : thisYear);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const winding = useTransform(
    scrollYProgress,
    [REWIND_FROM, REWIND_TO],
    [thisYear, earliestYear],
    { clamp: true },
  );

  // Only whole years reach React, so this re-renders a handful of times across
  // the whole scroll rather than every frame.
  useMotionValueEvent(winding, "change", (value) => {
    if (!reduceMotion) setYear(Math.round(value));
  });

  // The horizon opens as the seam arrives, and the floor runs under you.
  const horizon = useTransform(scrollYProgress, [0, 0.35], [0.15, 1]);
  const travel = useTransform(scrollYProgress, [0, 1], ["0px", "512px"]);

  return (
    <section
      ref={ref}
      id="threshold"
      className="relative isolate overflow-hidden scroll-mt-24 py-28 sm:py-36"
    >
      {/* A floor running back to the horizon: the distance is the point. It is
          laid out with left/width rather than a translate, because the arbitrary
          transform below would otherwise overwrite Tailwind's. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 top-1/2 overflow-hidden"
      >
        <motion.div
          style={{
            transform: "perspective(300px) rotateX(64deg)",
            transformOrigin: "50% 0%",
            backgroundPositionY: reduceMotion ? undefined : travel,
          }}
          className="absolute left-[-80%] top-0 h-[260%] w-[260%] bg-[linear-gradient(to_right,rgba(129,140,248,0.30)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.26)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,transparent,#000_20%,rgba(0,0,0,0.5)_46%,transparent_70%)]"
        />
      </div>

      <motion.div
        aria-hidden
        style={{ scaleX: reduceMotion ? 1 : horizon }}
        className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-accent-400/70 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-40 -translate-y-1/2 bg-[radial-gradient(60%_100%_at_50%_50%,rgba(99,102,241,0.18),transparent_70%)]"
      />

      <div className="container-page relative text-center">
        <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.4em] text-ink-500">
          <Undo2 className="h-3.5 w-3.5" aria-hidden />
          Rewind
        </p>

        <p
          aria-hidden
          data-testid="threshold-year"
          className="mt-4 select-none bg-gradient-to-b from-white via-accent-200 to-accent-500/30 bg-clip-text font-display text-[clamp(4rem,16vw,12rem)] font-extrabold leading-none tracking-tighter text-transparent tabular-nums drop-shadow-[0_0_60px_rgba(99,102,241,0.25)]"
        >
          {year}
        </p>

        <h2 className="mt-6 font-display text-2xl font-bold text-white sm:text-3xl">
          Where the habit started
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-pretty text-ink-300">
          Late nights, first internships, and a long tail of things nobody asked
          me to build. The oldest is from {earliestYear}; the newest is from
          this year, and still has fingerprints on it.
        </p>

        <a
          href="#earlier"
          aria-label="Keep going — to the Foundations section"
          className="group mt-10 inline-flex flex-col items-center gap-2 text-ink-400 transition-colors duration-300 hover:text-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
        >
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em]">
            Keep going
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
        </a>
      </div>
    </section>
  );
}
