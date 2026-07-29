import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  HobbyImpact,
  type HobbyEffect,
} from "@/components/effects/HobbyImpact";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { hobbies } from "@/data/content";
import { asset } from "@/lib/utils";
import { playStrum } from "@/lib/sound";

/**
 * Per-hobby content: the chip emoji (or custom icon image) + hover quip, and the
 * cinematic reaction (projectile flown at the viewer, comic impact word, glow
 * color, screen shake) that fires on click.
 */
export const HOBBY_META: Record<
  string,
  { emoji: string; icon?: string; quip: string; effect: HobbyEffect }
> = {
  Movies: {
    emoji: "🎬",
    quip: "Beta, tumse na ho payega.",
    effect: {
      projectile: "👑",
      image: "images/hobbies/bahubali.png",
      word: "Jai Mahishmati",
      color: "#f97316",
    },
  },
  "Web Series": {
    emoji: "📺",
    quip: "Valar Morghulis",
    effect: {
      projectile: "🕶️",
      image: "images/hobbies/walter-white.png",
      word: "I am the one who knocks!",
      color: "#facc15",
    },
  },
  Anime: {
    emoji: "🍥",
    quip: "Shinzō wo Sasageyo!",
    effect: {
      projectile: "⚔️",
      image: "images/hobbies/anime.png",
      word: "Tatakae!",
      color: "#ff4d6d",
      shake: true,
    },
  },
  Music: {
    emoji: "🎧",
    quip: "Every commit has a soundtrack.",
    effect: {
      projectile: "🎵",
      image: "images/hobbies/music.png",
      word: "Mile sur mera tumhara, toh sur bane hamara",
      color: "#22d3ee",
      sound: true,
    },
  },
  "Pro Wrestling (WWE)": {
    emoji: "🤼",
    quip: "Hustle, Loyalty, Respect",
    effect: {
      projectile: "🤼",
      image: "images/hobbies/wwe.png",
      word: "Suplex City!!!",
      color: "#f59e0b",
      shake: true,
    },
  },
  Cricket: {
    emoji: "🏏",
    quip: "Cover drives & run chases.",
    effect: {
      projectile: "🏏",
      image: "images/hobbies/sachin.png",
      word: "Sachin! Sachin!",
      color: "#3b82f6",
      shake: true,
    },
  },
  Badminton: {
    emoji: "🏸",
    quip: "Smash first, ask later.",
    effect: {
      projectile: "🏸",
      image: "images/hobbies/badminton.png",
      word: "Smash!",
      color: "#22c55e",
      shake: true,
    },
  },
  Cards: {
    emoji: "🃏",
    quip: "Cards are war, in disguise of a sport.",
    effect: {
      projectile: "🃏",
      image: "images/hobbies/cards.png",
      word: "Teen Patti!",
      color: "#f472b6",
    },
  },
  "Video Games": {
    emoji: "🎮",
    quip: "One more run, promise.",
    effect: {
      projectile: "🍄",
      word: "Our Princess Is in Another Castle",
      color: "#a78bfa",
    },
  },
  Quizzing: {
    emoji: "🧠",
    quip: "Trivia? Bring it on.",
    effect: { projectile: "💡", word: "Correct!", color: "#fbbf24" },
  },
  Gym: {
    emoji: "🏋️",
    quip: "No days off.",
    effect: {
      projectile: "🏋️",
      image: "images/hobbies/gym.png",
      word: "Chest Day",
      color: "#fb7185",
      shake: true,
    },
  },
  Food: {
    emoji: "🥟",
    icon: "images/hobbies/samosa.png",
    quip: "Will code for food.",
    effect: {
      projectile: "🍛",
      image: "images/hobbies/biryani.png",
      word: "Biryani",
      color: "#fb923c",
    },
  },
  Swimming: {
    emoji: "🏊",
    quip: "Making waves.",
    effect: {
      projectile: "🌊",
      image: "images/hobbies/swimming.png",
      word: "Water Breathing First Form",
      color: "#38bdf8",
      shake: true,
    },
  },
};
const DEFAULT_HOBBY = {
  emoji: "✨",
  quip: "Good vibes only.",
  effect: { projectile: "✨", word: "Nice!", color: "#22d3ee" } as HobbyEffect,
};

