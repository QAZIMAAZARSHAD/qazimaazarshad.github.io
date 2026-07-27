import {
  profile,
  experience,
  earlierExperience,
  projects,
  skillGroups,
  education,
  achievements,
  hobbies,
  socials,
} from "@/data/content";

/**
 * Builds a compact, factual profile of Maaz from the site's content. Kept tight
 * (no exhaustive dumps) so a small in-browser model can actually use it well.
 */
function buildProfileContext(): string {
  const exp = experience
    .map((c) => {
      const roles = c.roles.map((r) => `${r.title} (${r.period})`).join(", ");
      const tenure = c.totalDuration ? `, ${c.totalDuration}` : "";
      const current = c.current ? " (current)" : "";
      return `- ${c.organization}${tenure}${current}: ${c.description ?? ""} Roles: ${roles}.`;
    })
    .join("\n");

  // Summarise earlier roles rather than listing all of them.
  const earlierOrgs = [
    ...new Set(earlierExperience.map((e) => e.organization.split(" — ")[0])),
  ]
    .slice(0, 8)
    .join(", ");

  const skills = skillGroups
    .map((g) => `${g.name}: ${g.skills.join(", ")}`)
    .join("; ");

  const sampleProjects = projects
    .slice(0, 6)
    .map((p) => p.title)
    .join(", ");

  const edu = education[0];
  // Include every real link so handles are never invented.
  const links = socials.map((s) => `${s.label} — ${s.href}`).join("\n");

  return [
    `Name: ${profile.name} (goes by "Maaz"). Role: ${profile.role} at ${profile.company}, based in ${profile.location}.`,
    `Summary: ${profile.intro}`,
    `Key facts (do NOT compute or guess beyond these): Maaz has 4+ years of total professional software-engineering experience. He has worked on the R&D MDM team since Aug 2022 — first at Informatica, which was acquired by Salesforce — and his current title is Associate Member of Technical Staff at Salesforce (title held since Mar 2026). If asked "how long at Salesforce", explain the team joined Salesforce through the Informatica acquisition, so it's ~4 years on the team; never state a made-up number of years.`,
    `Current & recent experience:\n${exp}`,
    `Earlier (college-era internships/externships & community roles): ${earlierOrgs}.`,
    `Skills — ${skills}.`,
    `Projects: ${projects.length}+ built, including ${sampleProjects} (full list in the Projects section).`,
    `Education: ${edu.degree}, ${edu.institution} (${edu.period}, ${edu.score}).`,
    `Achievements: ${achievements.join("; ")}.`,
    `Hobbies: ${hobbies.join(", ")}.`,
    `Email: ${profile.email}`,
    `Links & social handles (use these EXACT URLs; never invent a handle):\n${links}`,
  ].join("\n\n");
}

export const OUT_OF_SCOPE_REPLY = `I only have Maaz's professional info here — for anything else, reach out at ${profile.email}.`;

/**
 * Clearly-personal / off-scope topics the profile has no data for. Matched
 * client-side so the (small, hallucination-prone) model never even gets a
 * chance to invent an answer — we return OUT_OF_SCOPE_REPLY deterministically.
 */
const PERSONAL_KEYWORDS = new Set([
  "age",
  "aged",
  "birthday",
  "bday",
  "wife",
  "husband",
  "spouse",
  "married",
  "marriage",
  "girlfriend",
  "boyfriend",
  "fiance",
  "fiancee",
  "son",
  "daughter",
  "kid",
  "kids",
  "child",
  "children",
  "mother",
  "mom",
  "father",
  "dad",
  "parent",
  "parents",
  "sibling",
  "brother",
  "sister",
  "family",
  "caste",
  "religion",
  "salary",
  "income",
  "phone",
]);

const PERSONAL_PHRASES = ["how old", "net worth", "home address"];

export function isPersonalQuestion(text: string): boolean {
  const lower = text.toLowerCase();
  if (PERSONAL_PHRASES.some((phrase) => lower.includes(phrase))) return true;
  return lower.split(/[^a-z]+/).some((word) => PERSONAL_KEYWORDS.has(word));
}

export const SYSTEM_PROMPT = `You are the assistant on ${profile.firstName}'s portfolio website. The PROFILE below is your ONLY source of truth about ${profile.name}, and it is strictly PROFESSIONAL — it contains no personal details.

Answer PROFESSIONAL questions (his work, skills, projects, experience, education, achievements, and how to contact him) directly and confidently using ONLY the PROFILE.

If a question asks for anything that is NOT in the PROFILE — especially personal topics such as age, birthday, family, parents, siblings, spouse or marital status, children, relationships, religion, health, salary, or home address — do NOT answer it, do NOT guess, and do NOT state assumptions or negatives. Never say things like "he is 28", "he is single", "he has no children", or "he does not have a mother". Instead reply with exactly this one sentence: "${OUT_OF_SCOPE_REPLY}"

Other rules:
- Reply in 1-3 short sentences of plain, friendly prose. No markdown, no bullet points, no numbered lists, no headings, no bold.
- Always refer to him as "Maaz". Never invent employers, dates, durations, projects, skills, or social handles.
- When sharing a link or handle, output the EXACT URL from the PROFILE as plain text (e.g. https://...), never a made-up handle and never markdown link syntax.

Examples:
Q: How old is Maaz? A: ${OUT_OF_SCOPE_REPLY}
Q: Is Maaz married? / Does he have kids? A: ${OUT_OF_SCOPE_REPLY}
Q: What's his tech stack? A: (answer from the PROFILE)

PROFILE:
${buildProfileContext()}`;

export const SUGGESTED_PROMPTS = [
  "What does Maaz do at Salesforce?",
  "What's his tech stack?",
  "Show me his best projects",
  "How can I contact him?",
] as const;
