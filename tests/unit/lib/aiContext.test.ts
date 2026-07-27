import { describe, it, expect } from "vitest";
import {
  SYSTEM_PROMPT,
  SUGGESTED_PROMPTS,
  OUT_OF_SCOPE_REPLY,
  isPersonalQuestion,
} from "@/lib/aiContext";
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

  it("includes the exact YouTube channel URL", () => {
    expect(SYSTEM_PROMPT).toContain("https://www.youtube.com/@qazimaazarshad");
  });

  it("forbids inventing personal details and gives an out-of-scope reply", () => {
    // Names the personal topics it must refuse.
    for (const topic of ["age", "family", "marital", "children", "salary"]) {
      expect(SYSTEM_PROMPT.toLowerCase(), topic).toContain(topic);
    }
    // Provides the canned redirect to email instead of guessing.
    expect(SYSTEM_PROMPT).toContain(
      `I only have Maaz's professional info here`,
    );
    expect(SYSTEM_PROMPT).toContain(profile.email);
  });

  it("exposes non-empty suggested prompts", () => {
    expect(SUGGESTED_PROMPTS.length).toBeGreaterThan(0);
    for (const prompt of SUGGESTED_PROMPTS) {
      expect(prompt.trim()).not.toBe("");
    }
  });
});

describe("isPersonalQuestion", () => {
  it("flags clearly personal / off-scope questions", () => {
    for (const q of [
      "maaz age",
      "how old is maaz",
      "maaz wife",
      "is he married?",
      "does he have a son?",
      "his daughter name",
      "who is his mother",
      "his father",
      "how many kids does he have",
      "what is his salary",
      "his religion",
    ]) {
      expect(isPersonalQuestion(q), q).toBe(true);
    }
  });

  it("does NOT flag legitimate professional questions", () => {
    for (const q of [
      "What does Maaz do at Salesforce?",
      "What's his tech stack?",
      "Show me his best projects",
      "How can I contact him?",
      "Tell me about his experience",
      "What are his achievements?",
    ]) {
      expect(isPersonalQuestion(q), q).toBe(false);
    }
  });

  it("out-of-scope reply points to his email", () => {
    expect(OUT_OF_SCOPE_REPLY).toContain(profile.email);
  });
});
