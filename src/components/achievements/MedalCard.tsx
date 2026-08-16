import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Eye, ExternalLink } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import { TiltCard } from "@/components/ui/TiltCard";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { CardVariant, Honour, Tier } from "@/lib/honours";

const METAL: Record<Tier, { rim: string; ink: string; halo: string }> = {
  gold: {
    rim: "bg-[conic-gradient(from_210deg,#78350f,#fbbf24,#fef3c7,#f59e0b,#78350f)]",
    ink: "text-amber-100",
    halo: "bg-amber-400/25",
  },
  silver: {
    rim: "bg-[conic-gradient(from_210deg,#334155,#cbd5e1,#f8fafc,#94a3b8,#334155)]",
    ink: "text-slate-100",
    halo: "bg-slate-300/20",
  },
  bronze: {
    rim: "bg-[conic-gradient(from_210deg,#7c2d12,#fb923c,#fed7aa,#c2410c,#7c2d12)]",
    ink: "text-orange-100",
    halo: "bg-orange-400/20",
  },
  accent: {
    rim: "bg-[conic-gradient(from_210deg,#312e81,#818cf8,#c7d2fe,#22d3ee,#312e81)]",
    ink: "text-accent-100",
    halo: "bg-accent-400/25",
  },
};

function Face({ honour, large }: Readonly<{ honour: Honour; large: boolean }>) {
  const metal = METAL[honour.tier];

  if (honour.markKind === "rank") {
    return (
      <span aria-hidden className="flex flex-col items-center leading-none">
        <span className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-white/50">
          AIR
        </span>
        <CountUp
          value={honour.value ?? 0}
          className={cn(
            "mt-0.5 font-mono font-bold",
            metal.ink,
            large ? "text-2xl" : "text-lg",
          )}
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "font-display font-bold leading-none",
        metal.ink,
        large ? "text-2xl" : "text-base",
      )}
    >
      {honour.mark}
    </span>
  );
}

function Medal({
  honour,
  large,
}: Readonly<{ honour: Honour; large: boolean }>) {
  const metal = METAL[honour.tier];
  const size = large ? "h-20 w-20" : "h-16 w-16";

  return (
    <span className={cn("relative shrink-0", large ? "pt-3" : "pt-2.5")}>
      <span
        aria-hidden
        className={cn(
          "absolute left-1/2 top-0 -translate-x-1/2",
          large ? "h-7 w-9" : "h-5 w-6",
        )}
      >
        <span className="absolute inset-y-0 left-0 w-1/2 -skew-x-[18deg] rounded-sm bg-gradient-to-b from-accent-500/70 to-accent-600/40" />
        <span className="absolute inset-y-0 right-0 w-1/2 skew-x-[18deg] rounded-sm bg-gradient-to-b from-cyan-400/60 to-cyan-500/30" />
      </span>

      <span
        aria-hidden
        className={cn(
          "absolute left-1/2 top-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl transition-opacity duration-500",
          metal.halo,
          "opacity-40 group-hover:opacity-90",
        )}
      />

      <span
        className={cn(
          "relative grid place-items-center rounded-full p-[2px] shadow-lg shadow-black/40 transition-transform duration-500 group-hover:scale-105",
          size,
          metal.rim,
        )}
      >
        <span className="grid h-full w-full place-items-center rounded-full bg-ink-950/85 px-1 text-center ring-1 ring-inset ring-white/15">
          <Face honour={honour} large={large} />
        </span>
      </span>
    </span>
  );
}

interface MedalCardProps {
  readonly honour: Honour;
  readonly variant?: CardVariant;
  readonly span?: string;
  readonly onOpen?: () => void;
  readonly href?: string;
}

export function MedalCard({
  honour,
  variant = "compact",
  span,
  onOpen,
  href,
}: MedalCardProps) {
  const featured = variant === "featured";
  const interactive = Boolean(href || onOpen);
  const HintIcon = href ? ExternalLink : Eye;

  const caption = honour.level && `${honour.level} level`;

  const body: ReactNode = (
    <div
      className={cn(
        "relative flex h-full items-center gap-4",
        featured ? "flex-col gap-5 p-6 text-center sm:p-7" : "p-4 sm:p-5",
      )}
    >
      <Medal honour={honour} large={featured} />

      <div className={cn("min-w-0", featured ? "w-full" : "flex-1")}>
        <p
          className={cn(
            "font-display font-semibold leading-snug text-white",
            featured ? "text-lg sm:text-xl" : "text-sm sm:text-[0.95rem]",
          )}
        >
          {honour.title}
        </p>
        {caption && (
          <p
            className={cn(
              "mt-1 text-ink-400",
              featured ? "text-sm" : "text-xs",
            )}
          >
            {caption}
          </p>
        )}
      </div>

      {interactive && (
        <HintIcon
          aria-hidden
          className={cn(
            "h-4 w-4 shrink-0 text-ink-400 transition-colors duration-300 group-hover:text-accent-300",
            featured && "absolute right-4 top-4",
          )}
        />
      )}
    </div>
  );

  const plate = (
    <div
      className={cn(
        "glass group relative h-full overflow-hidden rounded-2xl transition-colors duration-300",
        "hover:border-accent-400/40",
        interactive && "focus-within:ring-2 focus-within:ring-accent-400/60",
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(115deg,transparent_25%,rgba(255,255,255,0.14)_45%,rgba(129,140,248,0.18)_55%,transparent_75%)] transition-transform duration-[900ms] ease-out group-hover:translate-x-full motion-reduce:hidden"
      />
      {body}
    </div>
  );

  let inner: ReactNode;
  if (href) {
    inner = (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={`${honour.raw} (opens in a new tab)`}
        className="block h-full rounded-2xl outline-none"
      >
        {plate}
      </a>
    );
  } else if (onOpen) {
    inner = (
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View certificate: ${honour.raw}`}
        className="block h-full w-full rounded-2xl text-left outline-none"
      >
        {plate}
      </button>
    );
  } else {
    inner = plate;
  }

  return (
    <motion.li variants={fadeUp} className={span}>
      <TiltCard className="h-full" max={featured ? 7 : 5}>
        {inner}
      </TiltCard>
    </motion.li>
  );
}
