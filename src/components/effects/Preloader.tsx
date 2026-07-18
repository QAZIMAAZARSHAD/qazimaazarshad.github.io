import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/** Minimum time the loader stays up so it never just flickers. */
const MIN_DISPLAY_MS = 600;
/** Safety net so we never trap the user behind the loader. */
const MAX_DISPLAY_MS = 3000;

/**
 * Fancy first-paint loader: an animated QMA monogram with a spinning gradient
 * ring and an indeterminate progress bar. Fades out once the window has loaded
 * (or after a hard timeout), then unmounts.
 */
export function Preloader() {
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const start = performance.now();
    let hideTimer = 0;

    const finish = () => {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, MIN_DISPLAY_MS - elapsed);
      hideTimer = window.setTimeout(() => setVisible(false), wait);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    const fallback = window.setTimeout(() => setVisible(false), MAX_DISPLAY_MS);

    return () => {
      window.removeEventListener("load", finish);
      window.clearTimeout(fallback);
      window.clearTimeout(hideTimer);
    };
  }, []);

  // Lock scroll while the loader covers the page.
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          data-testid="preloader"
          role="status"
          aria-label="Loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] grid place-items-center bg-ink-950"
        >
          {/* soft aura */}
          <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-accent-600/20 blur-[120px]" />

          <div className="relative flex flex-col items-center gap-7">
            <div className="relative h-20 w-20">
              {/* pulsing glow */}
              <span className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-accent-500 to-cyan-400 opacity-50 blur-lg" />
              {/* spinning ring */}
              <span className="absolute -inset-2 animate-spin rounded-[1.4rem] border-2 border-transparent border-t-accent-400 border-r-cyan-400/60 [animation-duration:1.1s]" />
              {/* monogram tile */}
              <span className="relative grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-accent-500 via-accent-400 to-cyan-400 font-display text-2xl font-bold tracking-tight text-white shadow-xl shadow-accent-500/30">
                QMA
              </span>
            </div>

            {/* indeterminate progress bar */}
            <div className="relative h-1 w-44 overflow-hidden rounded-full bg-white/10">
              <motion.span
                className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-accent-500 to-cyan-400"
                animate={reduceMotion ? { x: "120%" } : { x: ["-120%", "360%"] }}
                transition={
                  reduceMotion
                    ? undefined
                    : { repeat: Infinity, duration: 1.1, ease: "easeInOut" }
                }
              />
            </div>

            <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-ink-500">
              Loading
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
