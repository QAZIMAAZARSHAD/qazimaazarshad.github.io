import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { asset } from "@/lib/utils";
import { REVEAL_MS, Welcome } from "./Welcome";

/** Minimum time the loader stays up so it never just flickers. */
const MIN_DISPLAY_MS = 600;
/**
 * Safety net so a stall can never trap the visitor behind the intro. Must stay
 * clear of the loader plus the full greeting, or it would cut them short.
 */
const MAX_DISPLAY_MS = 14000;

type Phase = "loading" | "welcome" | "done";

/** Gentle — this plays unprompted, so it should never be the loudest thing. */
const INTRO_VOLUME = 0.4;

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
  const fallbackRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  /** "none" = nothing is playing; "off" = playing but muted by policy. */
  const [sound, setSound] = useState<"none" | "on" | "off">("none");
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
    fallbackRef.current = fallback;

    return () => {
      window.removeEventListener("load", toWelcome);
      window.clearTimeout(fallback);
      window.clearTimeout(handoff);
    };
  }, [finishIntro, startWelcome]);

  // Buffer the track while the loader is still up, so it starts with the
  // greeting rather than a beat after it.
  useEffect(() => {
    if (reduceMotion) return;
    const audio = new Audio(asset("audio/intro.mp3"));
    audio.preload = "auto";
    audio.volume = INTRO_VOLUME;
    audioRef.current = audio;
    return () => {
      audioRef.current = null;
      audio.pause();
    };
  }, [reduceMotion]);

  // Browsers refuse unprompted *audible* playback until a visitor has built up
  // media engagement with the site — a fresh or incognito profile always will.
  // Muted playback is never refused, so fall back to that: the track runs from
  // the top either way and a single click turns the sound on, rather than
  // demanding a gesture before the intro can even start.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || phase !== "welcome") return;
    let cancelled = false;

    const start = async () => {
      try {
        audio.muted = false;
        await audio.play();
        if (!cancelled) setSound("on");
      } catch {
        try {
          audio.muted = true;
          await audio.play();
          if (!cancelled) setSound("off");
        } catch {
          if (!cancelled) setSound("none");
        }
      }
    };
    void start();

    return () => {
      cancelled = true;
      setSound("none");
      fadeOutAndStop(audio);
    };
  }, [phase]);

  // Retire the safety net the moment it's moot, rather than letting it fire
  // against a finished intro.
  useEffect(() => {
    if (phase === "done") window.clearTimeout(fallbackRef.current);
  }, [phase]);

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

  // The page is painted behind an opaque overlay, so it has to be taken out of
  // the accessibility tree too — otherwise a screen reader can browse and
  // activate the whole portfolio while it's visually hidden. The intro lives
  // inside #root, so its siblings are inerted rather than the root itself.
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

  const toggleSound = (event: React.MouseEvent | React.PointerEvent) => {
    // The whole window is a skip target, so this click must stop there.
    event.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    const turningOn = audio.muted;
    audio.muted = !turningOn;
    if (turningOn) {
      audio.volume = INTRO_VOLUME;
      // This click is the gesture the browser was holding out for.
      void audio.play().catch(() => {});
    }
    setSound(turningOn ? "on" : "off");
  };

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
          // Not role="status": that's advisory, and this blocks the page. The
          // live announcements are scoped to the text that actually changes.
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

                <output className="font-mono text-[11px] uppercase tracking-[0.35em] text-ink-500">
                  Loading
                </output>
              </div>
            ) : (
              <Welcome onDone={finishIntro} />
            )}
          </motion.div>

          {/* Shown only while the track is genuinely running, so it never
              offers to control silence. When the browser muted us, it reads as
              an invitation rather than a toggle. */}
          {sound !== "none" && (
            <motion.button
              type="button"
              // The skip listeners sit on the window, so this control has to
              // keep its own events from reaching them — otherwise reaching
              // for sound would dismiss the greeting. Only `click` toggles;
              // the others merely stop there.
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              onClick={toggleSound}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              aria-label={
                sound === "on" ? "Mute intro music" : "Play intro music"
              }
              className="absolute bottom-8 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
            >
              {sound === "on" ? (
                <Volume2 className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <VolumeX className="h-3.5 w-3.5" aria-hidden />
              )}
              {sound === "on" ? "Mute" : "Sound on"}
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
