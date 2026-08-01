import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Download, ExternalLink, FileWarning, X } from "lucide-react";
import type { CertificateItem } from "@/data/content";
import { asset, cn } from "@/lib/utils";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/** One viewable image, optionally with its own downloadable original. */
export interface LightboxSlide {
  image: string;
  file?: string;
}

interface CertificateLightboxProps {
  readonly certificate: CertificateItem;
  /** Optional multi-image gallery; defaults to the certificate's own preview. */
  readonly slides?: LightboxSlide[];
  readonly onClose: () => void;
}

/**
 * Accessible, centered viewer for a single certificate. Portals outside the
 * (inert) app root; handles Escape/backdrop close, scroll lock, a Tab focus
 * trap, and focus restoration. Shows the preview image plus links to the
 * original file when one is hosted.
 */
export function CertificateLightbox({
  certificate,
  slides,
  onClose,
}: CertificateLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { title, issuer } = certificate;

  const gallery: LightboxSlide[] =
    slides && slides.length > 0
      ? slides
      : [{ image: certificate.preview ?? "", file: certificate.file }];
  const [active, setActive] = useState(0);
  const current = gallery[Math.min(active, gallery.length - 1)];
  const preview = current.image;
  const file = current.file;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const root = document.getElementById("root");
    root?.setAttribute("inert", "");
    root?.setAttribute("aria-hidden", "true");
    return () => {
      root?.removeAttribute("inert");
      root?.removeAttribute("aria-hidden");
    };
  }, []);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => {
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const focused = document.activeElement;

      if (event.shiftKey) {
        if (focused === first || !dialog.contains(focused)) {
          event.preventDefault();
          last.focus();
        }
      } else if (focused === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="glass relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl shadow-2xl shadow-accent-500/10"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close viewer"
          className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-ink-950/70 text-ink-300 backdrop-blur transition-all duration-300 hover:border-accent-400/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-center justify-center overflow-auto bg-ink-950/40 p-4 sm:p-6">
          {preview ? (
            <img
              src={asset(preview)}
              alt={title}
              className="max-h-[68vh] w-auto rounded-lg shadow-lg"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-ink-400">
              <FileWarning className="h-10 w-10" aria-hidden />
              <p className="text-sm">Preview unavailable</p>
            </div>
          )}
        </div>

        {gallery.length > 1 && (
          <div className="flex justify-center gap-2 border-t border-white/10 bg-ink-950/40 px-4 py-3">
            {gallery.map((slide, i) => (
              <button
                key={`${i}-${slide.image}`}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1} of ${gallery.length}`}
                aria-pressed={i === active}
                className={cn(
                  "h-14 w-14 shrink-0 overflow-hidden rounded-lg border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70",
                  i === active
                    ? "border-accent-400 ring-2 ring-accent-400/40"
                    : "border-white/10 opacity-60 hover:opacity-100",
                )}
              >
                <img
                  src={asset(slide.image)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <h3
              id={titleId}
              className="font-display text-lg font-semibold leading-tight text-white"
            >
              {title}
            </h3>
            {issuer && (
              <p className="mt-0.5 text-sm text-accent-200/90">{issuer}</p>
            )}
          </div>

          {file && (
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={asset(file)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs text-ink-200 transition-colors hover:border-accent-400/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                Open
              </a>
              <a
                href={asset(file)}
                download
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-accent-500 to-cyan-500 px-3 py-2 font-mono text-xs font-medium text-white shadow-lg shadow-accent-500/25 transition-all hover:shadow-accent-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                Download
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
