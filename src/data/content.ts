/**
 * Single source of truth for all portfolio content. Every section reads from
 * here; nothing is hard-coded in the views.
 */

import { completedYearsSince } from "@/lib/utils";

/**
 * Professional start (R&D MDM team). Drives the dynamic "years of experience".
 * Dated to the day so the count turns on the anniversary, not on 1 August.
 */
export const CAREER_START = "22 Aug 2022";
export const experienceYears = completedYearsSince(CAREER_START);

export type SocialId =
  | "linkedin"
  | "github"
  | "geeksforgeeks"
  | "leetcode"
  | "hackerrank"
  | "twitter"
  | "instagram"
  | "facebook"
  | "linktree"
  | "medium"
  | "youtube"
  | "email";

export interface SocialLink {
  id: SocialId;
  label: string;
  href: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  score: string;
  period: string;
  image: string;
  link?: string;
}

export interface ExperienceItem {
  role: string;
  organization: string;
  type: string;
  period: string;
  description: string;
  image: string;
  link?: string;
  current?: boolean;
  /** Optional path to the credential shown in the Certificates section. */
  certificate?: string;
}

/** A single role held within a company (used to show career progression). */
export interface ExperienceRole {
  title: string;
  type: string;
  period: string;
  duration?: string;
  current?: boolean;
}

/** A company card in the main timeline, holding one or more roles. */
export interface CompanyExperience {
  organization: string;
  image: string;
  link?: string;
  location?: string;
  locationType?: string;
  /** Total tenure across all roles; shown when a company has multiple roles. */
  totalDuration?: string;
  description?: string;
  current?: boolean;
  roles: ExperienceRole[];
}

export type ProjectCategory =
  "Web" | "Data" | "Machine Learning" | "Game" | "Mobile" | "App";

export interface ProjectItem {
  title: string;
  blurb: string;
  description: string;
  image: string;
  /** Optional live/repo link; omitted when no working URL exists. */
  link?: string;
  date: string;
  category: ProjectCategory;
  tech: string[];
}

export interface SkillGroup {
  name: string;
  icon: string; // lucide-react icon name, mapped in the Skills view
  skills: string[];
}

export type CertificateCategory =
  "course" | "externship" | "achievement" | "participation" | "other";

export interface CertificateItem {
  id: string;
  title: string;
  issuer?: string;
  category: CertificateCategory;
  /** Compact JPG shown on the card and in the lightbox. */
  preview?: string;
  /** Original file for download — only kept for real credentials. */
  file?: string;
  fileType: "pdf" | "image";
}

export const certificateCategories: {
  id: CertificateCategory | "all";
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "course", label: "Courses & MOOCs" },
  { id: "externship", label: "Externships" },
  { id: "achievement", label: "Achievements" },
  { id: "participation", label: "Participation" },
  { id: "other", label: "Other" },
];

export const profile = {
  name: "Qazi Maaz Arshad",
  firstName: "Maaz",
  role: "Software Engineer",
  company: "Salesforce",
  location: "Bengaluru, India",
  tagline: "I build reliable, enterprise-scale software — end to end.",
  headline: "Full-stack engineer shipping enterprise-scale products",
  intro: `Software Engineer with ${experienceYears} years of experience building enterprise-scale products — now at Salesforce, working AI-first. I pair deep full-stack ownership with agentic development: orchestrating AI coding agents to plan, build, test, and review in parallel, so large, complex work ships faster without trading away quality.`,
  about: [
    "AI-first engineer: I orchestrate coding agents (Cursor, Anthropic Claude) as a team — decomposing work, running agents in parallel, and delegating well-scoped tasks while I steer architecture and review.",
    "Turn AI leverage into shipped software — driving epics and refactors end-to-end across backend, BFF, and UI, and hardening them with automated unit, E2E, and visual tests generated alongside the code.",
    "Trusted for complex cross-layer debugging and time-sensitive blockers — using AI to move fast, but owning correctness, maintainability, and zero-regression releases.",
    "Fluent across Java, Spring Boot, React, and TypeScript in large, multi-service codebases — and in the prompt-engineering and automation that multiply their impact.",
  ],
  email: "qazimaazarshad@gmail.com",
  resume: "resume/Qazi_Maaz_Arshad_Resume.pdf",
  avatar: "images/avatar/maaz.jpg",
} as const;