interface ActiveImpact {
  key: number;
  effect: HobbyEffect;
  origin: { x: number; y: number };
}

let impactSeq = 0;

interface ActiveTip {
  text: string;
  cx: number;
  top: number;
}

export function Hobbies() {
  const [impact, setImpact] = useState<ActiveImpact | null>(null);
  const [tip, setTip] = useState<ActiveTip | null>(null);
  const [tipShift, setTipShift] = useState(0);
  const tipRef = useRef<HTMLDivElement>(null);

  const fire = (
    event: React.MouseEvent<HTMLButtonElement>,
    effect: HobbyEffect,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setImpact({
      key: impactSeq++,
      effect,
      origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    });
  };

  const showTip = (
    event: React.SyntheticEvent<HTMLButtonElement>,
    text: string,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTipShift(0);
    setTip({ text, cx: rect.left + rect.width / 2, top: rect.top });
  };
  const hideTip = () => setTip(null);

  // Nudge the (portaled) tooltip horizontally so chips near a screen edge
  // don't get their tooltip clipped by the viewport.
  useLayoutEffect(() => {
    if (!tip || !tipRef.current) return;
    const pad = 8;
    const r = tipRef.current.getBoundingClientRect();
    let shift = 0;
    if (r.left < pad) shift = pad - r.left;
    else if (r.right > window.innerWidth - pad)
      shift = window.innerWidth - pad - r.right;
    if (shift !== 0) setTipShift(shift);
  }, [tip]);

  return (
    <Section id="hobbies">
      <SectionHeading kicker="Off the clock" title="Beyond the code" />

      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="flex flex-wrap gap-3"
      >
        {hobbies.map((hobby) => {
          const meta = HOBBY_META[hobby] ?? DEFAULT_HOBBY;
          return (
            <motion.li
              key={hobby}
              variants={fadeUp}
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="group"
            >
              <button
                type="button"
                onClick={(event) => {
                  hideTip();
                  if (meta.effect.sound) playStrum();
                  fire(event, meta.effect);
                }}
                onMouseEnter={(event) => showTip(event, meta.quip)}
                onMouseLeave={hideTip}
                onBlur={hideTip}
                aria-label={`${hobby} — ${meta.quip}`}
                className="glass inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm text-ink-200 outline-none transition-colors duration-300 hover:border-accent-400/50 hover:text-white hover:shadow-lg hover:shadow-accent-500/20 focus-visible:border-accent-400/60 focus-visible:text-white"
              >
                {meta.icon ? (
                  <img
                    src={asset(meta.icon)}
                    alt=""
                    aria-hidden
                    className="h-5 w-5 shrink-0 object-contain transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-125 group-focus-within:-rotate-12 group-focus-within:scale-125 group-active:scale-150"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="text-lg leading-none transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-125 group-focus-within:-rotate-12 group-focus-within:scale-125 group-active:scale-150"
                  >
                    {meta.emoji}
                  </span>
                )}
                <span className="font-medium">{hobby}</span>
              </button>
            </motion.li>
          );
        })}
      </motion.ul>

      {tip &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            style={{
              left: tip.cx,
              top: tip.top,
              transform: `translate(calc(-50% + ${tipShift}px), calc(-100% - 8px))`,
            }}
            className="pointer-events-none fixed z-[110] w-max max-w-[90vw] rounded-lg border border-white/10 bg-ink-900/95 px-3 py-1.5 text-center font-mono text-[11px] leading-snug text-cyan-200 shadow-xl backdrop-blur"
          >
            {tip.text}
          </div>,
          document.body,
        )}

      <AnimatePresence>
        {impact && (
          <HobbyImpact
            key={impact.key}
            effect={impact.effect}
            origin={impact.origin}
            onDone={() => setImpact(null)}
          />
        )}
      </AnimatePresence>
    </Section>
  );
}
