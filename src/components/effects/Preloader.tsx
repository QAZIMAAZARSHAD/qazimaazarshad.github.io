import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { EntryDoor, PULL_MS } from "./EntryDoor";
import { asset } from "@/lib/utils";
import { REVEAL_MS, Welcome } from "./Welcome";

/** Minimum time the loader stays up so it never just flickers. */
const MIN_DISPLAY_MS = 600;
/** Safety net for a stalled load, so the door always eventually appears. */
const MAX_LOADING_MS = 8000;
/** Safety net for the greeting itself; must outlast its own 4.4s budget. */
const MAX_WELCOME_MS = 9000;

type Phase = "loading" | "gate" | "welcome" | "done";

/** Played as mastered — the visitor opened the door, so let it land. */
const INTRO_VOLUME = 1;

/** Ease the track out rather than cutting it dead when the intro ends. */
function fadeOutAndStop(audio: HTMLAudioElement) {
  const step = audio.volume / 8;
  const fade = window.setInterval(() => {
    audio.volume = Math.max(0, audio.volume - step);
    if (audio.volume <= 0.01) {
      window.clearInterval(fade);
      audio.pause();
    }
  }, 40);
}

/**
 * The entry sequence: loader, a door the visitor opens, then a greeting and a
 * curtain split revealing the page. The door exists because browsers refuse
 * audible playback until the visitor has interacted — that click starts the
 * music.
 *
 * One overlay spans every phase and keeps `data-testid="preloader"` throughout;
 * the e2e suite waits on it to know the intro is still up.
 */
export function Preloader() {
  const [phase, setPhase] = useState<Phase>("loading");
  const reduceMotion = useReducedMotion();
  const fallbackRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const enterRef = useRef<HTMLButtonElement>(null);
  const openingRef = useRef(0);
  const [entering, setEntering] = useState(false);
  const finishIntro = useCallback(() => setPhase("done"), []);
  // Guarded so a skip that already ended the intro can't be undone by the
  // pending hand-off from the loader.
  const openDoor = useCallback(
    () => setPhase((p) => (p === "loading" ? "gate" : p)),
    [],
  );

  useEffect(() => {
    const start = performance.now();
    let handoff = 0;

    const toGate = () => {
      const elapsed = performance.now() - start;
      handoff = window.setTimeout(
        openDoor,
        Math.max(0, MIN_DISPLAY_MS - elapsed),
      );
    };

    if (document.readyState === "complete") {
      toGate();
    } else {
      window.addEventListener("load", toGate, { once: true });
    }

    // Only guards a stalled load — the door itself waits as long as it takes.
    const fallback = window.setTimeout(openDoor, MAX_LOADING_MS);

    return () => {
      window.removeEventListener("load", toGate);
      window.clearTimeout(fallback);
      window.clearTimeout(handoff);
    };
  }, [openDoor]);

  // Opening the door is the gesture the browser was waiting for, so the track
  // is started from inside the click handler where the permission applies.
  const enter = useCallback(() => {
    // A held Enter auto-repeats; nothing downstream should run twice.
    if (openingRef.current) return;
    const audio = audioRef.current;
    if (audio) {
      audio.muted = false;
      audio.volume = INTRO_VOLUME;
      try {
        // Environments without media support return undefined, not a promise.
        const started = audio.play() as Promise<void> | undefined;
        started?.catch(() => {});
      } catch {
        /* no audio support — the greeting plays silent */
      }
    }
    // Let the shockwave read before handing over to the greeting.
    setEntering(true);
    openingRef.current = window.setTimeout(
      () => setPhase((p) => (p === "gate" ? "welcome" : p)),
      PULL_MS,
    );
  }, []);

  // Arm the safety net only once the greeting is running; it can't strand
  // anyone at the door, which is waiting for them on purpose.
  useEffect(() => {
    if (phase !== "welcome") return;
    fallbackRef.current = window.setTimeout(finishIntro, MAX_WELCOME_MS);
    return () => window.clearTimeout(fallbackRef.current);
  }, [phase, finishIntro]);

  // Send focus to the door so it can be opened from the keyboard alone.
  useEffect(() => {
    if (phase === "gate") enterRef.current?.focus();
  }, [phase]);

  useEffect(() => () => window.clearTimeout(openingRef.current), []);

  // Buffer the track while the loader and the door are up, so it starts the
  // instant the door is opened rather than a beat later.
  useEffect(() => {
    const audio = new Audio(asset("audio/intro.mp3"));
    audio.preload = "auto";
    audio.volume = INTRO_VOLUME;
    audioRef.current = audio;
    return () => {
      audioRef.current = null;
      audio.pause();
    };
  }, []);

  // Fade the track out with the curtain instead of cutting it dead.
  useEffect(() => {
    if (phase !== "done") return;
    const audio = audioRef.current;
    if (audio) fadeOutAndStop(audio);
  }, [phase]);

  // Let an impatient visitor cut through the greeting — but never at the door,
  // where a stray key would dismiss the intro instead of opening it.
  useEffect(() => {
    if (phase !== "welcome") return;
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

  // Painted behind an opaque overlay, the page has to leave the accessibility
  // tree too, or a screen reader can browse it while it's hidden. The intro
  // lives inside #root, so its siblings are inerted rather than the root.
  useEffect(() => {
    if (phase === "done") return;
    const behind = [
      document.querySelector("main"),
      document.querySelector("header"),
      document.querySelector("footer"),
    ].filter((el): el is HTMLElement => el instanceof HTMLElement);

    for (const el of behind) {
      el.inert = true;
      el.setAttribute("aria-hidden", "true");
    }
    return () => {
      for (const el of behind) {
        el.inert = false;
        el.removeAttribute("aria-hidden");
      }
    };
  }, [phase]);

  // The lock swallows the browser's jump to "#section" on load, so replay it
  // once the intro is gone.
  useEffect(() => {
    if (phase !== "done") return;
    const target = window.location.hash.slice(1);
    if (!target) return;
    // "instant", not "auto": the latter defers to `scroll-behavior: smooth`
    // and would animate a two-second scroll on entry.
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
          // Not role="status", which is advisory — this blocks the page.
          role="dialog"
          aria-modal="true"
          aria-label="Welcome"
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
            {/* Ambient warmth behind the loader and the greeting. Not behind
            the door, which brings its own scenery. */}
            {phase !== "gate" && (
              <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-accent-600/20 blur-[120px]" />
            )}

            {phase === "loading" ? (
              <>
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
                          : {
                              repeat: Infinity,
                              duration: 1.1,
                              ease: "easeInOut",
                            }
                      }
                    />
                  </div>

                  <output className="font-mono text-[11px] uppercase tracking-[0.35em] text-ink-500">
                    Loading
                  </output>
                </div>
              </>
            ) : null}

            {phase === "gate" ? (
              <EntryDoor
                onEnter={enter}
                opening={entering}
                buttonRef={enterRef}
              />
            ) : null}

            {phase === "welcome" ? <Welcome onDone={finishIntro} /> : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