/**
 * Hero taglines cycled with a scramble/decode effect (first is the default).
 * Kept short so they stay on one line and don't reflow the layout.
 */
export const heroTaglines = [
  "Full-stack, AI-first.",
  "Orchestrating AI agents.",
  "Backend · BFF · UI.",
  "Enterprise-scale, e2e.",
];

/**
 * Footer counters via Abacus — "<namespace>/<key>", empty disables.
 *
 * These moved off CounterAPI when it retired its unauthenticated v1 on 7 Aug
 * 2026. Its v2 wants a bearer token on every call, which on a static site can
 * only ship in the bundle for anyone to read and reset. Abacus needs no
 * account, and its domain carries no EasyPrivacy rule where `counterapi.dev`
 * did — so blockers no longer swallow most of the traffic.
 *
 * Visits were seeded to the last total observed on the old backend; the v1
 * reads died with the writes, so it could not be migrated exactly.
 *
 * A counter expires six months after its last access, which any live traffic
 * keeps pushing out. Only a site nobody visits for half a year would lose one.
 */
export const analytics = {
  visitCounter: "qazimaazarshad-portfolio/visits",
  /** Counter behind the footer's "loved it" heart. */
  loveCounter: "qazimaazarshad-portfolio/loves",
} as const;

/**
 * Web3Forms access key, which relays the footer's heart to my inbox — there is
 * no backend here to receive it. Empty means no email is sent; the heart still
 * counts, so the feature degrades to a plain reaction rather than breaking.
 *
 * The key is public by necessity: it ships in the bundle, as it must for any
 * backend-less form. Web3Forms treat it as an alias for an email address rather
 * than a secret, and it can only send mail to me.
 *
 * Be clear about what actually limits abuse, which is Web3Forms' own rate
 * limiting and quota — and nothing else. The honeypot field only catches bots
 * that fill in every input of a rendered form, and there is no rendered form
 * here; anyone POSTing the key directly is unaffected by it. The one-per-browser
 * rule is a courtesy to honest visitors, not a control. If the quota is ever
 * burned the relay fails silently by design, so the first sign would be mail
 * that stops arriving. A real challenge (hCaptcha or Turnstile, both supported)
 * is the only thing that would raise the cost, at the price of putting a puzzle
 * in front of a one-tap heart.
 */
export const reactionKey = "b331f813-debd-4cea-bddb-5e7b3ea36e80";

export const socials: SocialLink[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/qazimaazarshad/",
  },
  { id: "github", label: "GitHub", href: "https://github.com/qazimaazarshad" },
  {
    id: "leetcode",
    label: "LeetCode",
    href: "https://leetcode.com/qazimaazarshad/",
  },
  {
    id: "hackerrank",
    label: "HackerRank",
    href: "https://www.hackerrank.com/qazimaazarshad",
  },
  {
    id: "geeksforgeeks",
    label: "GeeksforGeeks",
    href: "https://www.geeksforgeeks.org/profile/qazimaazarshad",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    href: "https://twitter.com/qazimaazarshad",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/qazimaazarshad/",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/qazimaazarshad1",
  },
  {
    id: "linktree",
    label: "Linktree",
    href: "https://linktr.ee/qazimaazarshad",
  },
  { id: "medium", label: "Medium", href: "https://qazimaazarshad.medium.com/" },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@qazimaazarshad",
  },
  { id: "email", label: "Email", href: "mailto:qazimaazarshad@gmail.com" },
];

export const stats: Stat[] = [
  { label: "Years of experience", value: `${experienceYears}+` },
  { label: "Backend · BFF · UI ownership", value: "Full-stack" },
  { label: "Agentic development workflows", value: "AI-native" },
  { label: "Orchestrating AI agent teams", value: "Agent teams" },
];

export const navSections = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "earlier", label: "Foundations" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "achievements", label: "Achievements" },
  { id: "certifications", label: "Certificates" },
  { id: "hobbies", label: "Hobbies" },
  { id: "contact", label: "Contact" },
] as const;

