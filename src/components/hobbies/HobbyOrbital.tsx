import { motion, type Variants } from "framer-motion";
import type { HobbyEffect } from "@/components/effects/HobbyImpact";
import { EASE_GLIDE } from "@/lib/motion";
import { asset } from "@/lib/utils";

export interface HobbyMeta {
  readonly emoji: string;
  readonly icon?: string;
  readonly quip: string;
  readonly blurb: string;
  readonly effect: HobbyEffect;
}

const orbitalIn: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_GLIDE },
  },
};

interface HobbyOrbitalProps {
  readonly hobby: string;
  readonly meta: HobbyMeta;
  readonly onPick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function HobbyOrbital({ hobby, meta, onPick }: HobbyOrbitalProps) {
  const c = meta.effect.color;

  return (
    <motion.li variants={orbitalIn} className="w-32 sm:w-40">
      <button
        type="button"
        onClick={onPick}
        aria-label={`${hobby}: ${meta.blurb}`}
        style={{ ["--hc" as string]: c }}
        className="group flex w-full cursor-pointer flex-col items-center text-center outline-none"
      >
        <span className="relative flex h-24 w-full items-end justify-center sm:h-28">
          <span
            role="tooltip"
            className="pointer-events-none absolute -top-1 left-1/2 z-20 w-max max-w-[13rem] -translate-x-1/2 translate-y-1 scale-95 rounded-lg border border-white/10 bg-ink-950/90 px-3 py-1.5 text-xs font-medium text-ink-100 opacity-0 shadow-lg shadow-black/40 backdrop-blur-md transition-all duration-200 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100"
            style={{ boxShadow: `0 0 24px ${c}33` }}
          >
            &ldquo;{meta.quip}&rdquo;
            <span
              aria-hidden
              className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-white/10 bg-ink-950/90"
            />
          </span>

          <span
            aria-hidden
            className="absolute bottom-2 h-8 w-24 rounded-[50%] blur-md transition-all duration-300 group-hover:h-9 group-hover:w-28 group-focus-visible:h-9 group-focus-visible:w-28"
            style={{
              background: `radial-gradient(50% 60% at 50% 50%, ${c}80, transparent 70%)`,
            }}
          />
          <span
            aria-hidden
            className="absolute bottom-3 h-4 w-20 rounded-[50%] border transition-all duration-300 group-hover:w-24"
            style={{
              borderColor: `${c}aa`,
              boxShadow: `0 0 18px ${c}66, inset 0 0 10px ${c}44`,
            }}
          />
          <span
            aria-hidden
            className="absolute bottom-1.5 h-5 w-28 rounded-[50%] border opacity-40 transition-all duration-300 group-hover:opacity-70"
            style={{ borderColor: `${c}55` }}
          />

          <span
            aria-hidden
            className="relative z-10 mb-3 text-[2.75rem] leading-none drop-shadow-[0_10px_16px_rgba(0,0,0,0.55)] transition-transform duration-500 will-change-transform group-hover:-translate-y-1.5 group-hover:scale-110 group-focus-visible:-translate-y-1.5 group-focus-visible:scale-110 motion-safe:animate-float sm:text-5xl"
          >
            {meta.icon ? (
              <img
                src={asset(meta.icon)}
                alt=""
                className="h-11 w-11 object-contain sm:h-12 sm:w-12"
              />
            ) : (
              meta.emoji
            )}
          </span>
        </span>

        <span
          className="mt-2 font-display text-sm font-semibold leading-tight sm:text-base"
          style={{ color: c }}
        >
          {hobby}
        </span>
        <span className="mt-1 max-w-[9rem] text-balance text-xs leading-snug text-ink-400 transition-colors duration-300 group-hover:text-ink-300 sm:text-sm">
          {meta.blurb}
        </span>
      </button>
    </motion.li>
  );
}
