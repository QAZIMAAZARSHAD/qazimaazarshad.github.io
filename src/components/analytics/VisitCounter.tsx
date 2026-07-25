import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Eye } from "lucide-react";
import { analytics } from "@/data/content";

const CODE = analytics.goatCounterCode;
const COUNT_UP_MS = 1200;

/** GoatCounter returns counts like "12,345"; keep only the digits. */
function parseCount(raw: unknown): number | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const digits = String(raw).replace(/\D/g, "");
  return digits ? Number.parseInt(digits, 10) : null;
}

/**
 * Footer visit counter backed by GoatCounter (no backend). Injects the
 * pageview tracker once, then fetches the public site total and animates it in.
 * Renders nothing until a code is configured or if the fetch fails — so it can
 * never show a broken widget.
 */
export function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [display, setDisplay] = useState(0);
  const reduceMotion = useReducedMotion();
  const injected = useRef(false);

  useEffect(() => {
    if (!CODE || injected.current) return;
    injected.current = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = "//gc.zgo.at/count.js";
    script.dataset.goatcounter = `https://${CODE}.goatcounter.com/count`;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!CODE) return;
    let alive = true;
    fetch(`https://${CODE}.goatcounter.com/counter/TOTAL.json`)
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

  // Hide until there is at least one real visit — a lonely "0 visits" (which is
  // all localhost testing ever shows, since GoatCounter ignores localhost) reads
  // as broken; the pill appears once the live count is ≥ 1.
  if (!CODE || !count) return null;

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
