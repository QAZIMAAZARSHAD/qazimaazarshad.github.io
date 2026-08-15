import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  HobbyImpact,
  type HobbyEffect,
} from "@/components/effects/HobbyImpact";
import {
  HobbyOrbital,
  type HobbyMeta,
} from "@/components/hobbies/HobbyOrbital";
import { staggerContainer, viewportOnce } from "@/lib/motion";
import { hobbies } from "@/data/content";
import { playStrum } from "@/lib/sound";

export const HOBBY_META: Record<string, HobbyMeta> = {
  Movies: {
    emoji: "🎬",
    quip: "Beta, tumse na ho payega.",
    blurb: "Exploring stories & worlds on screen.",
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
    blurb: "Bingeing great plot and character arcs.",
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
    blurb: "Unique stories, beautifully told.",
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
    blurb: "From lo-fi beats to loud anthems.",
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
    blurb: "The drama inside the ring.",
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
    blurb: "Strategy, passion and last-over thrills.",
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
    blurb: "Quick rallies, sharp focus.",
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
    blurb: "From casual games to strategic wins.",
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
    blurb: "Play, explore and unwind.",
    effect: {
      projectile: "🍄",
      word: "Our Princess Is in Another Castle",
      color: "#a78bfa",
    },
  },
  Quizzing: {
    emoji: "🧠",
    quip: "Trivia? Bring it on.",
    blurb: "Trivia, facts & endless learning.",
    effect: { projectile: "💡", word: "Correct!", color: "#fbbf24" },
  },
  Gym: {
    emoji: "🏋️",
    quip: "No days off.",
    blurb: "Stronger body, clearer mind.",
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
    blurb: "Good food, better mood.",
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
    blurb: "Reset, refresh, repeat.",
    effect: {
      projectile: "🌊",
      image: "images/hobbies/swimming.png",
      word: "Water Breathing First Form",
      color: "#38bdf8",
      shake: true,
    },
  },
};

const DEFAULT_META: HobbyMeta = {
  emoji: "✨",
  quip: "Good vibes only.",
  blurb: "Good vibes only.",
  effect: { projectile: "✨", word: "Nice!", color: "#22d3ee" } as HobbyEffect,
};

interface ActiveImpact {
  key: number;
  effect: HobbyEffect;
  origin: { x: number; y: number };
}

let impactSeq = 0;

export function Hobbies() {
  const [impact, setImpact] = useState<ActiveImpact | null>(null);

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

  return (
    <Section id="hobbies">
      <SectionHeading
        kicker="Off the clock"
        title="Beyond the code"
        description="When I'm not coding, I dive into the things that keep me curious, active, and inspired."
      />

      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-4 gap-y-10 sm:gap-x-6"
      >
        {hobbies.map((hobby) => {
          const meta = HOBBY_META[hobby] ?? DEFAULT_META;
          return (
            <HobbyOrbital
              key={hobby}
              hobby={hobby}
              meta={meta}
              onPick={(event) => {
                if (meta.effect.sound) playStrum();
                fire(event, meta.effect);
              }}
            />
          );
        })}
      </motion.ul>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto mt-14 flex max-w-3xl items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl"
      >
        <Quote
          className="h-6 w-6 shrink-0 text-accent-400"
          aria-hidden
          fill="currentColor"
        />
        <p className="font-medium text-ink-200">
          Hobbies don&rsquo;t just fill time, they fuel creativity.
        </p>
        <Waveform />
      </motion.div>

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

function Waveform() {
  const bars = [8, 16, 10, 22, 14, 28, 18, 24, 12, 20, 9, 15];
  return (
    <span
      aria-hidden
      className="ml-auto hidden items-center gap-[3px] sm:flex"
      title="soundtrack"
    >
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-accent-500 to-cyan-400 motion-safe:animate-pulse"
          style={{ height: h, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </span>
  );
}
