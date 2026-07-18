import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { CopyEmailButton } from "@/components/contact/CopyEmailButton";
import { profile } from "@/data/content";
import { fadeUp, scaleIn, staggerContainer, viewportOnce } from "@/lib/motion";

export function Contact() {
  return (
    <Section id="contact">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative mx-auto max-w-3xl"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-r from-accent-500/30 via-accent-400/20 to-cyan-400/30 opacity-70 blur-3xl"
        />

        <motion.div
          variants={scaleIn}
          className="glass relative overflow-hidden rounded-3xl px-6 py-14 text-center shadow-2xl shadow-accent-500/10 sm:px-12 sm:py-16"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-accent-500/20 blur-3xl"
          />

          <motion.div
            variants={staggerContainer}
            className="relative flex flex-col items-center"
          >
            <SectionHeading
              align="center"
              kicker="Contact"
              title="Let's build something great"
              className="mb-5"
            />

            <motion.p
              variants={fadeUp}
              className="max-w-xl text-base leading-relaxed text-ink-400 sm:text-lg"
            >
              Have a project, an idea, or a role in mind? I'm always open to
              interesting conversations and collaborations — my inbox is just a
              click away.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <a
                href={`mailto:${profile.email}`}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg shadow-accent-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
              >
                <Mail
                  className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5"
                  aria-hidden
                />
                Say hello
              </a>

              <CopyEmailButton email={profile.email} />
            </motion.div>

            <motion.p variants={fadeUp} className="mt-6 text-sm text-ink-500">
              or write directly to{" "}
              <a
                href={`mailto:${profile.email}`}
                className="font-mono text-accent-300 underline-offset-4 transition-colors hover:text-cyan-400 hover:underline"
              >
                {profile.email}
              </a>
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col items-center gap-4"
            >
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500">
                Find me elsewhere
              </span>
              <SocialLinks className="justify-center" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </Section>
  );
}
