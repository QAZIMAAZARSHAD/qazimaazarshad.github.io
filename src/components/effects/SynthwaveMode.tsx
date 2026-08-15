import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Power, Volume2, VolumeX } from "lucide-react";
import { useKonami } from "@/hooks/useKonami";
import { startChiptune, stopChiptune } from "@/lib/chiptune";
import { SYNTHWAVE_EVENT } from "@/lib/synthwave";

export function SynthwaveMode() {
  const reduce = useReducedMotion();
  const [on, setOn] = useState(false);
  const [muted, setMuted] = useState(false);

  const toggle = useCallback(() => setOn((live) => !live), []);
  useKonami(toggle);

  useEffect(() => {
    window.addEventListener(SYNTHWAVE_EVENT, toggle);
    return () => window.removeEventListener(SYNTHWAVE_EVENT, toggle);
  }, [toggle]);

  useEffect(() => {
    const root = document.documentElement;
    if (on) root.dataset.synthwave = "";
    else delete root.dataset.synthwave;
    return () => {
      delete root.dataset.synthwave;
    };
  }, [on]);

  useEffect(() => {
    if (on && !muted) startChiptune();
    else stopChiptune();
    return stopChiptune;
  }, [on, muted]);

  useEffect(() => {
    if (!on) return;
    const onKey = (event: KeyboardEvent) => {
      // The palette and the lightboxes also close on Escape; let whichever is
      // open take the key rather than tearing down the whole mode underneath it.
      if (event.key !== "Escape") return;
      if (document.querySelector('[aria-modal="true"]')) return;
      setOn(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on]);

  return (
    <>
      {/* Scenery goes behind the page, screen effects go in front. Painting the
          sun over the top would bury whichever call to action it landed on. */}
      <AnimatePresence>
        {on && (
          <motion.div
            key="synthwave-scenery"
            aria-hidden
            data-testid="synthwave-scenery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.5 }}
            className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden"
          >
            <div className="qma-sun absolute left-1/2 top-[80%] h-36 w-36 -translate-x-1/2 -translate-y-[86%] rounded-full opacity-70" />
            <div className="absolute inset-x-0 top-[80%] h-px bg-fuchsia-300/60 shadow-[0_0_18px_4px_rgba(255,62,205,0.45)]" />
            <div className="absolute inset-x-0 bottom-0 top-[80%] overflow-hidden">
              <div className="qma-grid absolute inset-x-[-60%] inset-y-0" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {on && (
          <motion.div
            key="synthwave-screen"
            aria-hidden
            data-testid="synthwave-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.5 }}
            className="pointer-events-none fixed inset-0 z-[120] overflow-hidden"
          >
            <div className="qma-neon-wash absolute inset-0" />
            <div className="qma-crt absolute inset-0" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(2,6,23,0.75)_100%)]" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {on && (
          <motion.div
            key="synthwave-hud"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: reduce ? 0 : 0.3 }}
            className="fixed inset-x-0 bottom-6 z-[130] flex justify-center px-4"
          >
            <div className="flex items-center gap-1 rounded-full border border-fuchsia-400/40 bg-ink-950/80 px-2 py-1.5 shadow-[0_0_30px_rgba(255,62,205,0.35)] backdrop-blur-xl">
              <span className="px-3 font-mono text-[10px] uppercase tracking-[0.3em] text-fuchsia-300">
                Synthwave
              </span>

              <button
                type="button"
                onClick={() => setMuted((quiet) => !quiet)}
                aria-pressed={muted}
                className="grid h-8 w-8 place-items-center rounded-full text-ink-300 transition-colors hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
              >
                {muted ? (
                  <VolumeX className="h-4 w-4" aria-hidden />
                ) : (
                  <Volume2 className="h-4 w-4" aria-hidden />
                )}
                <span className="sr-only">
                  {muted ? "Unmute the soundtrack" : "Mute the soundtrack"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOn(false)}
                className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-fuchsia-200 transition-colors hover:bg-fuchsia-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70"
              >
                <Power className="h-3 w-3" aria-hidden />
                Exit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <output className="sr-only">
        {on ? "Synthwave mode on. Press Escape to go back to normal." : ""}
      </output>
    </>
  );
}
