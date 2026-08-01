import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { REVEAL_MS, Welcome } from "./Welcome";

/** Minimum time the loader stays up so it never just flickers. */
const MIN_DISPLAY_MS = 600;
/**
 * Safety net so a stall can never trap the visitor behind the intro. Must stay
 * clear of the loader plus the full greeting, or it would cut them short.
 */
const MAX_DISPLAY_MS = 14000;

type Phase = "loading" | "welcome" | "done";

/**
 * The site's entry sequence: the loader, then a greeting, then a curtain split
 * that reveals the page.
 *
 * Both phases live under one overlay that keeps `data-testid="preloader"` for
 * its whole life — that attribute is the "the intro is still up" signal the
 * entire e2e suite waits on, so it has to cover the greeting too.
 */
export function Preloader() {
  const [phase, setPhase] = useState<Phase>("loading");
  const reduceMotion = useReducedMotion();
  const finishIntro = useCallback(() => setPhase("done"), []);
  // Guarded so a skip that already ended the intro can't be undone by the
  // pending hand-off from the loader.
  const startWelcome = useCallback(
    () => setPhase((p) => (p === "loading" ? "welcome" : p)),
    [],
  );

  useEffect(() => {
    const start = performance.now();
    let handoff = 0;

    const toWelcome = () => {
      const elapsed = performance.now() - start;
      handoff = window.setTimeout(
        startWelcome,
        Math.max(0, MIN_DISPLAY_MS - elapsed),
      );
    };

    if (document.readyState === "complete") {
      toWelcome();
    } else {
      window.addEventListener("load", toWelcome, { once: true });
    }

    // Never strand the visitor behind the intro, whatever stalls.
    const fallback = window.setTimeout(finishIntro, MAX_DISPLAY_MS);

    return () => {
      window.removeEventListener("load", toWelcome);
      window.clearTimeout(fallback);
      window.clearTimeout(handoff);
    };
  }, [finishIntro, startWelcome]);

  // Let an impatient visitor cut straight through.
  useEffect(() => {
    if (phase === "done") return;
    const skip = () => finishIntro();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [phase, finishIntro]);

  // Locks on <html>, not <body>: `html { overflow-x: clip }` stops the body's
  // overflow propagating to the viewport, so a body-level lock does nothing.
  useEffect(() => {
    if (phase === "done") return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [phase]);

  // The lock swallows the browser's jump to a "#section" on load, so a deep
  // link would otherwise land at the top of the page. Replay it once the
  // intro is out of the way — instantly, since this is page entry rather
  // than a navigation the visitor asked to watch.
  useEffect(() => {
    if (phase !== "done") return;
    const target = window.location.hash.slice(1);
    if (!target) return;
    // "instant", not "auto" — the latter defers to `scroll-behavior: smooth`
    // from index.css, which would animate a two-second scroll on page entry.
    document
      .getElementById(target)
      ?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [phase]);

  const curtain = {
    duration: REVEAL_MS / 1000,
    ease: [0.83, 0, 0.17, 1] as const,
  };

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="intro"
          data-testid="preloader"
          role="status"
          aria-label={phase === "loading" ? "Loading" : "Welcome"}
          className="fixed inset-0 z-[100]"
          exit="exit"
          initial="idle"
          animate="idle"
        >
          {/* Curtain halves — they part to reveal the page. */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-ink-950"
            variants={{
              idle: { y: "0%" },
              exit: reduceMotion ? { opacity: 0 } : { y: "-100%" },
            }}
            transition={curtain}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-ink-950"
            variants={{
              idle: { y: "0%" },
              exit: reduceMotion ? { opacity: 0 } : { y: "100%" },
            }}
            transition={curtain}
          />

          {/* Seam of light along the split. */}
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-accent-400 to-transparent"
            variants={{
              idle: { opacity: 0, scaleX: 0.2 },
              exit: { opacity: [0, 1, 0], scaleX: 1 },
            }}
            transition={{ duration: REVEAL_MS / 1000, ease: "easeOut" }}
          />

          <motion.div
            className="absolute inset-0 grid place-items-center"
            variants={{
              idle: { opacity: 1 },
              exit: { opacity: 0, transition: { duration: 0.25 } },
            }}
          >
            <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-accent-600/20 blur-[120px]" />

            {phase === "loading" ? (
              <div className="relative flex flex-col items-center gap-7">
                <div className="relative h-20 w-20">
                  <span className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-accent-500 to-cyan-400 opacity-50 blur-lg" />
                  <span className="absolute -inset-2 animate-spin rounded-[1.4rem] border-2 border-transparent border-t-accent-400 border-r-cyan-400/60 [animation-duration:1.1s]" />
                  <span className="relative grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-accent-500 via-accent-400 to-cyan-400 font-display text-2xl font-bold tracking-tight text-white shadow-xl shadow-accent-500/30">
                    QMA
                  </span>
                </div>

                <div className="relative h-1 w-44 overflow-hidden rounded-full bg-white/10">
                  <motion.span
                    className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-accent-500 to-cyan-400"
                    animate={
                      reduceMotion ? { x: "120%" } : { x: ["-120%", "360%"] }
                    }
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
            ) : (
              <Welcome onDone={finishIntro} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
