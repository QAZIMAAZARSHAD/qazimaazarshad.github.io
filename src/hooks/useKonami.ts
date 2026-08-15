import { useEffect, useRef } from "react";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/** Calls `onUnlock` when ↑ ↑ ↓ ↓ ← → ← → B A is typed. */
export function useKonami(onUnlock: () => void): void {
  const at = useRef(0);
  const latest = useRef(onUnlock);
  latest.current = onUnlock;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Someone typing "back" into the search field is not entering the code.
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("input, textarea, [contenteditable]")
      ) {
        at.current = 0;
        return;
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === SEQUENCE[at.current]) {
        at.current += 1;
        if (at.current === SEQUENCE.length) {
          at.current = 0;
          latest.current();
        }
        return;
      }
      // A wrong key still restarts the run if it is itself a valid opening.
      at.current = key === SEQUENCE[0] ? 1 : 0;
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
