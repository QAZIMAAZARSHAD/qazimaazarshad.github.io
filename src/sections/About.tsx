import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Check, Sparkles, Users, Zap } from "lucide-react";
import { profile, stats } from "@/data/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

/** One accent icon per "about" bullet, cycled if the list grows. */
const BULLET_ICONS: LucideIcon[] = [Sparkles, Check, Users, Zap];

export function About() {
  return (
    <Section id="about">
      <SectionHeading
        kicker="About"
        title="Full-stack engineering, amplified by AI"
        description="How I build — pairing deep product ownership with AI-first, agentic workflows."
      />

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
        <div className="flex flex-col gap-8">
          <Reveal>
            <p className="text-lg leading-relaxed text-ink-200 sm:text-xl">
              {profile.intro}
            </p>
          </Reveal>

          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="flex flex-col gap-4"
          >
            {profile.about.map((item, i) => {
              const Icon = BULLET_ICONS[i % BULLET_ICONS.length];
              return (
                <motion.li
                  key={item}
                  variants={fadeUp}
                  className="flex items-start gap-4"
                >
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-500/20 to-cyan-400/20 ring-1 ring-inset ring-white/10">
                    <Icon className="h-4 w-4 text-accent-300" aria-hidden />
                  </span>
                  <span className="text-base leading-relaxed text-ink-300">
                    {item}
                  </span>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-2 gap-4 sm:gap-5"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="glass glass-hover flex flex-col justify-center gap-2 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-500/20 sm:p-6"
            >
              <span className="text-gradient font-display text-2xl font-bold leading-tight sm:text-3xl">
                {stat.value}
              </span>
              <span className="text-sm leading-snug text-ink-400">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