/** Headline skills surfaced prominently at the top of the Skills section. */
export const topSkills: string[] = [
  "Full Stack Development",
  "Java",
  "React.js",
  "Spring Boot",
  "Microservices",
];

export const education: EducationItem[] = [
  {
    degree: "B.Tech, Computer Science & Engineering",
    institution: "Lovely Professional University",
    score: "CGPA 8.51",
    period: "2019 — 2023",
    image: "images/education/lpu.png",
    link: "https://www.lpu.in/",
  },
  {
    degree: "Intermediate (Class XII)",
    institution: "Barrows Blue Bells, School",
    score: "83.80%",
    period: "2018",
    image: "images/education/barrows.jpg",
    link: "https://www.facebook.com/p/Barrows-Blue-Bells-Inter-College-Bahraich-100077404032685/",
  },
  {
    degree: "High School (Class X)",
    institution: "Barrows Blue Bells, School",
    score: "86.33%",
    period: "2016",
    image: "images/education/bbb.jpg",
    link: "https://www.facebook.com/p/Barrows-Blue-Bells-Inter-College-Bahraich-100077404032685/",
  },
];

/**
 * Far end of the rewind at the threshold. Taken from `education`, which is
 * assumed to reach furthest back of anything below the divider — true while
 * school entries are listed, and worth rechecking if they ever go.
 */
export const earliestYear = (() => {
  const years = education.flatMap((item) =>
    [...item.period.matchAll(/\d{4}/g)].map((m) => Number(m[0])),
  );
  if (years.length > 0) return Math.min(...years);
  // Math.min() of nothing is Infinity, which would be rendered literally and
  // leave the rewind counting to an impossible year. With no education on
  // record, the career start is the earliest date the site knows of.
  return Number(CAREER_START.match(/\d{4}/)?.[0] ?? new Date().getFullYear());
})();

export const experience: CompanyExperience[] = [
  {
    organization: "Salesforce",
    image: "images/experience/salesforce.png",
    link: "https://www.salesforce.com/",
    location: "Bengaluru, India",
    locationType: "On-site",
    current: true,
    description:
      "Full-stack engineer on the R&D MDM Informatica team, building enterprise-scale master data management. I work AI-first — orchestrating coding agents to ship epics and refactors end-to-end across APIs, metadata flows, and UI with Java, Spring Boot, React & TypeScript — and I'm the go-to for cross-layer debugging and unblocking time-sensitive releases.",
    roles: [
      {
        title: "Associate Member of Technical Staff",
        type: "Full-time",
        period: "Mar 2026 — Present",
        current: true,
      },
    ],
  },
  {
    organization: "Informatica",
    image: "images/experience/infa.png",
    link: "https://www.informatica.com/",
    location: "Bengaluru, India",
    locationType: "On-site",
    totalDuration: "3 yrs 8 mos",
    description:
      "Grew from intern to Software Engineer, building UI features and components with React on Informatica MDM.next and streamlining backend services with Java & Spring Boot — delivering features, bug fixes, and user stories across the stack. Informatica joined Salesforce via acquisition.",
    roles: [
      {
        title: "Software Engineer",
        type: "Full-time",
        period: "Mar 2025 — Mar 2026",
        duration: "1 yr 1 mo",
      },
      {
        title: "Associate Software Engineer",
        type: "Full-time",
        period: "Feb 2024 — Mar 2025",
        duration: "1 yr 2 mos",
      },
      {
        title: "R&D Apprentice",
        type: "Full-time",
        period: "Aug 2023 — Feb 2024",
        duration: "7 mos",
      },
      {
        title: "Software Development Intern",
        type: "Internship",
        period: "Aug 2022 — Jul 2023",
        duration: "1 yr",
      },
    ],
  },
];

/**
 * Earlier roles — internships, open-source programs, campus ambassadorships,
 * and student-org leadership from my university years.
 */
