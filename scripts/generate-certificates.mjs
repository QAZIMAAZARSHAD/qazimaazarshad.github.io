/**
 * Generate certificate assets + data for the portfolio.
 *
 * For every certificate under SRC (offer letters skipped for privacy) this:
 *  - renders a single legible JPG preview (card thumbnail + lightbox view) via
 *    macOS `qlmanage`, keeping the deploy lean;
 *  - keeps the ORIGINAL file (for a "Download" link) only for real credentials
 *    (courses, virtual experiences, internships, achievements, recommendations)
 *    — high-volume participation/quiz entries are preview-only;
 *  - emits a typed src/data/certificates.ts consumed by the Certifications view.
 *
 * Re-run after adding/removing certificates:  node scripts/generate-certificates.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SRC = "/Users/qarshad/Downloads/Personal/Certificates";
const ROOT = path.resolve(import.meta.dirname, "..");
const PUB = path.join(ROOT, "public/certificates");
const FILES_DIR = path.join(PUB, "files");
const PREVIEWS_DIR = path.join(PUB, "previews");
const TMP_DIR = path.join(PUB, ".tmp");
const DATA_FILE = path.join(ROOT, "src/data/certificates.ts");

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const MAX_ORIGINAL_IMAGE = 1600;
const PREVIEW_MAX = 1000;
const PREVIEW_QUALITY = 76;
/** Categories whose original file we host for download. */
const KEEP_ORIGINAL = new Set(["course", "externship", "achievement", "other"]);

function categoryFor(rel, base) {
  const p = rel.toLowerCase();
  // The Red Hat certificate is a course-style credential, not a competition win.
  if (/red hat certificate/i.test(base)) return "other";
  // The NEO 5.0 LOR lands in "other"; the sensitive professor LOR is filtered out.
  if (p.includes("/lor/")) return "other";
  if (p.includes("/mooc/")) return "course";
  if (p.startsWith("internship-training-mooc/internship/")) return "externship";
  if (p.startsWith("achievements/")) return "achievement";
  if (p.startsWith("participation/")) return "participation";
  if (p.startsWith("other/")) {
    if (/course/i.test(base)) return "course";
    return "other";
  }
  return "other";
}

const ISSUERS = [
  ["coursera", "Coursera"],
  ["udemy", "Udemy"],
  ["google cloud", "Google Cloud"],
  ["girlscript", "GirlScript"],
  ["sololearn", "SoloLearn"],
  ["isro", "ISRO"],
  ["red hat", "Red Hat"],
  ["jpmorgan", "JPMorgan Chase"],
  ["microsoft", "Microsoft"],
  ["future ready", "Microsoft Future Ready Talent"],
  ["cipher schools", "Cipher Schools"],
  ["pupilfirst", "PupilFirst"],
  ["amcat", "AMCAT"],
  ["neo", "National Engineering Olympiad"],
  ["elite techno", "Elite Techno Groups"],
  ["intern studio", "Internship Studio"],
  ["internship studio", "Internship Studio"],
  ["suven", "Suven Consultants"],
  ["devincept", "DevIncept"],
  ["sparks", "The Sparks Foundation"],
];

function issuerFor(base) {
  const b = base.toLowerCase();
  for (const [key, label] of ISSUERS) if (b.includes(key)) return label;
  return undefined;
}

const titleCase = (s) => s.replace(/\b([a-z])/g, (m) => m.toUpperCase());

function titleFor(base) {
  let name = base.replace(/\.[^.]+$/, "").trim();
  const generic = /^_?participation-certificate(?:[ -]?\(?(\d+)\)?)?$/i.exec(
    name,
  );
  if (generic) {
    return generic[1]
      ? `Quiz Participation ${generic[1]}`
      : "Quiz Participation";
  }
  name = name
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\bQioz\b/i, "Quiz")
    .replace(/UdemyAWS/i, "Udemy AWS")
    .trim();
  return titleCase(name);
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function walk(dir, rootAbs, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, rootAbs, out);
    else out.push(path.relative(rootAbs, abs));
  }
  return out;
}

