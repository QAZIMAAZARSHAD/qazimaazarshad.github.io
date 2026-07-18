/**
 * Single source of truth for all portfolio content.
 * Extracted and preserved from the original site, restructured and typed.
 * Every section component reads from here — no content is hard-coded in views.
 */

/* ----------------------------- Types ----------------------------- */

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

/* ----------------------------- Profile ----------------------------- */

export const profile = {
  name: "Qazi Maaz Arshad",
  firstName: "Maaz",
  role: "Software Engineer",
  company: "Salesforce",
  location: "Bengaluru, India",
  tagline: "I build reliable, enterprise-scale software — end to end.",
  headline: "Full-stack engineer shipping enterprise-scale products",
  intro:
    "Software Engineer with 4 years of experience building enterprise-scale products — now at Salesforce, working AI-first. I pair deep full-stack ownership with agentic development: orchestrating AI coding agents to plan, build, test, and review in parallel, so large, complex work ships faster without trading away quality.",
  about: [
    "AI-first engineer: I orchestrate coding agents (Cursor, Anthropic Claude) as a team — decomposing work, running agents in parallel, and delegating well-scoped tasks while I steer architecture and review.",
    "Turn AI leverage into shipped software — driving epics and refactors end-to-end across backend, BFF, and UI, and hardening them with automated unit, E2E, and visual tests generated alongside the code.",
    "Trusted for complex cross-layer debugging and time-sensitive blockers — using AI to move fast, but owning correctness, maintainability, and zero-regression releases.",
    "Fluent across Java, Spring Boot, React, and TypeScript in large, multi-service codebases — and in the prompt-engineering and automation that multiply their impact.",
  ],
  email: "qazimaazarshad@gmail.com",
  resume: "resume/Qazi_Maaz_Arshad_Resume.pdf",
  avatar: "images/instagram/maaz.jpg",
} as const;

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
    href: "https://www.facebook.com/qazimaaz.arshad.3",
  },
  {
    id: "linktree",
    label: "Linktree",
    href: "https://linktr.ee/qazimaazarshad",
  },
  { id: "email", label: "Email", href: "mailto:qazimaazarshad@gmail.com" },
];

export const stats: Stat[] = [
  { label: "Years of experience", value: "4+" },
  { label: "Backend · BFF · UI ownership", value: "Full-stack" },
  { label: "Agentic development workflows", value: "AI-native" },
  { label: "Orchestrating AI agent teams", value: "Agent teams" },
];

/* ----------------------------- Navigation ----------------------------- */

export const navSections = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "earlier", label: "Foundations" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "achievements", label: "Achievements" },
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

/* ----------------------------- Education ----------------------------- */

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
    link: "https://barrowsschool.in/",
  },
  {
    degree: "High School (Class X)",
    institution: "Barrows Blue Bells, School",
    score: "86.33%",
    period: "2016",
    image: "images/education/bbb.jpg",
    link: "https://barrowsschool.in/",
  },
];

/* ----------------------------- Experience ----------------------------- */

