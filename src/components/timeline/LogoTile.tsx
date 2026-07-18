import { asset, cn } from "@/lib/utils";

interface LogoTileProps {
  /** Raw content path, e.g. "images/experience/infa.png". Wrapped with asset(). */
  src: string;
  alt: string;
  /** Sizing utilities, e.g. "h-14 w-14". */
  className?: string;
}

/**
 * A rounded, light "chip" that holds an organisation / institution logo so
 * dark-on-transparent marks stay legible against the ink background.
 */
export function LogoTile({ src, alt, className }: Readonly<LogoTileProps>) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/95 ring-1 ring-white/20 shadow-lg shadow-black/30",
        className,
      )}
    >
      <img
        src={asset(src)}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain p-2"
      />
    </div>
  );
}
