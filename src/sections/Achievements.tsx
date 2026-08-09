import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { staggerContainer, viewportOnce } from "@/lib/motion";
import { layoutHonours, type Honour } from "@/lib/honours";
import {
  achievements,
  achievementLinks,
  type CertificateItem,
} from "@/data/content";
import { certificates } from "@/data/certificates";
import { MedalCard } from "@/components/achievements/MedalCard";
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
  const placed = useMemo(() => layoutHonours(achievements), []);

  // Shared by the click handler and the decision to render an interactive
  // control, so the two can't disagree about what has viewable media.
  const resolveSelection = (honour: Honour): Selection | null => {
    const link = achievementLinks[honour.raw];
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
        id: cert?.id ?? `achievement-${honour.raw}`,
        title: honour.raw,
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

      {/* Six columns so halves and thirds both divide evenly. */}
      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        {placed.map(({ honour, variant, span }) => {
          const link = achievementLinks[honour.raw];
          const selection = resolveSelection(honour);
          return (
            <MedalCard
              key={honour.raw}
              honour={honour}
              variant={variant}
              span={span}
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
