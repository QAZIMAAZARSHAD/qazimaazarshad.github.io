import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_/[]{}=+*^?#0123456789";

interface Segment {
  c: string;
  scrambling: boolean;
}

interface ScrambleTextProps {
  readonly phrases: string[];
  readonly className?: string;
  /** How long each fully-resolved phrase stays before the next decode. */
  readonly holdMs?: number;
}

/**
 * Cycles through phrases with a hacker-style "decode" effect: characters
 * resolve from random glyphs to the target, staggered across the string. The
 * accessible name is a fixed, visually-hidden copy of the primary phrase (the
 * animated characters are aria-hidden) so screen readers aren't spammed. The
 * loop pauses while off-screen and stops entirely under prefers-reduced-motion.
 */
export function ScrambleText({
  phrases,
  className,
  holdMs = 2400,
}: ScrambleTextProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const [segments, setSegments] = useState<Segment[]>(() =>
    (phrases[0] ?? "").split("").map((c) => ({ c, scrambling: false })),
  );
  const indexRef = useRef(0);

  useEffect(() => {
    if (reduceMotion || phrases.length < 2 || !inView) return;
    let raf = 0;
    let holdTimer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const decodeTo = (to: string) => {
      const from = phrases[indexRef.current] ?? "";
      const length = Math.max(from.length, to.length);
      const queue = Array.from({ length }, (_, i) => {
        const start = Math.floor(Math.random() * 16);
        return {
          from: from[i] ?? "",
          to: to[i] ?? "",
          start,
          end: start + 12 + Math.floor(Math.random() * 22),
        };
      });

      let frame = 0;
      const tick = () => {
        if (cancelled) return;
        let done = 0;
        const next = queue.map<Segment>((q) => {
          if (frame >= q.end) {
            done++;
            return { c: q.to, scrambling: false };
          }
          if (frame >= q.start) {
            return {
              c: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
              scrambling: true,
            };
          }
          return { c: q.from, scrambling: false };
        });
        setSegments(next);

        if (done === queue.length) {
          indexRef.current = phrases.indexOf(to);
          holdTimer = setTimeout(() => {
            const nextIndex = (indexRef.current + 1) % phrases.length;
            decodeTo(phrases[nextIndex]);
          }, holdMs);
          return;
        }
        frame++;
        raf = requestAnimationFrame(tick);
      };
      tick();
    };

    holdTimer = setTimeout(
      () => decodeTo(phrases[(indexRef.current + 1) % phrases.length]),
      holdMs,
    );
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(holdTimer);
    };
  }, [reduceMotion, phrases, holdMs, inView]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{phrases[0]}</span>
      {reduceMotion ? (
        <span aria-hidden>{phrases[0]}</span>
      ) : (
        <span aria-hidden>
          {segments.map((seg, i) => (
            <span
              key={i}
              className={seg.scrambling ? "text-accent-400" : undefined}
            >
              {seg.c}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
