import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Greetings flashed before the visitor's own language lands last. */
const GREETINGS: Record<string, string> = {
  en: "Hello",
  hi: "नमस्ते",
  ur: "السلام علیکم",
  bn: "নমস্কার",
  ta: "வணக்கம்",
  es: "Hola",
  fr: "Bonjour",
  de: "Hallo",
  it: "Ciao",
  pt: "Olá",
  nl: "Hallo",
  ru: "Привет",
  ja: "こんにちは",
  zh: "你好",
  ko: "안녕하세요",
  ar: "مرحبا",
  tr: "Merhaba",
};

/**
 * The flash order; the visitor's own greeting is appended last. Kept to twelve
 * so each one still gets ~240ms inside the shorter budget — enough to read.
 */
const FLASH_ORDER = [
  "hi",
  "ur",
  "bn",
  "ta",
  "ja",
  "zh",
  "ko",
  "ar",
  "ru",
  "fr",
  "es",
  "de",
];

const RTL = new Set(["ar", "ur"]);
/**
 * Scripts the display face can't render — Sora ships latin subsets only, so
 * these fall back anyway. Naming the fallback keeps it deliberate, and the
 * display face's tight tracking is dropped since it pinches joined scripts.
 */
const NON_LATIN = new Set([
  "hi",
  "ur",
  "bn",
  "ta",
  "ru",
  "ja",
  "zh",
  "ko",
  "ar",
]);

/** How long the curtain takes to part. Shared so the budget below stays true. */
export const REVEAL_MS = 750;
/** Total time the welcome screen is on screen, reveal included. */
const WELCOME_MS = 5000;
/** Of the remaining budget, how long the visitor's greeting holds once it lands. */
const HOLD_MS = 1400;
/** Reduced motion skips the flash, so it shouldn't sit on a static screen. */
const HOLD_MS_REDUCED = 1200;

interface Greeting {
  code: string;
  text: string;
}

function visitorLanguage(): string {
  const tag = (navigator.language || "en").toLowerCase();
  const base = tag.split("-")[0];
  // An own-property check, not truthiness: a tag like "constructor" would
  // inherit from Object.prototype and resolve to something that isn't a
  // greeting at all. Object.hasOwn would read better but needs an ES2022 lib.
  return Object.prototype.hasOwnProperty.call(GREETINGS, base) // NOSONAR
    ? base
    : "en";
}

interface WelcomeProps {
  readonly onDone: () => void;
}

/**
 * The greeting that plays between the loader and the site: a burst of "hello"
 * in a dozen languages that lands on the visitor's own, resolved from their
 * browser language.
 *
 * The flash itself is hidden from assistive tech — narrating fifteen untagged
 * scripts would queue up announcements long after the intro is gone — and only
 * the greeting it settles on is announced.
 *
 * Under reduced motion the flashing is skipped entirely and the final greeting
 * is shown once, briefly.
 */
export function Welcome({ onDone }: WelcomeProps) {
  const reduceMotion = useReducedMotion();

  const sequence = useMemo<Greeting[]>(() => {
    const own = visitorLanguage();
    const flashes = FLASH_ORDER.filter((code) => code !== own).map((code) => ({
      code,
      text: GREETINGS[code],
    }));
    return [...flashes, { code: own, text: GREETINGS[own] }];
  }, []);

  const lastIndex = sequence.length - 1;
  const [index, setIndex] = useState(reduceMotion ? lastIndex : 0);
  const settled = index === lastIndex;
  const greeting = sequence[index];

  // Spread the flash across whatever the hold and the reveal leave behind, so
  // the screen is gone at WELCOME_MS however many languages are shown.
  const stepMs = Math.round(
    (WELCOME_MS - REVEAL_MS - HOLD_MS) / Math.max(1, lastIndex),
  );

  // Flash through the greetings, then hold on the visitor's own and finish.
  // `onDone` must be referentially stable (it is a useCallback in Preloader):
  // a new identity each render would restart this effect, reset `step`, and
  // leave the flash oscillating between the first two greetings forever.
  useEffect(() => {
    if (reduceMotion) {
      const done = window.setTimeout(onDone, HOLD_MS_REDUCED);
      return () => window.clearTimeout(done);
    }

    let step = 0;
    let done = 0;
    let timer = 0;

    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };
    const advance = () => {
      step += 1;
      setIndex(step);
      if (step >= lastIndex) {
        stop();
        done = window.setTimeout(onDone, HOLD_MS);
      }
    };
    const start = () => {
      if (!timer && step < lastIndex)
        timer = window.setInterval(advance, stepMs);
    };

    // Background tabs clamp timers to ~1s, which would stretch the flash past
    // the intro's own safety timeout. Hold it until the tab is actually looked
    // at, so the sequence the visitor sees is the one that was designed.
    const onVisibility = () => (document.hidden ? stop() : start());
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.clearTimeout(done);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduceMotion, lastIndex, stepMs, onDone]);

  const nonLatin = NON_LATIN.has(greeting.code);

  return (
    <div
      data-testid="welcome"
      data-settled={settled}
      className="relative flex flex-col items-center gap-6 px-6 text-center"
    >
      {/* Announce only what it lands on, not every frame of the flash. */}
      <output className="sr-only">
        {settled ? <span lang={greeting.code}>{greeting.text}</span> : ""}
      </output>

      <div
        aria-hidden
        className="relative flex min-h-[1.5em] items-center justify-center text-[clamp(2.75rem,9vw,7rem)] font-black leading-[1.15]"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={index}
            lang={greeting.code}
            dir={RTL.has(greeting.code) ? "rtl" : "ltr"}
            initial={reduceMotion ? false : { opacity: 0, y: "35%" }}
            animate={{ opacity: 1, y: "0%" }}
            exit={reduceMotion ? undefined : { opacity: 0, y: "-35%" }}
            transition={{ duration: settled ? 0.5 : 0.2, ease: "easeOut" }}
            style={
              nonLatin ? { fontFamily: "system-ui, sans-serif" } : undefined
            }
            className={cn(
              nonLatin ? "tracking-normal" : "font-display tracking-tight",
              settled
                ? "bg-gradient-to-r from-accent-400 via-cyan-300 to-accent-400 bg-clip-text text-transparent"
                : "text-ink-300",
            )}
          >
            {greeting.text}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* A hairline that draws itself under the greeting once it lands. */}
      <motion.span
        aria-hidden
        initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
        animate={
          settled ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }
        }
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-px w-32 bg-gradient-to-r from-transparent via-accent-400/70 to-transparent"
      />
    </div>
  );
}
