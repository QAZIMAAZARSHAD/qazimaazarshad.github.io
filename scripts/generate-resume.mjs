/**
 * Generate the one-page résumé PDF (and a PNG preview) from an inline HTML
 * template using headless Chromium. Re-run: node scripts/generate-resume.mjs
 */
import { chromium } from "@playwright/test";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_PDF = path.join(ROOT, "public/resume/Qazi_Maaz_Arshad_Resume.pdf");
const OUT_PNG = "/tmp/resume.png";

const ACCENT = "#4f46e5";
const ACCENT2 = "#0891b2";

const skills = [
  ["Languages", "Java, TypeScript, JavaScript, Python, SQL, C++"],
  ["Backend", "Spring Boot, Microservices, REST APIs, BFF Layers, MySQL, DBMS"],
  ["Frontend", "React, HTML, CSS, Bootstrap"],
  [
    "AI-Assisted Engineering",
    "Cursor AI, Anthropic Claude, Prompt Engineering",
  ],
  [
    "Quality & Delivery",
    "Shift-Left Quality, Test Automation, Unit & E2E Testing, CI/CD",
  ],
  ["Foundations", "DSA, OOP, System Design, Problem Solving"],
  ["Tools & Platforms", "Git, GitHub, Bitbucket, Jira, Microsoft Azure"],
];