export const earlierExperience: ExperienceItem[] = [
  {
    role: "Future Ready Talent Intern",
    organization: "Microsoft (Future Ready Talent)",
    type: "Externship",
    period: "Oct 2021 — Dec 2021",
    description:
      "Microsoft's Future Ready Talent program (with GitHub, EY & more) — learned Azure cloud & security, and shipped a Voters Registration Portal using QnA Maker and Storage Accounts.",
    image: "images/experience/future.png",
    link: "https://github.com/github/india/discussions/125",
    certificate: "certificates/files/externship-future-ready.pdf",
  },
  {
    role: "Project Admin & Mentor",
    organization: "Let's Grow More — Summer of Code",
    type: "Open Source",
    period: "Jun 2021 — Aug 2021",
    description:
      "Mentored newcomers in Git, GitHub, and web development across 4 open-sourced projects — 150+ issues resolved and 300+ PRs merged in two months.",
    image: "images/experience/lgm.png",
    link: "https://letsgrowmore.in/soc/",
    certificate: "certificates/files/externship-lgm-project-admin.pdf",
  },
  {
    role: "Machine Learning Intern",
    organization: "Elite Techno Groups",
    type: "Externship",
    period: "Aug 2021 — Sep 2021",
    description:
      "Selected from 25,000 applicants (Skill India). Built a Python Inventory Management System and analyzed the Summer Olympics dataset with Python's data libraries.",
    image: "images/experience/ETG.jpg",
    link: "https://unstop.com/college-fests/summer-internship-elite-techno-groups-4541",
    certificate: "certificates/files/externship-elite-techno-internship.pdf",
  },
  {
    role: "Campus Ambassador",
    organization: "Bosch Global Software Technologies",
    type: "Ambassador",
    period: "Jul 2021 — Present",
    description:
      "Campus representative for Bosch Global Software Technologies — a Robert Bosch subsidiary and leading global provider of engineering, IT & business solutions.",
    image: "images/experience/bosch.jpg",
    link: "https://www.bosch-india-software.com/en/",
  },
  {
    role: "Web Development Pioneer",
    organization: "Google Developer Student Club — LPU",
    type: "Community",
    period: "Aug 2021 — Present",
    description:
      "Web Development pioneer at GDSC-LPU, a Google-backed student developer community — built projects and drove peer-to-peer learning.",
    image: "images/experience/GDSC.png",
    link: "https://www.linkedin.com/company/gdsclpu/",
  },
  {
    role: "Machine Learning Intern",
    organization: "Internship Studio",
    type: "Externship",
    period: "Jun 2021 — Jul 2021",
    description:
      "Built ML regression models to predict YouTube ad-view counts, using Python libraries to clean, visualize, and normalize the data.",
    image: "images/experience/internstudio.png",
    link: "https://internshipstudio.com/",
    certificate: "certificates/files/externship-intern-studio-ml-intern.pdf",
  },
  {
    role: "Program Admin & Mentor",
    organization: "DevIncept Codes",
    type: "Open Source",
    period: "Jul 2021 — Aug 2021",
    description:
      "Program admin & mentor across 4 projects in a 30-day contribution drive, onboarding hundreds of new contributors to open source.",
    image: "images/experience/devincept.jpg",
    link: "https://www.linkedin.com/company/devincept/",
    certificate: "certificates/files/externship-devincept-program-admin.png",
  },
  {
    role: "Frontend Developer Intern",
    organization: "Suven Consultants & Technology",
    type: "Externship",
    period: "Dec 2020",
    description:
      "Designed and built 4 responsive, user-friendly websites with HTML, CSS, JavaScript & Bootstrap in a one-month program.",
    image: "images/experience/suven.jpg",
    link: "https://suvenconsultants.com/",
    certificate: "certificates/files/externship-suven-web-internship.pdf",
  },
  {
    role: "Open Source Contributor",
    organization: "Cross Winter of Code",
    type: "Open Source",
    period: "Feb 2021 — Mar 2021",
    description:
      "Top-30 contributor — fixed bugs and shipped enhancements across several open-source projects with mentor guidance.",
    image: "images/experience/cross.jpg",
    link: "https://www.linkedin.com/company/crosswoc-cross-winter-of-code/",
  },
  {
    role: "Android App Development Intern",
    organization: "The Sparks Foundation",
    type: "Externship",
    period: "Mar 2021",
    description:
      "Built a demo bank-payments Android app for managing accounts and making payments, learning core app-development skills.",
    image: "images/experience/spark.png",
    link: "https://www.linkedin.com/company/the-sparks-foundation/",
    certificate: "certificates/files/externship-sparksintern.png",
  },
  {
    role: "Web Designing Intern",
    organization: "Internship Studio",
    type: "Externship",
    period: "Jun 2020 — Jul 2020",
    description:
      "Designed 5–6 mini websites with HTML, CSS & JavaScript, including a responsive e-commerce concept with clean structure and navigation.",
    image: "images/experience/studio.png",
    link: "https://internshipstudio.com/",
    certificate:
      "certificates/files/externship-internship-studio-web-intern.pdf",
  },
  {
    role: "Campus Ambassador",
    organization: "National Engineering Olympiad",
    type: "Ambassador",
    period: "Jan 2021 — May 2021",
    description:
      "Top-10 campus ambassador — drove NEO 4.0 & 5.0 awareness, guided registrations, and ran social-media outreach.",
    image: "images/experience/NEO.png",
    link: "https://nationalolympiad.org/?refid=1792601",
    certificate: "certificates/files/externship-neo-ambassador.pdf",
  },
  {
    role: "Community Influencer",
    organization: "UnSchool",
    type: "Ambassador",
    period: "Jul 2020 — Aug 2020",
    description:
      "Ran social-media brand campaigns that lifted product sales ~10% while learning digital marketing.",
    image: "images/experience/unschool.png",
    link: "https://www.unschool.in/",
  },
  {
    role: "Event Coordinator",
    organization: "MegaMinds Student Organization",
    type: "Community",
    period: "Aug 2019 — Present",
    description:
      "Planned tech workshops, seminars & social events as event manager, anchor, and marketing head — leading teams of 25+.",
    image: "images/experience/mega.jpg",
    link: "https://www.instagram.com/megaminds_org/",
  },
  {
    role: "Event Manager",
    organization: "ClubTwenty Student Organization",
    type: "Community",
    period: "Aug 2019 — Aug 2021",
    description:
      "Organized marathons, sports fests & charity events; as sales lead, drove 35% of sales for the flagship GlowRun Electrica 2k19.",
    image: "images/experience/club.jpg",
    link: "https://www.linkedin.com/company/clubtwentyorg/",
  },
  {
    role: "Marketing Coordinator",
    organization: "Spade Student Organization",
    type: "Community",
    period: "Aug 2019 — Mar 2020",
    description:
      "Coordinated multi-domain events (tech, art, culture) and led promotions, closing several sponsorship deals.",
    image: "images/experience/spade.png",
    link: "https://www.linkedin.com/company/spadelpu/",
  },
];

