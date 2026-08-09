import { describe, it, expect } from "vitest";
import { achievements, achievementLinks } from "@/data/content";
import { certificates } from "@/data/certificates";

describe("content: achievementLinks", () => {
  it("every link key matches an existing achievement title", () => {
    for (const key of Object.keys(achievementLinks)) {
      expect(achievements, `link key "${key}"`).toContain(key);
    }
  });

  it("each link has at least one well-formed target", () => {
    for (const [key, link] of Object.entries(achievementLinks)) {
      const targets = [link.certificateId, link.image, link.href].filter(
        Boolean,
      );
      expect(
        targets.length,
        `${key} must define a target`,
      ).toBeGreaterThanOrEqual(1);

      if (link.href) {
        expect(link.href, `href for ${key}`).toMatch(/^https?:\/\//);
      }
      if (link.image) {
        expect(link.image, `image for ${key}`).toMatch(
          /^images\/.+\.(png|jpe?g)$/,
        );
      }
      if (link.certificateId) {
        const cert = certificates.find((c) => c.id === link.certificateId);
        expect(
          cert,
          `certificate "${link.certificateId}" for ${key}`,
        ).toBeDefined();
      }
    }
  });
});
