import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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

/** The flash order; the visitor's own greeting is appended last. */
const FLASH_ORDER = [
  "hi",
  "ur",
  "ja",
  "fr",
  "ar",
  "ru",
  "es",
  "zh",
  "ta",
  "de",
  "ko",
  "pt",
  "it",
  "bn",
  "tr",
];

/** How long the curtain takes to part. Shared so the budget below stays true. */
export const REVEAL_MS = 750;
/** Total time the welcome screen is on screen, reveal included. */
const WELCOME_MS = 6500;
/** Of the remaining budget, how long the visitor's greeting holds once it lands. */
const HOLD_MS = 2300;
/** Reduced motion skips the flash, so it shouldn't sit on a static screen. */
const HOLD_MS_REDUCED = 1200;

/** Where the site's owner is, for the "how far apart are we" line. */
const OWNER_TZ_OFFSET_MIN = 330; // IST, UTC+5:30
const OWNER_CITY = "Bengaluru";

function visitorLanguage(): string {
  const tag = (navigator.language || "en").toLowerCase();
  const base = tag.split("-")[0];
  return GREETINGS[base] ? base : "en";
}

function timeOfDay(hour: number): string {
  if (hour < 5) return "You're up late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good evening";
}

/** e.g. "Bengaluru is 9h 30m ahead" — or null when we're in the same zone. */
function distanceFromOwner(date: Date): string | null {
  const visitorOffset = -date.getTimezoneOffset();
  const diff = OWNER_TZ_OFFSET_MIN - visitorOffset;
  if (diff === 0) return null;
  const hours = Math.floor(Math.abs(diff) / 60);
  const minutes = Math.abs(diff) % 60;
  const span = [hours ? `${hours}h` : "", minutes ? `${minutes}m` : ""]
    .filter(Boolean)
    .join(" ");
  return `${OWNER_CITY} is ${span} ${diff > 0 ? "ahead" : "behind"}`;
}

interface WelcomeProps {
  readonly onDone: () => void;
}

/**
 * The greeting that plays between the loader and the site: a burst of "hello"
 * in a dozen languages that lands on the visitor's own, then a line telling
 * them what time it is where they are and how far that is from Bengaluru.
 *
 * Under reduced motion the flashing is skipped entirely and the final greeting
 * is shown once, briefly.
 */
export function Welcome({ onDone }: WelcomeProps) {
  const reduceMotion = useReducedMotion();

  const { sequence, meta } = useMemo(() => {
    const own = visitorLanguage();
    const flashes = FLASH_ORDER.filter((code) => code !== own).map(
      (code) => GREETINGS[code],
    );
    const now = new Date();
    const apart = distanceFromOwner(now);
    return {
      sequence: [...flashes, GREETINGS[own]],
      meta: {
        greeting: timeOfDay(now.getHours()),
        time: now.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }),
        apart,
      },
    };
  }, []);

  const lastIndex = sequence.length - 1;
  const [index, setIndex] = useState(reduceMotion ? lastIndex : 0);
  const settled = index === lastIndex;

  // Spread the flash across whatever the hold and the reveal leave behind, so
  // the screen is gone at WELCOME_MS however many languages are shown.
  const stepMs = Math.round(
    (WELCOME_MS - REVEAL_MS - HOLD_MS) / Math.max(1, lastIndex),
  );

  // Flash through the greetings, then hold on the visitor's own and finish.
  useEffect(() => {
    if (reduceMotion) {
      const done = window.setTimeout(onDone, HOLD_MS_REDUCED);
      return () => window.clearTimeout(done);
    }

    let step = 0;
    let done = 0;
    const timer = window.setInterval(() => {
      step += 1;
      setIndex(step);
      if (step >= lastIndex) {
        window.clearInterval(timer);
        done = window.setTimeout(onDone, HOLD_MS);
      }
    }, stepMs);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(done);
    };
  }, [reduceMotion, lastIndex, stepMs, onDone]);

  return (
    <div
      data-testid="welcome"
      data-settled={settled}
      className="relative flex flex-col items-center gap-6 px-6 text-center"
    >
      <div className="relative flex h-[1.2em] items-center justify-center font-display text-[clamp(2.75rem,9vw,7rem)] font-black leading-none tracking-tight">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={index}
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: "35%", filter: "blur(6px)" }
            }
            animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
            exit={
              reduceMotion
                ? undefined
                : { opacity: 0, y: "-35%", filter: "blur(6px)" }
            }
            transition={{ duration: settled ? 0.5 : 0.2, ease: "easeOut" }}
            className={
              settled
                ? "bg-gradient-to-r from-accent-400 via-cyan-300 to-accent-400 bg-clip-text text-transparent"
                : "text-ink-300"
            }
          >
            {sequence[index]}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={settled ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-3"
      >
        <span
          aria-hidden
          className="h-px w-24 bg-gradient-to-r from-transparent via-accent-400/70 to-transparent"
        />
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-400">
          {meta.greeting} · {meta.time} your time
        </p>
        {meta.apart && (
          <p className="font-mono text-[11px] tracking-[0.2em] text-ink-600">
            {meta.apart}
          </p>
        )}
      </motion.div>
    </div>
  );
}