export const projects: ProjectItem[] = [
  {
    title: "Wedding Invitation",
    blurb:
      "An elegant animated wedding invitation with a live countdown & RSVP.",
    description:
      "An elegant, animated wedding invitation site featuring a live countdown, RSVP, add-to-calendar, and WhatsApp sharing.",
    image: "images/projects/wedding.jpg",
    link: "https://qazimaazarshad.github.io/Wedding-Invitation/",
    date: "Jan 2026",
    category: "Web",
    tech: ["HTML", "CSS", "JavaScript"],
  },
  {
    title: "Teen Patti Chip Tracker",
    blurb: "A chip & pot tracker for the Teen Patti card game.",
    description:
      "A browser app to run a Teen Patti session — set up players and chips, track the pot and bets each round, and record the winner.",
    image: "images/projects/teen-patti.jpg",
    link: "https://qazimaazarshad.github.io/Teen-Patti-Money-Tracker/",
    date: "Dec 2025",
    category: "App",
    tech: ["JavaScript", "HTML", "CSS"],
  },
  {
    title: "Informatica Internship Showcase",
    blurb:
      "A glimpse of my internship contributions at Informatica, built with React.",
    description:
      "A React application showcasing the UI work and contributions I made during my internship at Informatica.",
    image: "images/projects/infa-work.png",
    link: "https://qazimaazarshad.github.io/Infa-Intern/",
    date: "Jun 2023",
    category: "Web",
    tech: ["React", "JavaScript", "CSS"],
  },
  {
    title: "Movie Streaming Website",
    blurb: "Stream movies, web series, and TV shows across genres.",
    description:
      "A streaming website that lets users browse and watch movies, web series, and TV shows of different genres.",
    image: "images/projects/movie.jpg",
    link: "https://qazimaazarshad.github.io/Movie-Streaming-Website/",
    date: "Aug 2022",
    category: "Web",
    tech: ["HTML", "CSS", "JavaScript"],
  },
  {
    title: "Voters Registration Portal",
    blurb: "A demo of the National Voters Service Portal application form.",
    description:
      "A demo of the National Voters Service Portal, built during the Microsoft Future Ready Talent program using Azure services.",
    image: "images/projects/vote.jpg",
    link: "https://qazimaazarshad.github.io/Voters-Registration-Portal-Future-Ready/",
    date: "Jul 2022",
    category: "Web",
    tech: ["HTML", "CSS", "Azure"],
  },
  {
    title: "Olympics Excel Dashboard",
    blurb:
      "Interactive dashboard highlighting facts, records, and trends in Olympic history.",
    description:
      "An Excel dashboard that explains and highlights key facts, records, and trends across the history of the Olympics.",
    image: "images/projects/dashboard.jpg",
    link: "https://github.com/QAZIMAAZARSHAD/Excel-Dashboard-Olympics-Statistics",
    date: "Nov 2021",
    category: "Data",
    tech: ["Excel", "Data Viz"],
  },
  {
    title: "YouTube Ad-view Prediction",
    blurb: "Regression models predicting ad-view counts from YouTube metrics.",
    description:
      "Trained and compared multiple regression models to predict YouTube ad-view counts based on other YouTube metrics.",
    image: "images/projects/youtube.png",
    link: "https://github.com/QAZIMAAZARSHAD/Youtube-Adview-Prediction",
    date: "Jun 2021",
    category: "Machine Learning",
    tech: ["Python", "scikit-learn", "Pandas"],
  },
  {
    title: "Olympics Data Analysis",
    blurb: "Exploratory analysis of a Summer Olympics dataset in Python.",
    description:
      "Performed data analysis on a Summer Olympics dataset using Python libraries Pandas, NumPy, and Matplotlib.",
    image: "images/projects/olympics.jpg",
    link: "https://github.com/QAZIMAAZARSHAD/Olympics-Data-Analysis",
    date: "Sep 2021",
    category: "Data",
    tech: ["Python", "Pandas", "NumPy", "Matplotlib"],
  },
  {
    title: "Apna Bank App",
    blurb: "A bank payments app to make payments and manage accounts.",
    description:
      "An Android bank-payments app demo that allows users to make payments and manage their accounts.",
    image: "images/projects/bank.jpg",
    link: "https://youtu.be/D6DnoR1CcrE",
    date: "Mar 2021",
    category: "Mobile",
    tech: ["Android", "Java"],
  },
  {
    title: "Movies Database Analysis",
    blurb: "Data analysis on a movies dataset with SQL.",
    description:
      "Performed data analysis on a movies dataset using SQL and MySQL Workbench.",
    image: "images/projects/film.png",
    link: "https://github.com/QAZIMAAZARSHAD/Movies-Database-Data-Analysis",
    date: "Oct 2021",
    category: "Data",
    tech: ["SQL", "MySQL"],
  },
  {
    title: "Inventory Management System",
    blurb:
      "A NoSQL inventory system for a general store using a JSON file store.",
    description:
      "An inventory management system for a general store, backed by a NoSQL-style JSON file system.",
    image: "images/projects/inventory.jpg",
    link: "https://github.com/QAZIMAAZARSHAD/Inventory-Management-System",
    date: "Sep 2021",
    category: "App",
    tech: ["Python", "JSON"],
  },
  {
    title: "Portfolio (v1)",
    blurb: "The original portfolio — connect, contact, and learn about me.",
    description:
      "The first version of my portfolio website, for anyone who wants to connect, contact, and learn about me.",
    image: "images/projects/web.jpg",
    link: "https://qazimaazarshad.github.io/My-Portfolio/",
    date: "Jan 2021",
    category: "Web",
    tech: ["HTML", "CSS", "jQuery"],
  },
  {
    title: "Income Tax Calculator",
    blurb: "A GUI app computing income tax for a salaried Indian citizen.",
    description:
      "A GUI application that calculates the liable income tax of a salaried Indian citizen.",
    image: "images/projects/tax.gif",
    link: "https://github.com/QAZIMAAZARSHAD/Income-Tax-Calcultor",
    date: "Oct 2020",
    category: "App",
    tech: ["Python", "Tkinter"],
  },
  {
    title: "Bank Management System",
    blurb: "Manage individual bank accounts with SQL and Python.",
    description:
      "An application built with SQL and Python that manages individuals' bank accounts.",
    image: "images/projects/bms.png",
    link: "https://github.com/QAZIMAAZARSHAD/Bank-Management-System",
    date: "Jul 2021",
    category: "App",
    tech: ["Python", "SQL"],
  },
  {
    title: "Apni Dukaan",
    blurb: "An e-commerce site with a wide range of products.",
    description:
      "An e-commerce website letting users browse and buy from a wide range of products.",
    image: "images/projects/dukaan.jpg",
    link: "https://qazimaazarshad.github.io/Apni-Dukaan/",
    date: "Jul 2020",
    category: "Web",
    tech: ["HTML", "CSS", "JavaScript"],
  },
  {
    title: "Portfolio APK",
    blurb: "An Android wrapper that opens my portfolio website.",
    description:
      "An APK version of my portfolio website — an Android application that takes users directly to the site.",
    image: "images/projects/M.jpg",
    link: "https://github.com/QAZIMAAZARSHAD/MyApp",
    date: "Feb 2021",
    category: "Mobile",
    tech: ["Android"],
  },
  {
    title: "Database Collection",
    blurb: "A curated collection of relational databases.",
    description: "A project containing a collection of relational databases.",
    image: "images/projects/database.jpg",
    link: "https://github.com/QAZIMAAZARSHAD/Database",
    date: "Jul 2021",
    category: "Data",
    tech: ["SQL"],
  },
  {
    title: "Blackjack Game",
    blurb: "A fun Blackjack card game built with JavaScript.",
    description:
      "A fun browser-based Blackjack card game created using JavaScript.",
    image: "images/projects/cards.jpg",
    link: "https://qazimaazarshad.github.io/Blackjack-Game/",
    date: "Apr 2022",
    category: "Game",
    tech: ["JavaScript"],
  },
  {
    title: "Running Car Game",
    blurb: "A fun car-racing game designed with JavaScript.",
    description: "A fun car racing game designed using JavaScript.",
    image: "images/projects/car.jpg",
    link: "https://qazimaazarshad.github.io/Running-Car/",
    date: "Apr 2021",
    category: "Game",
    tech: ["JavaScript"],
  },
  {
    title: "Kung Fu House",
    blurb: "A JavaScript fighting game.",
    description: "A browser fighting game built with JavaScript.",
    image: "images/projects/kungfu.jpg",
    link: "https://qazimaazarshad.github.io/Kung-Fu-House/",
    date: "May 2021",
    category: "Game",
    tech: ["JavaScript"],
  },
  {
    title: "Apna Ghar",
    blurb: "A real-estate site to buy or rent property in India.",
    description:
      "A real-estate website that lets users buy or rent property across India.",
    image: "images/projects/ghar.jpg",
    link: "https://qazimaazarshad.github.io/Apna-Ghar/",
    date: "Apr 2020",
    category: "Web",
    tech: ["HTML", "CSS", "JavaScript"],
  },
  {
    title: "Counter App",
    blurb: "A mini JavaScript app that counts clicks.",
    description:
      "A mini JavaScript application that counts the number of clicks.",
    image: "images/projects/count.png",
    link: "https://qazimaazarshad.github.io/Counter-App/",
    date: "Apr 2022",
    category: "App",
    tech: ["JavaScript"],
  },
  {
    title: "Light Bulb On/Off",
    blurb: "A JavaScript game lighting up 5 bulbs on a switch.",
    description:
      "A JavaScript game in which five light bulbs light up simultaneously when the switch is clicked.",
    image: "images/projects/bulb.jpg",
    link: "https://github.com/QAZIMAAZARSHAD/Bulb-On-Off",
    date: "Apr 2021",
    category: "Game",
    tech: ["JavaScript"],
  },
];

