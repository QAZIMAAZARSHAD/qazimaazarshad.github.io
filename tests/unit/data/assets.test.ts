import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  profile,
  projects,
  experience,
  earlierExperience,
  education,
  achievementLinks,
} from "@/data/content";
import { certificates } from "@/data/certificates";
import { HOBBY_META } from "@/sections/Hobbies";

// Vitest runs from the project root; resolve public/ against it.
const PUBLIC_DIR = resolve(process.cwd(), "public");

/** Resolve an asset path (as used by asset()) to its file under public/. */
const onDisk = (assetPath: string) =>
  existsSync(resolve(PUBLIC_DIR, assetPath.replace(/^\//, "")));

describe("public assets referenced in content exist on disk", () => {
  it("profile avatar", () => {
    expect(onDisk(profile.avatar), profile.avatar).toBe(true);
  });

  it("all project images", () => {
    for (const p of projects) expect(onDisk(p.image), p.image).toBe(true);
  });

  it("all experience logos", () => {
    for (const c of experience) expect(onDisk(c.image), c.image).toBe(true);
  });

  it("all earlier-experience logos and certificates", () => {
    for (const e of earlierExperience) {
      expect(onDisk(e.image), e.image).toBe(true);
      if (e.certificate)
        expect(onDisk(e.certificate), e.certificate).toBe(true);
    }
  });

  it("all education logos", () => {
    for (const e of education) expect(onDisk(e.image), e.image).toBe(true);
  });

  it("achievement link images", () => {
    for (const [key, link] of Object.entries(achievementLinks)) {
      if (link.image)
        expect(onDisk(link.image), `${key}: ${link.image}`).toBe(true);
    }
  });

  it("hobby chip icons and effect projectile images", () => {
    for (const [name, meta] of Object.entries(HOBBY_META)) {
      if (meta.icon) expect(onDisk(meta.icon), `${name} icon`).toBe(true);
      if (meta.effect.image)
        expect(onDisk(meta.effect.image), `${name} effect`).toBe(true);
    }
  });

  it("all certificate previews and files", () => {
    for (const c of certificates) {
      if (c.preview) expect(onDisk(c.preview), c.preview).toBe(true);
      if (c.file) expect(onDisk(c.file), c.file).toBe(true);
    }
  });
});
