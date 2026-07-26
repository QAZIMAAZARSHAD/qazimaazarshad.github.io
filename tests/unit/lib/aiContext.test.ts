import { describe, it, expect } from "vitest";
import { SYSTEM_PROMPT, SUGGESTED_PROMPTS } from "@/lib/aiContext";
import { profile, socials } from "@/data/content";

describe("aiContext", () => {
  it("embeds authoritative profile facts in the system prompt", () => {
    expect(SYSTEM_PROMPT).toContain(profile.name);
    expect(SYSTEM_PROMPT).toContain(profile.email);
    expect(SYSTEM_PROMPT).toContain("Maaz");
  });

  it("includes every real social URL so handles are never invented", () => {
    for (const social of socials) {
      expect(SYSTEM_PROMPT, social.label).toContain(social.href);
    }
  });

  it("explicitly rules out a non-existent YouTube handle", () => {
    expect(SYSTEM_PROMPT).toMatch(/no youtube/i);
  });

  it("exposes non-empty suggested prompts", () => {
    expect(SUGGESTED_PROMPTS.length).toBeGreaterThan(0);
    for (const prompt of SUGGESTED_PROMPTS) {
      expect(prompt.trim()).not.toBe("");
    }
  });
});
