import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Eye } from "lucide-react";
import { analytics } from "@/data/content";

const PATH = analytics.visitCounter;
const COUNT_UP_MS = 1200;

/** CounterAPI returns { count: number }; keep only the digits defensively. */
function parseCount(raw: unknown): number | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const digits = String(raw).replace(/\D/g, "");
  return digits ? Number.parseInt(digits, 10) : null;
}

/** Skip counting on local dev so it never inflates the real total (tests opt in). */
function shouldCount(): boolean {
  if (!PATH) return false;
  const w = window as unknown as { __VISIT_COUNTER_TEST__?: boolean };
  if (w.__VISIT_COUNTER_TEST__) return true;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1" && host !== "::1";
}

/**
 * Footer visit counter backed by CounterAPI.dev — no account, no backend, and
 * not on ad-blocker lists (unlike analytics domains). Each real load bumps the
 * total and animates the number in. Renders nothing until it resolves or if the
 * request fails, so it can never show a broken widget.
 */
export function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [display, setDisplay] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!shouldCount()) return;
    let alive = true;
    fetch(`https://api.counterapi.dev/v1/${PATH}/up`)
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)),
      )
      .then((data) => {
        const n = parseCount(data?.count);
        if (alive && n != null) setCount(n);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (count == null) return;
    if (reduceMotion) {
      setDisplay(count);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / COUNT_UP_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(count * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count, reduceMotion]);

  if (!count) return null;

  return (
    <motion.p
      data-testid="visit-counter"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      aria-label={`${count.toLocaleString()} total visits`}
      title={`${count.toLocaleString()} total visits`}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-xs text-ink-400"
    >
      <Eye className="h-3.5 w-3.5 text-accent-300" aria-hidden />
      <span className="tabular-nums text-ink-300">
        {display.toLocaleString()}
      </span>{" "}
      visits
    </motion.p>
  );
}
