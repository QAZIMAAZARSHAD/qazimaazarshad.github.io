import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

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

export const REVEAL_MS = 750;
const WELCOME_MS = 4400;
const HOLD_MS = 1400;
const HOLD_MS_REDUCED = 1200;

interface Greeting {
  code: string;
  text: string;
}

function visitorLanguage(): string {
  const tag = (navigator.language || "en").toLowerCase();
  const base = tag.split("-")[0];
  // Own-property check: a tag like "constructor" would otherwise inherit from
  // Object.prototype. Object.hasOwn reads better but needs an ES2022 lib.
  return Object.prototype.hasOwnProperty.call(GREETINGS, base) // NOSONAR
    ? base
    : "en";
}

interface WelcomeProps {
  readonly onDone: () => void;
}

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

  const stepMs = Math.round(
    (WELCOME_MS - REVEAL_MS - HOLD_MS) / Math.max(1, lastIndex),
  );

  // `onDone` must be referentially stable: a new identity each render would
  // restart this effect and leave the flash stuck on the first two greetings.
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

    // Background tabs clamp timers to ~1s, stretching the flash past the
    // intro's safety timeout. Hold until the tab is actually looked at.
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
      <output className="sr-only">
        {settled ? <span lang={greeting.code}>{greeting.text}</span> : ""}
      </output>

      <div
        aria-hidden
        className="relative flex min-h-[1.5em] items-center justify-center text-[clamp(2.75rem,9vw,7rem)] font-extrabold leading-[1.15]"
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
