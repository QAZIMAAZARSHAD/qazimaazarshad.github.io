import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FoundationsDeck } from "@/components/foundations/FoundationsDeck";
import { CertificateLightbox } from "@/components/certificates/CertificateLightbox";
import {
  earlierExperience,
  type CertificateItem,
  type ExperienceItem,
} from "@/data/content";
import { certificates } from "@/data/certificates";

/**
 * Resolves an experience item's credential path to a full certificate record
 * (with a preview thumbnail) so it can open in the shared lightbox. Falls back
 * to a minimal record derived from the path if it isn't in the archive.
 */
function resolveCertificate(
  item: ExperienceItem,
  path: string,
  byFile: Map<string, CertificateItem>,
): CertificateItem {
  const match = byFile.get(path);
  if (match) return match;

  const isImage = /\.(png|jpe?g|webp)$/i.test(path);
  return {
    id: path,
    title: `${item.organization} — ${item.role}`,
    issuer: item.organization,
    category: "externship",
    preview: path.replace("/files/", "/previews/").replace(/\.[^.]+$/, ".jpg"),
    file: path,
    fileType: isImage ? "image" : "pdf",
  };
}

export function EarlierExperience() {
  const [selected, setSelected] = useState<CertificateItem | null>(null);

  const certByFile = useMemo(
    () =>
      new Map(
        certificates
          .filter((c) => c.file)
          .map((c) => [c.file as string, c] as const),
      ),
    [],
  );

  const viewCertificate = (item: ExperienceItem) => {
    if (!item.certificate) return;
    setSelected(resolveCertificate(item, item.certificate, certByFile));
  };

  return (
    <Section id="earlier">
      <SectionHeading
        kicker="Foundations"
        title="Earlier experience & community"
        description="Internships, open-source programs, campus ambassadorships, and student-org leadership from my university years — where it all started."
      />

      <FoundationsDeck
        items={earlierExperience}
        onViewCertificate={viewCertificate}
      />

      <AnimatePresence>
        {selected && (
          <CertificateLightbox
            key={selected.id}
            certificate={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </Section>
  );
}
