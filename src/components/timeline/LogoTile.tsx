import { asset, cn } from "@/lib/utils";

interface LogoTileProps {
  src: string;
  alt: string;
  className?: string;
}

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