function run(cmd, args) {
  try {
    execFileSync(cmd, args, { stdio: "ignore", timeout: 60000 });
    return true;
  } catch {
    return false;
  }
}

// ---- build ----
for (const d of [FILES_DIR, PREVIEWS_DIR, TMP_DIR]) {
  fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(d, { recursive: true });
}

const rels = walk(SRC, SRC).filter((r) => {
  const rl = "/" + r.toLowerCase();
  if (rl.includes("/offer letter/")) return false; // private
  if (rl.includes("lor manmohak")) return false; // sensitive professor LOR
  if (rl.includes("red hat report")) return false; // not a certificate
  return true;
});
const usedSlugs = new Set();
const records = [];

for (const rel of rels) {
  const base = path.basename(rel);
  const ext = path.extname(base).toLowerCase();
  const category = categoryFor(rel.replace(/\\/g, "/"), base);

  let slug = slugify(`${category}-${base.replace(/\.[^.]+$/, "")}`);
  let unique = slug;
  let i = 2;
  while (usedSlugs.has(unique)) unique = `${slug}-${i++}`;
  slug = unique;
  usedSlugs.add(slug);

  const srcAbs = path.join(SRC, rel);
  const tmpAbs = path.join(TMP_DIR, `${slug}${ext}`);
  fs.copyFileSync(srcAbs, tmpAbs);
  if (IMAGE_EXT.has(ext))
    run("sips", ["-Z", String(MAX_ORIGINAL_IMAGE), tmpAbs]);

  const rec = {
    id: slug,
    title: titleFor(base),
    issuer: issuerFor(base),
    category,
    preview: `certificates/previews/${slug}.jpg`,
    fileType: ext === ".pdf" ? "pdf" : "image",
  };
  if (KEEP_ORIGINAL.has(category)) {
    fs.copyFileSync(tmpAbs, path.join(FILES_DIR, `${slug}${ext}`));
    rec.file = `certificates/files/${slug}${ext}`;
  }
  records.push({ rec, tmpAbs, ext });
}

// Render previews (batched) then convert PNG → compact JPG.
const tmpFiles = records.map((r) => r.tmpAbs);
for (let i = 0; i < tmpFiles.length; i += 25) {
  run("qlmanage", [
    "-t",
    "-s",
    String(PREVIEW_MAX),
    "-o",
    TMP_DIR,
    ...tmpFiles.slice(i, i + 25),
  ]);
}

let missing = 0;
for (const { rec, tmpAbs } of records) {
  const producedPng = `${tmpAbs}.png`;
  const outJpg = path.join(PREVIEWS_DIR, `${rec.id}.jpg`);
  if (fs.existsSync(producedPng)) {
    run("sips", [
      "-s",
      "format",
      "jpeg",
      "-s",
      "formatOptions",
      String(PREVIEW_QUALITY),
      producedPng,
      "--out",
      outJpg,
    ]);
  }
  if (!fs.existsSync(outJpg)) {
    rec.preview = undefined;
    missing++;
  }
}

fs.rmSync(TMP_DIR, { recursive: true, force: true });

const ORDER = ["course", "externship", "achievement", "participation", "other"];
const out = records
  .map((r) => r.rec)
  .sort(
    (a, b) =>
      ORDER.indexOf(a.category) - ORDER.indexOf(b.category) ||
      a.title.localeCompare(b.title),
  );

const body =
  `// AUTO-GENERATED by scripts/generate-certificates.mjs — do not edit by hand.\n` +
  `import type { CertificateItem } from "./content";\n\n` +
  `export const certificates: CertificateItem[] = ${JSON.stringify(out, null, 2)};\n`;
fs.writeFileSync(DATA_FILE, body);

const byCat = out.reduce(
  (m, r) => ((m[r.category] = (m[r.category] || 0) + 1), m),
  {},
);
console.log(`Wrote ${out.length} certificates (${missing} without preview).`);
console.log("By category:", byCat);
