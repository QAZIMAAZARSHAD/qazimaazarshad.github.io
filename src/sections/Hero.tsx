import { motion } from "framer-motion";
import { ArrowRight, Download, Mail } from "lucide-react";
import { profile } from "@/data/content";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { AvatarRing } from "@/components/hero/AvatarRing";
import { ScrollCue } from "@/components/hero/ScrollCue";
import { asset } from "@/lib/utils";

const nameWords = profile.name.split(" ");

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden pb-40 pt-28 sm:pt-32 lg:pb-24"
    >
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        {/* Left — copy */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start gap-6 text-left"
        >
          {/* Status pill */}
          <motion.span
            variants={fadeUp}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs text-ink-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Available · Building at {profile.company}
          </motion.span>

          {/* Headline — name, staggered word reveal */}
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[3.75rem] xl:text-7xl">
            <span className="sr-only">{profile.name}</span>
            <span
              aria-hidden
              className="flex flex-wrap gap-x-4 lg:flex-nowrap lg:whitespace-nowrap"
            >
              {nameWords.map((word, i) => (
                <motion.span
                  key={word}
                  variants={fadeUp}
                  className={i === 1 ? "text-gradient" : undefined}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Role line */}
          <motion.p
            variants={fadeUp}
            className="text-lg text-ink-300 sm:text-xl"
          >
            <span className="font-semibold text-white">{profile.role}</span>
            <span className="mx-2 text-ink-600">·</span>
            <span className="text-accent-300">{profile.company}</span>
          </motion.p>

          {/* Tagline */}
          <motion.p
            variants={fadeUp}
            className="max-w-xl text-base leading-relaxed text-ink-400 sm:text-lg"
          >
            {profile.tagline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-3"
          >
            <a
              href="#projects"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-accent-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
            >
              View Projects
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </a>
            <a
              href="#contact"
              className="glass glass-hover inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
            >
              <Mail className="h-4 w-4" aria-hidden />
              Get in touch
            </a>
            <a
              href={asset(profile.resume)}
              target="_blank"
              rel="noreferrer"
              download
              className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-ink-400 transition-colors duration-300 hover:text-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
            >
              <Download className="h-4 w-4" aria-hidden />
              Download Resume
            </a>
          </motion.div>

          {/* Socials */}
          <motion.div variants={fadeUp}>
            <SocialLinks only={["github", "linkedin", "instagram", "email"]} />
          </motion.div>
        </motion.div>

        {/* Right — decorative avatar */}
        <div className="order-first flex justify-center lg:order-none lg:justify-end">
          <AvatarRing />
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}