export const projectCategories: (ProjectCategory | "All")[] = [
  "All",
  "Web",
  "Data",
  "Machine Learning",
  "Game",
  "Mobile",
  "App",
];

export const skillGroups: SkillGroup[] = [
  {
    name: "Languages",
    icon: "Code2",
    skills: ["Java", "TypeScript", "JavaScript", "Python", "SQL", "C++"],
  },
  {
    name: "Backend",
    icon: "Server",
    skills: [
      "Spring Boot",
      "Microservices",
      "REST APIs",
      "BFF Layers",
      "MySQL",
      "DBMS",
    ],
  },
  {
    name: "Frontend",
    icon: "LayoutDashboard",
    skills: ["React", "HTML", "CSS", "Bootstrap"],
  },
  {
    name: "Quality & Delivery",
    icon: "ShieldCheck",
    skills: [
      "Shift-Left Quality",
      "Test Automation",
      "Unit & E2E Testing",
      "CI/CD",
      "Release Stability",
    ],
  },
  {
    name: "AI-Assisted Engineering",
    icon: "Sparkles",
    skills: ["Cursor AI", "Anthropic Claude", "Prompt Engineering"],
  },
  {
    name: "Foundations",
    icon: "Binary",
    skills: [
      "Data Structures & Algorithms",
      "Object-Oriented Programming",
      "System Design",
      "Problem Solving",
    ],
  },
  {
    name: "Tools & Platforms",
    icon: "Wrench",
    skills: ["Git", "GitHub", "Bitbucket", "Jira", "Microsoft Azure"],
  },
];

