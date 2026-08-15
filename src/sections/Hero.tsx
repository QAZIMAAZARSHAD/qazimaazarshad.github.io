import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Download, Mail } from "lucide-react";
import { profile, heroTaglines } from "@/data/content";
import { maskUp, riseIn } from "@/lib/motion";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { AvatarRing } from "@/components/hero/AvatarRing";
import { ScrollCue } from "@/components/hero/ScrollCue";
import { ScrambleText } from "@/components/hero/ScrambleText";
import { GradientWord } from "@/components/hero/GradientWord";
import { Magnetic } from "@/components/ui/Magnetic";
import { GoogleMe } from "@/components/google/GoogleMe";
import { useHasEntered } from "@/components/effects/IntroProvider";
import { celebrate } from "@/lib/confetti";
import { asset, cn } from "@/lib/utils";

const nameWords = profile.name.split(" ");

const AT = {
  status: 0.1,
  name: 0.2,
  nameStep: 0.09,
  role: 0.52,
  tagline: 0.6,
  actions: 0.7,
  socials: 0.8,
} as const;

// pb keeps descenders (Q in "Qazi") inside the overflow-hidden mask.
function Mask({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <span
      className={cn(
        "block overflow-hidden pb-[0.18em] -mb-[0.18em]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Hero() {
  const reduce = useReducedMotion() ?? false;
  const entered = useHasEntered();
  const rise = maskUp(reduce);
  const lift = riseIn(reduce);
  const state = entered ? "show" : "hidden";

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden pb-40 pt-28 sm:pt-32 lg:pb-24"
    >
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div className="flex flex-col items-start gap-6 text-left">
          <Mask>
            <motion.span
              variants={rise}
              initial="hidden"
              animate={state}
              custom={AT.status}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs text-ink-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Available · Building at {profile.company}
            </motion.span>
          </Mask>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[3.75rem] xl:text-7xl">
            <span className="sr-only">{profile.name}</span>
            <span
              aria-hidden
              className="flex flex-wrap gap-x-4 lg:flex-nowrap lg:whitespace-nowrap"
            >
              {nameWords.map((word, i) => (
                <Mask key={word}>
                  <motion.span
                    variants={rise}
                    initial="hidden"
                    animate={state}
                    custom={AT.name + i * AT.nameStep}
                    className="block"
                  >
                    {i === 1 ? (
                      <GradientWord play={entered}>{word}</GradientWord>
                    ) : (
                      word
                    )}
                  </motion.span>
                </Mask>
              ))}
            </span>
          </h1>

          <Mask>
            <motion.p
              variants={rise}
              initial="hidden"
              animate={state}
              custom={AT.role}
              className="text-lg text-ink-300 sm:text-xl"
            >
              <span className="font-semibold text-white">{profile.role}</span>
              <span className="mx-2 text-ink-600">·</span>
              <span className="text-accent-300">{profile.company}</span>
            </motion.p>
          </Mask>

          <motion.p
            variants={lift}
            initial="hidden"
            animate={state}
            custom={AT.tagline}
            className="min-h-[1.9em] max-w-xl break-words text-base leading-relaxed text-ink-400 sm:text-lg"
          >
            <ScrambleText phrases={heroTaglines} />
          </motion.p>

          <motion.div
            variants={lift}
            initial="hidden"
            animate={state}
            custom={AT.actions}
            className="flex flex-wrap items-center gap-3"
          >
            <Magnetic className="inline-flex">
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-accent-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
              >
                View Projects
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </a>
            </Magnetic>
            <Magnetic className="inline-flex">
              <a
                href="#contact"
                className="glass glass-hover inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
              >
                <Mail className="h-4 w-4" aria-hidden />
                Get in touch
              </a>
            </Magnetic>
            <a
              href={asset(profile.resume)}
              target="_blank"
              rel="noreferrer"
              download
              onClick={() => celebrate().catch(() => {})}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-ink-400 transition-colors duration-300 hover:text-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
            >
              <Download className="h-4 w-4" aria-hidden />
              Download Resume
            </a>
          </motion.div>

          <motion.div
            variants={lift}
            initial="hidden"
            animate={state}
            custom={AT.socials}
            className="flex flex-wrap items-center gap-3"
          >
            <SocialLinks only={["github", "linkedin", "instagram", "email"]} />
            <GoogleMe />
          </motion.div>
        </div>

        <div className="order-first flex justify-center lg:order-none lg:justify-end">
          <AvatarRing />
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}
