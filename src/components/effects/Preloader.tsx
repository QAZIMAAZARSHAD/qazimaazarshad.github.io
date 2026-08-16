import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { EntryDoor, PULL_MS } from "./EntryDoor";
import { useMarkEntered } from "./IntroProvider";
import { LoaderStage } from "./LoaderStage";
import { asset } from "@/lib/utils";
import { REVEAL_MS, Welcome } from "./Welcome";

const ENTRANCE_LEAD_MS = REVEAL_MS / 2;
const MAX_WELCOME_MS = 9000;

type Phase = "loading" | "gate" | "welcome" | "done";

const INTRO_VOLUME = 1;

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

interface PreloaderProps {
  /**
   * Whether the page behind the intro has rendered. It mounts a frame late, so
   * the pass that hides it from assistive tech has to run again once it is
   * actually there.
   */
  readonly pageMounted?: boolean;
}

export function Preloader({ pageMounted = true }: PreloaderProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const reduceMotion = useReducedMotion();
  const markEntered = useMarkEntered();
  const fallbackRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const enterRef = useRef<HTMLButtonElement>(null);
  const openingRef = useRef(0);
  const [entering, setEntering] = useState(false);
  const finishIntro = useCallback(() => setPhase("done"), []);
  const openDoor = useCallback(
    () => setPhase((p) => (p === "loading" ? "gate" : p)),
    [],
  );

  // Start audio inside the click — browsers require a user gesture.
  const enter = useCallback(() => {
    if (openingRef.current) return;
    const audio = audioRef.current;
    if (audio) {
      audio.muted = false;
      audio.volume = INTRO_VOLUME;
      try {
        const started = audio.play() as Promise<void> | undefined;
        started?.catch(() => {});
      } catch {
        /* no audio support */
      }
    }
    setEntering(true);
    openingRef.current = window.setTimeout(
      () => setPhase((p) => (p === "gate" ? "welcome" : p)),
      PULL_MS,
    );
  }, []);

  useEffect(() => {
    if (phase !== "welcome") return;
    fallbackRef.current = window.setTimeout(finishIntro, MAX_WELCOME_MS);
    return () => window.clearTimeout(fallbackRef.current);
  }, [phase, finishIntro]);

  useEffect(() => {
    if (phase === "gate") enterRef.current?.focus();
  }, [phase]);

  useEffect(() => () => window.clearTimeout(openingRef.current), []);

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

  useEffect(() => {
    if (phase !== "done") return;
    const audio = audioRef.current;
    if (audio) fadeOutAndStop(audio);
  }, [phase]);

  // Delay markEntered so hero entrance isn't finished behind the curtain.
  useEffect(() => {
    if (phase !== "done") return;
    if (reduceMotion) {
      markEntered();
      return;
    }
    const id = window.setTimeout(markEntered, ENTRANCE_LEAD_MS);
    return () => window.clearTimeout(id);
  }, [phase, markEntered, reduceMotion]);

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

  // Lock <html>: overflow-x: clip on html stops body overflow from locking.
  useEffect(() => {
    if (phase === "done") return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [phase]);

  // Inert every sibling — floating widgets sit outside main/header/footer.
  useEffect(() => {
    if (phase === "done") return;
    const overlay = document.querySelector('[data-testid="preloader"]');
    const behind = [...(overlay?.parentElement?.children ?? [])].filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== overlay,
    );

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
  }, [phase, pageMounted]);

  useEffect(() => {
    if (phase !== "done") return;
    const target = window.location.hash.slice(1);
    if (!target) return;
    // "instant" avoids scroll-behavior: smooth on entry.
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
          role="dialog"
          aria-modal="true"
          aria-label="Welcome"
          className="fixed inset-0 z-[100]"
          exit="exit"
          initial="idle"
          animate="idle"
        >
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
            {phase === "welcome" && (
              <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-accent-600/20 blur-[120px]" />
            )}

            <AnimatePresence>
              {phase === "loading" && <LoaderStage onDone={openDoor} />}
            </AnimatePresence>

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
