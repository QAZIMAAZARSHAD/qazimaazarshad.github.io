import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyEmailButtonProps {
  email: string;
  className?: string;
}

/**
 * Secondary glass button that copies an email to the clipboard and flashes a
 * transient "Copied!" state for ~2s. Gracefully no-ops if the Clipboard API
 * is unavailable, while still acknowledging the interaction.
 */
export function CopyEmailButton({ email, className }: Readonly<CopyEmailButtonProps>) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      /* Clipboard unavailable (e.g. insecure context) — flash state anyway. */
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }, [email]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Email address copied" : `Copy email address ${email}`}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 font-medium text-ink-200 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-400/40 hover:bg-white/[0.06] hover:text-white hover:shadow-lg hover:shadow-accent-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
        className,
      )}
    >
      {copied ? (
        <Check className="h-4 w-4 text-cyan-400" aria-hidden />
      ) : (
        <Copy
          className="h-4 w-4 transition-transform duration-300 group-hover:scale-110"
          aria-hidden
        />
      )}
      <span>{copied ? "Copied!" : "Copy email"}</span>
    </button>
  );
}
