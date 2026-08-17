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
 * Text with a hover tooltip carrying the full string, shown only when the text
 * is actually clipped. Portaled to <body> to escape `overflow-hidden`, with the
 * native `title` kept as a keyboard/AT fallback.
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