export const achievements: string[] = [
  "Gold Medal — International Humanity Olympiad",
  "All India Rank 49 — National Engineering Olympiad",
  "1st Prize — Inter-School Quiz (District Level)",
  "1st Prize — Science Exhibition (School Level)",
  "1st Prize — Quizzora Quiz Competition (University Level)",
  "2nd Prize — University-Level Quiz",
  "2nd Prize — Technical Quiz (University Level)",
  "3rd Prize — Quiz Competition (University Level)",
  "3rd Prize — District Talent Search Examination",
  "3rd Prize — Literary Championship Quiz (University Level)",
  "Winner — Badminton Championship (School Level)",
];

/**
 * Optional link attached to an achievement, opened when the card is clicked:
 * - `image` shows a plain image (no download) in the lightbox,
 * - `certificateId` adds that certificate (with download) in the lightbox,
 *   and can be combined with `image` to show both in a small gallery,
 * - `href` opens an external profile/page in a new tab.
 */
export interface AchievementLink {
  certificateId?: string;
  image?: string;
  href?: string;
}

export const achievementLinks: Record<string, AchievementLink> = {
  "Gold Medal — International Humanity Olympiad": {
    image: "images/awards/iho.jpg",
    certificateId: "achievement-humanity-olympiad",
  },
  "All India Rank 49 — National Engineering Olympiad": {
    certificateId: "achievement-neo-excellence",
  },
  "1st Prize — Quizzora Quiz Competition (University Level)": {
    certificateId: "achievement-quizzora-1st",
  },
  "2nd Prize — University-Level Quiz": {
    certificateId: "achievement-quiz-da-hunt-2nd",
  },
  "2nd Prize — Technical Quiz (University Level)": {
    certificateId: "achievement-tech-quiz-2nd",
  },
  "3rd Prize — Literary Championship Quiz (University Level)": {
    certificateId: "achievement-ojaswi-quiz-3rd",
  },
};

export const hobbies: string[] = [
  "Movies",
  "Web Series",
  "Anime",
  "Music",
  "Pro Wrestling (WWE)",
  "Cricket",
  "Badminton",
  "Cards",
  "Video Games",
  "Quizzing",
  "Gym",
  "Food",
  "Swimming",
];