export const experience: ExperienceItem[] = [
  {
    role: "Associate Member of Technical Staff",
    organization: "Salesforce",
    type: "Full-time",
    period: "Mar 2026 — Present",
    current: true,
    description:
      "Full-stack engineer on the R&D MDM Informatica team, building enterprise-scale master data management. I work AI-first — orchestrating coding agents to ship epics and refactors end-to-end across APIs, metadata flows, and UI with Java, Spring Boot, React & TypeScript — and I'm the go-to for cross-layer debugging and unblocking time-sensitive releases.",
    image: "images/experience/salesforce.png",
    link: "https://www.salesforce.com/",
  },
  {
    role: "Software Engineer",
    organization: "Informatica",
    type: "Full-time",
    period: "Aug 2022 — Mar 2026",
    description:
      "Built UI features and components with React on Informatica MDM.next and streamlined backend services with Java & Spring Boot — delivering features, bug fixes, and user stories across the stack. Informatica joined Salesforce via acquisition.",
    image: "images/experience/infa.png",
    link: "https://www.informatica.com/",
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
    type: "Internship",
    period: "Oct 2021 — Dec 2021",
    description:
      "Completed Microsoft's Future Ready Talent program (with GitHub, Future Skills Prime, Quess, EY). Learned in-demand Azure cloud & security skills and built a Voters Registration Portal using Azure services like QnA Maker and Storage Accounts.",
    image: "images/experience/future.png",
    link: "https://futurereadytalent.in/",
  },
  {
    role: "Project Admin & Mentor",
    organization: "Let's Grow More — Summer of Code",
    type: "Open Source",
    period: "Jun 2021 — Aug 2021",
    description:
      "Introduced newcomers to open source and trained them on Git, GitHub, and web development. Open-sourced 4 projects — 150+ issues resolved and 300+ pull requests merged in two months.",
    image: "images/experience/lgm.png",
  },
  {
    role: "Machine Learning Intern",
    organization: "Elite Techno Groups",
    type: "Internship",
    period: "Aug 2021 — Sep 2021",
    description:
      "Earned a spot among 25,000 applicants for the Skill India Internship. Worked with Python and its data libraries on projects including an Inventory Management System and data analysis on the Summer Olympics dataset.",
    image: "images/experience/ETG.jpg",
    link: "https://www.elitetechnogroups.com/",
  },
  {
    role: "Campus Ambassador",
    organization: "Bosch Global Software Technologies",
    type: "Ambassador",
    period: "Jul 2021 — Present",
    description:
      "Represented Bosch Global Software Technologies — a wholly owned subsidiary of Robert Bosch GmbH and a leading global supplier of end-to-end engineering, IT, and business solutions.",
    image: "images/experience/bosch.jpg",
    link: "https://www.bosch-india-software.com/en/",
  },
  {
    role: "Web Development Pioneer",
    organization: "Google Developer Student Club — LPU",
    type: "Community",
    period: "Aug 2021 — Present",
    description:
      "Pioneer on the Web Development team of GDSC-LPU, a university community for students interested in Google developer technologies — a platform to build, showcase skills, and grow.",
    image: "images/experience/GDSC.png",
  },
  {
    role: "Machine Learning Intern",
    organization: "Internship Studio",
    type: "Internship",
    period: "Jun 2021 — Jul 2021",
    description:
      "Built ML regression models to predict YouTube ad-view counts from other metrics. Used multiple Python libraries to clean, visualize, and normalize the dataset.",
    image: "images/experience/internstudio.png",
    link: "https://internshipstudio.com/",
  },
  {
    role: "Program Admin & Mentor",
    organization: "DevIncept Codes",
    type: "Open Source",
    period: "Jul 2021 — Aug 2021",
    description:
      "Program admin and mentor for 4 projects — Apna Theatre, Apni Dukaan, Voters Registration Portal, and Income Tax Calculator — during a 30-day contribution program, onboarding hundreds of contributors to open source.",
    image: "images/experience/devincept.jpg",
  },
  {
    role: "Frontend Developer Intern",
    organization: "Suven Consultants & Technology",
    type: "Internship",
    period: "Dec 2020",
    description:
      "Designed and developed 4 responsive, user-friendly websites using HTML, CSS, JavaScript, and Bootstrap over a one-month internship.",
    image: "images/experience/suven.jpg",
    link: "https://suvenconsultants.com/",
  },
  {
    role: "Open Source Contributor",
    organization: "Cross Winter of Code",
    type: "Open Source",
    period: "Feb 2021 — Mar 2021",
    description:
      "Ranked among the top 30 contributors. Fixed bugs and shipped enhancements across several open-source projects while learning from mentors and fellow contributors.",
    image: "images/experience/cross.jpg",
    link: "https://crosswoc.ieeedtu.in/#",
  },
  {
    role: "Android App Development Intern",
    organization: "The Sparks Foundation",
    type: "Internship",
    period: "Mar 2021",
    description:
      "Built a demo bank-payments Android app allowing users to manage account details and make payments, while grasping core app-development skills.",
    image: "images/experience/spark.png",
    link: "https://www.thesparksfoundationsingapore.org/",
  },
  {
    role: "Web Designing Intern",
    organization: "Internship Studio",
    type: "Internship",
    period: "Jun 2020 — Jul 2020",
    description:
      "Created 5–6 mini website designs with HTML, CSS, and JavaScript, including an e-commerce site with improved structure, navigation, and responsiveness.",
    image: "images/experience/studio.png",
    link: "https://internshipstudio.com/",
  },
  {
    role: "Campus Ambassador",
    organization: "National Engineering Olympiad",
    type: "Ambassador",
    period: "Jan 2021 — May 2021",
    description:
      "Among the top 10 campus ambassadors of the batch. Spread awareness of NEO 4.0 & 5.0, guided peers through registration, and drove engagement through social media.",
    image: "images/experience/NEO.png",
    link: "https://nationalolympiad.org/?refid=1792601",
  },
  {
    role: "Community Influencer",
    organization: "UnSchool",
    type: "Internship",
    period: "Jul 2020 — Aug 2020",
    description:
      "Ran social media strategies for brand promotion and sales, contributing to a ~10% increase in product sales while learning digital marketing.",
    image: "images/experience/unschool.png",
    link: "https://www.unschool.in/",
  },
  {
    role: "Event Coordinator",
    organization: "MegaMinds Student Organization",
    type: "Leadership",
    period: "Aug 2019 — Present",
    description:
      "Planned and organized tech workshops, seminars, and social events — serving as event manager, anchor, and marketing head, leading teams of 25+ on multiple occasions.",
    image: "images/experience/mega.jpg",
    link: "https://www.instagram.com/megaminds_org/",
  },
  {
    role: "Event Manager",
    organization: "ClubTwenty Student Organization",
    type: "Leadership",
    period: "Aug 2019 — Aug 2021",
    description:
      "Organized marathons, sports fests, and charity events. As sales-team lead, drove a 35% sales contribution to the flagship event GlowRun Electrica 2k19.",
    image: "images/experience/club.jpg",
    link: "https://www.instagram.com/clubtwenty.in/?hl=en",
  },
  {
    role: "Marketing Coordinator",
    organization: "Spade Student Organization",
    type: "Leadership",
    period: "Aug 2019 — Mar 2020",
    description:
      "Coordinated events across education, technology, art, culture, and recreation. Led event promotions and closed several sponsorship deals.",
    image: "images/experience/spade.png",
    link: "https://www.spadelpu.com/",
  },
];

/* ----------------------------- Projects ----------------------------- */

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

/* ----------------------------- Skills ----------------------------- */

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

/* ----------------------------- Achievements ----------------------------- */

export const achievements: string[] = [
  "Gold Medal — International Humanity Olympiad",
  "All India Rank 49 — National Engineering Olympiad",
  "Rank 82 — Red Hat IT Aptitude Test, India 2021",
  "5-Star Problem Solver on HackerRank",
  "Solved 300+ coding problems on LeetCode",
  "1st Prize — Inter-School Quiz",
  "1st Prize — Science Exhibition",
  "1st Prize — Quizzora Quiz Competition",
  "2nd Prize — University-Level Quiz",
  "2nd Prize — Technical Quiz",
  "3rd Prize — Quiz Competition",
  "3rd Prize — District Talent Search Examination",
  "3rd Prize — Inter-School Literary Championship Quiz",
  "Winner — Badminton Championship",
];

/* ----------------------------- Hobbies ----------------------------- */

export const hobbies: string[] = [
  "Movies",
  "Web Series",
  "Anime",
  "Music",
  "Pro Wrestling (WWE)",
  "Cricket",
  "Badminton",
  "Chess",
  "Video Games",
  "Quizzing",
];
