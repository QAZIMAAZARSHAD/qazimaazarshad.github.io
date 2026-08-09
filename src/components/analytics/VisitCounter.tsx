import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { analytics } from "@/data/content";
import { bumpCount } from "@/lib/counter";

const PATH = analytics.visitCounter;
const COUNT_UP_MS = 1200;

/**
 * Footer visit counter backed by Abacus. Each real load bumps the total and
 * animates the number in.
 *
 * Renders nothing until it resolves, and nothing at all if the request fails,
 * so a blocked or down backend leaves a gap rather than a broken counter.
 */
export function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [display, setDisplay] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let alive = true;
    void bumpCount(PATH).then((n) => {
      if (alive && n !== null) setCount(n);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (count == null) return;
    if (reduceMotion) {
      setDisplay(count);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / COUNT_UP_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(count * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count, reduceMotion]);

  if (!count) return null;

  return (
    // A span rather than a paragraph: role=paragraph forbids an accessible
    // name, so the label would be dropped by assistive tech (and flagged by axe).
    <motion.span
      data-testid="visit-counter"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      aria-label={`${count.toLocaleString()} total visits`}
      title={`${count.toLocaleString()} total visits`}
      className="inline-flex items-center gap-2 font-mono text-xs text-ink-400"
    >
      <span aria-hidden className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      <span className="tabular-nums text-white">
        {display.toLocaleString()}
      </span>{" "}
      {count === 1 ? "visit" : "visits"}
    </motion.span>
  );
}
