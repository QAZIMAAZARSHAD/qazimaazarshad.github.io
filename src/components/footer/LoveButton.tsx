import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, Send } from "lucide-react";
import { analytics } from "@/data/content";
import { bumpCount, countsForReal, readCount } from "@/lib/counter";
import { hasLoved, rememberLove, sendLove } from "@/lib/reactions";
import { cn } from "@/lib/utils";

const COUNTER = analytics.loveCounter;
const NOTE_LIMIT = 140;

/** Petals thrown out when the heart is tapped. */
const BURST = [-52, -26, 0, 26, 52];

type Stage = "idle" | "loved" | "thanked";

/**
 * The footer's reaction: a heart that anyone can tap, and a line they can leave
 * if they want to say more. The tap relays to my inbox through Web3Forms —
 * there is no backend here — and bumps a public count so the number means
 * something to whoever reads it next.
 *
 * Everything about it degrades quietly. No access key means no email but a
 * working counter; a blocked counter means no number but a working heart.
 */
export function LoveButton() {
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>("idle");
  const [count, setCount] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [burst, setBurst] = useState(0);
  const noteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasLoved()) setStage("loved");
    // Held to the same rule as incrementing: local dev and CI shouldn't be
    // calling out on every page load just to render a number.
    if (!countsForReal()) return;

    let alive = true;
    void readCount(COUNTER).then((value) => {
      if (alive && value !== null) setCount(value);
    });
    return () => {
      alive = false;
    };
  }, []);

  const love = () => {
    if (stage !== "idle") return;
    setStage("loved");
    setBurst((n) => n + 1);
    // Counted straight away: the number is the feedback, and waiting on a
    // request that blockers often kill would leave the tap feeling dead.
    setCount((value) => (value ?? 0) + 1);
    rememberLove();

    void sendLove();
    void bumpCount(COUNTER);
    // Let them say more, if they want to.
    window.setTimeout(() => noteRef.current?.focus(), 400);
  };

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    if (!note.trim()) return;
    void sendLove(note);
    setStage("thanked");
  };

  const filled = stage !== "idle";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={love}
          aria-pressed={filled}
          aria-label={filled ? "You loved this site" : "Love this site"}
          className="group relative grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.03] transition-colors duration-300 hover:border-rose-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
        >
          <motion.span
            key={burst}
            animate={
              reduceMotion || !burst ? undefined : { scale: [1, 1.45, 1] }
            }
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <Heart
              aria-hidden
              className={cn(
                "h-5 w-5 transition-colors duration-300",
                filled
                  ? "fill-rose-400 text-rose-400"
                  : "text-ink-400 group-hover:text-rose-300",
              )}
            />
          </motion.span>

          {/* Petals, thrown once per tap. */}
          {!reduceMotion && burst > 0 && (
            <span aria-hidden className="pointer-events-none absolute inset-0">
              {BURST.map((angle) => (
                <motion.span
                  key={`${burst}-${angle}`}
                  initial={{ opacity: 0.9, x: 0, y: 0, scale: 0.6 }}
                  animate={{
                    opacity: 0,
                    x: Math.sin((angle * Math.PI) / 180) * 34,
                    y: -Math.abs(Math.cos((angle * Math.PI) / 180)) * 34,
                    scale: 1,
                  }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-rose-400"
                />
              ))}
            </span>
          )}
        </button>

        <p className="text-left font-mono text-xs text-ink-400">
          <span className="block text-ink-300">
            {stage === "idle" ? "Loved the site?" : "Thank you — that lands."}
          </span>
          {count !== null && (
            <span className="tabular-nums text-ink-500">
              {count.toLocaleString()} {count === 1 ? "love" : "loves"}
            </span>
          )}
        </p>
      </div>

      {/* Only after the tap: a line, if they have one. */}
      <AnimatePresence>
        {stage === "loved" && (
          <motion.form
            onSubmit={send}
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            className="flex items-center gap-2"
          >
            <label htmlFor="love-note" className="sr-only">
              Leave a note (optional)
            </label>
            <input
              id="love-note"
              ref={noteRef}
              value={note}
              onChange={(event) =>
                setNote(event.target.value.slice(0, NOTE_LIMIT))
              }
              maxLength={NOTE_LIMIT}
              placeholder="say something? (optional)"
              className="w-56 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-xs text-ink-100 placeholder:text-ink-600 focus-visible:border-rose-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40 sm:w-64"
            />
            <button
              type="submit"
              disabled={!note.trim()}
              aria-label="Send note"
              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-ink-400 transition-colors duration-300 hover:border-rose-400/40 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" aria-hidden />
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <output className="sr-only">
        {stage === "thanked" ? "Note sent. Thank you." : ""}
      </output>
    </div>
  );
}
