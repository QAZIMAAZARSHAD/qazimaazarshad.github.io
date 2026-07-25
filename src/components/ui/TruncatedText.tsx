import {
  createElement,
  useCallback,
  useRef,
  useState,
  type ElementType,
} from "react";
import { createPortal } from "react-dom";

interface TruncatedTextProps {
  /** Full text — rendered inline and surfaced in the tooltip when clipped. */
  text: string;
  /** Element to render (keeps `truncate` / `line-clamp-*` classes intact). */
  as?: ElementType;
  className?: string;
}

interface TipPos {
  x: number;
  y: number;
}

/**
 * Renders text with whatever truncation classes are passed, and shows a styled
 * tooltip with the full text on hover — but ONLY when the text is actually
 * clipped (single-line ellipsis or line-clamp). The tooltip is portaled to
 * <body> so it's never clipped by a card's `overflow-hidden`. Keeps the native
 * `title` attribute as a keyboard/AT-friendly fallback.
 */
export function TruncatedText({
  text,
  as = "p",
  className,
}: Readonly<TruncatedTextProps>) {
  const ref = useRef<HTMLElement>(null);
  const [tip, setTip] = useState<TipPos | null>(null);

  const show = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const clipped =
      el.scrollHeight > el.clientHeight + 1 ||
      el.scrollWidth > el.clientWidth + 1;
    if (!clipped) return;
    const rect = el.getBoundingClientRect();
    setTip({ x: rect.left + rect.width / 2, y: rect.top });
  }, []);

  const hide = useCallback(() => setTip(null), []);

  return (
    <>
      {createElement(
        as,
        {
          ref,
          className,
          title: text,
          onMouseEnter: show,
          onMouseLeave: hide,
        },
        text,
      )}
      {tip &&
        createPortal(
          <div
            role="tooltip"
            style={{ left: tip.x, top: tip.y }}
            className="pointer-events-none fixed z-[120] max-w-xs -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-lg border border-white/10 bg-ink-900/95 px-3 py-2 text-xs leading-relaxed text-ink-100 shadow-xl backdrop-blur"
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}
