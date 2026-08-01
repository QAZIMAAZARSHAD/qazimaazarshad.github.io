import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface CountUpProps {
  readonly value: number;
  /** Rendered before the number (e.g. "$"). */
  readonly prefix?: string;
  /** Rendered after the number (e.g. "+"). */
  readonly suffix?: string;
  readonly className?: string;
  readonly durationMs?: number;
}

/** Cubic ease-out — fast start, gentle settle. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Animates an integer to `value` — from 0 the first time it scrolls into view,
 * and from the previous value whenever `value` changes afterward (so it also
 * animates on filter/search changes). Honors prefers-reduced-motion by snapping
 * to the final value. Formatted with `toLocaleString()`.
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  className,
  durationMs = 1800,
}: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(() => (reduceMotion ? value : 0));
  const displayRef = useRef(0);

  useEffect(() => {
    if (reduceMotion) {
      displayRef.current = value;
      setDisplay(value);
      return;
    }
    if (!inView) return;

    const from = displayRef.current;
    if (from === value) return;

    let raf = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      start ??= now;
      const t = Math.min(1, (now - start) / durationMs);
      const current = Math.round(from + (value - from) * easeOut(t));
      displayRef.current = current;
      setDisplay(current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, durationMs, reduceMotion]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
