import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { staggerContainer, viewportOnce } from "@/lib/motion";
import {
  achievements,
  achievementLinks,
  type CertificateItem,
} from "@/data/content";
import { certificates } from "@/data/certificates";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import {
  CertificateLightbox,
  type LightboxSlide,
} from "@/components/certificates/CertificateLightbox";

interface Selection {
  certificate: CertificateItem;
  slides: LightboxSlide[];
}

export function Achievements() {
  const [selected, setSelected] = useState<Selection | null>(null);

  // Resolve an achievement to its lightbox selection (or null when it has no
  // viewable media). Single source of truth for both the click handler and the
  // decision to render an interactive button, so they can't disagree.
  const resolveSelection = (text: string): Selection | null => {
    const link = achievementLinks[text];
    if (!link) return null;

    const cert = link.certificateId
      ? certificates.find((c) => c.id === link.certificateId)
      : undefined;

    const slides: LightboxSlide[] = [];
    if (link.image) slides.push({ image: link.image });
    if (cert?.preview) slides.push({ image: cert.preview, file: cert.file });
    if (slides.length === 0) return null;

    return {
      certificate: {
        id: cert?.id ?? `achievement-${text}`,
        title: text,
        issuer: cert?.issuer,
        category: "achievement",
        preview: slides[0].image,
        fileType: cert?.fileType ?? "image",
      },
      slides,
    };
  };

  return (
    <Section id="achievements">
      <SectionHeading kicker="Recognition" title="Awards & achievements" />

      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        {achievements.map((achievement, index) => {
          const link = achievementLinks[achievement];
          const selection = resolveSelection(achievement);
          return (
            <AchievementCard
              key={achievement}
              text={achievement}
              index={index}
              href={link?.href}
              onOpen={selection ? () => setSelected(selection) : undefined}
            />
          );
        })}
      </motion.ul>

      <AnimatePresence>
        {selected && (
          <CertificateLightbox
            key={selected.certificate.id}
            certificate={selected.certificate}
            slides={selected.slides}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </Section>
  );
}
