import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TimelineEntry } from "@/components/timeline/TimelineEntry";
import { experience } from "@/data/content";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export function Experience() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Progress of the rail through the section: 0 when its top hits viewport
  // center, 1 when its bottom hits viewport center.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });
  const fillProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <Section id="experience">
      <SectionHeading
        kicker="Journey"
        title="Where I've made an impact"
        description="My professional path building enterprise-scale products — from a Software Development Intern at Informatica to a full-stack engineer at Salesforce."
      />

      <div ref={sectionRef} className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-8 top-2 bottom-4 w-px -translate-x-1/2 bg-gradient-to-b from-accent-500/60 via-accent-400/25 to-transparent sm:left-10"
        />

        {/* Accent fill that "draws" from top to bottom with scroll progress */}
        <motion.span
          aria-hidden
          style={{
            x: "-50%",
            scaleY: prefersReducedMotion ? 1 : fillProgress,
            transformOrigin: "top",
          }}
          className="pointer-events-none absolute left-8 top-2 bottom-4 w-px -translate-x-1/2 bg-gradient-to-b from-accent-300 via-accent-400 to-cyan-400 shadow-[0_0_8px_1px] shadow-accent-500/40 sm:left-10"
        />

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="space-y-5 sm:space-y-6"
        >
          {experience.map((item, i) => (
            <motion.li key={item.organization} variants={fadeUp}>
              <TimelineEntry
                item={item}
                fillProgress={prefersReducedMotion ? undefined : fillProgress}
                position={
                  experience.length > 1 ? i / (experience.length - 1) : 0
                }
              />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </Section>
  );
}