const bullets = [
  "Own and deliver critical <strong>epics and refactors end-to-end</strong> across REST APIs, configuration &amp; metadata flows, BFF layers, and complex UI workflows — using <strong>Java, Spring Boot, React &amp; TypeScript</strong> in a large, multi-service codebase.",
  "Work <strong>AI-first</strong>: orchestrate coding agents (Cursor, Anthropic Claude) as a team — decomposing work, running agents in parallel, and delegating well-scoped tasks while steering architecture and review to ship large, complex work faster.",
  "Harden every change with automated <strong>unit, end-to-end, and visual regression tests</strong> generated alongside the code, driving shift-left quality and zero-regression releases.",
  "Recognized as the <strong>go-to for cross-layer debugging</strong> and time-sensitive blockers — stepping in to unblock releases and ensure continuity across dependency and ownership gaps.",
  "Built and maintained UI features and components on <strong>MDM.next</strong> (React) and streamlined backend services (Java/Spring Boot), delivering features, fixes, and user stories across the full stack.",
  "Champion <strong>correctness, maintainability, and release stability</strong> in high-impact areas of the enterprise master-data-management platform.",
  "Improve developer velocity through <strong>CI/CD pipelines</strong>, reusable patterns, and automation; collaborate closely with PMs, architects, and cross-functional teams.",
  "Raise the engineering bar on <strong>code review, testing, and AI-assisted workflows</strong> — sharing patterns that help the team ship reliable, well-tested software at speed.",
];

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 0; }
  html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: "Helvetica Neue", Helvetica, Arial, "Segoe UI", sans-serif;
    color: #1f2733; font-size: 11.3px; line-height: 1.55;
    width: 794px;
  }
  .header {
    background: linear-gradient(120deg, ${ACCENT} 0%, #6d28d9 55%, ${ACCENT2} 100%);
    color: #fff; padding: 30px 48px 24px;
  }
  .name { font-size: 34px; font-weight: 800; letter-spacing: .3px; }
  .title { font-size: 14px; font-weight: 500; opacity: .95; margin-top: 4px; letter-spacing: .4px; }
  .contact { margin-top: 16px; font-size: 11px; display: flex; flex-wrap: wrap; gap: 8px 16px; }
  .contact a, .contact span { color: #eef2ff; text-decoration: none; }
  .contact .sep { opacity: .5; }
  .body { padding: 22px 48px 24px; }
  .section { margin-top: 19px; }
  .section:first-child { margin-top: 0; }
  h2 {
    font-size: 12.5px; text-transform: uppercase; letter-spacing: 1.5px;
    color: ${ACCENT}; font-weight: 800; padding-bottom: 5px; margin-bottom: 10px;
    border-bottom: 2px solid #e6e8f5;
  }
  .summary { font-size: 12px; line-height: 1.6; color: #333c49; }
  .job-head { display: flex; justify-content: space-between; align-items: baseline; }
  .job-org { font-size: 14.5px; font-weight: 800; color: #111827; }
  .job-meta { font-size: 11px; color: #5b6675; white-space: nowrap; }
  .job-role { font-size: 12.5px; font-weight: 700; color: ${ACCENT}; margin-top: 3px; }
  .job-prog { font-size: 10.4px; color: #6b7480; font-style: italic; margin: 2px 0 7px; }
  ul { list-style: none; }
  li { position: relative; padding-left: 16px; margin-bottom: 6px; line-height: 1.5; }
  li::before {
    content: ""; position: absolute; left: 0; top: 7px; width: 5.5px; height: 5.5px;
    border-radius: 50%; background: linear-gradient(135deg, ${ACCENT}, ${ACCENT2});
  }
  .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px 32px; }
  .skill-row { font-size: 11.3px; line-height: 1.5; }
  .skill-cat { font-weight: 700; color: #111827; }
  .edu-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
  .edu-main { font-weight: 700; color: #111827; font-size: 12px; }
  .edu-sub { color: #5b6675; font-size: 10.8px; }
  .edu-meta { font-size: 11px; color: #5b6675; white-space: nowrap; }
  .edu-school { font-size: 10.6px; color: #6b7480; margin-top: 3px; }
</style></head><body>
  <div class="header">
    <div class="name">Qazi Maaz Arshad</div>
    <div class="title">Software Engineer — Full-stack &amp; AI-first</div>
    <div class="contact">
      <span>Bengaluru, India</span><span class="sep">•</span>
      <a href="mailto:qazimaazarshad@gmail.com">qazimaazarshad@gmail.com</a><span class="sep">•</span>
      <a href="https://www.linkedin.com/in/qazimaazarshad/">linkedin.com/in/qazimaazarshad</a><span class="sep">•</span>
      <a href="https://github.com/QAZIMAAZARSHAD">github.com/QAZIMAAZARSHAD</a><span class="sep">•</span>
      <a href="https://qazimaazarshad.github.io/">qazimaazarshad.github.io</a>
    </div>
  </div>
  <div class="body">
    <div class="section">
      <h2>Summary</h2>
      <p class="summary">Software Engineer with <strong>4+ years</strong> building enterprise-scale products across the full stack. At Salesforce (R&amp;D MDM), I work <strong>AI-first</strong> — orchestrating coding agents to plan, build, test, and review in parallel — pairing deep ownership of backend, BFF, and UI with a relentless focus on correctness, maintainability, and zero-regression releases.</p>
    </div>

    <div class="section">
      <h2>Experience</h2>
      <div class="job-head">
        <div class="job-org">Salesforce — R&amp;D MDM</div>
        <div class="job-meta">Aug 2022 – Present &nbsp;·&nbsp; Bengaluru, India</div>
      </div>
      <div class="job-role">Associate Member of Technical Staff</div>
      <div class="job-prog">Grew through Software Development Intern → R&amp;D Apprentice → Associate Software Engineer → Software Engineer → AMTS (Informatica, acquired by Salesforce).</div>
      <ul>
        ${bullets.map((b) => `<li>${b}</li>`).join("\n        ")}
      </ul>
    </div>

    <div class="section">
      <h2>Technical Skills</h2>
      <div class="skills-grid">
        ${skills
          .map(
            ([cat, list]) =>
              `<div class="skill-row"><span class="skill-cat">${cat}:</span> ${list}</div>`,
          )
          .join("\n        ")}
      </div>
    </div>

    <div class="section">
      <h2>Education</h2>
      <div class="edu-row">
        <div>
          <span class="edu-main">B.Tech, Computer Science &amp; Engineering</span>
          <span class="edu-sub"> — Lovely Professional University</span>
        </div>
        <div class="edu-meta">2019 – 2023 &nbsp;·&nbsp; CGPA 8.51</div>
      </div>
      <div class="edu-school">Barrows Blue Bells School — Class XII: 83.8% (2018) · Class X: 86.33% (2016)</div>
    </div>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
await page.setContent(html, { waitUntil: "networkidle" });
const height = await page.evaluate(() => document.body.scrollHeight);
await page.screenshot({ path: OUT_PNG, fullPage: true });
await page.pdf({
  path: OUT_PDF,
  format: "A4",
  printBackground: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
});
console.log(`content height: ${height}px (A4 ≈ 1123px)`);
console.log(`wrote ${OUT_PDF}`);
await browser.close();
