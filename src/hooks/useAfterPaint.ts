import { useEffect, useState } from "react";

/**
 * False until the browser has painted once, true from the next frame on.
 *
 * The whole site — every section, every card — renders in a single commit. That
 * is a second or more of scripting and layout on a phone, and the browser paints
 * nothing until it finishes, so the intro that is supposed to cover the wait
 * only appeared once the wait was over, its clock already run out. Holding the
 * body back by a frame lets the intro paint by itself, which is cheap, and the
 * rest arrive behind it.
 */
export function useAfterPaint(): boolean {
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    // Two frames: the first is scheduled before this commit reaches the screen.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setPainted(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  return painted;
}
