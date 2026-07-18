<div align="center">

# Qazi Maaz Arshad — Portfolio

**Software Engineer @ Salesforce · Full-stack, AI-first**

[![Live](https://img.shields.io/badge/Live-qazimaazarshad.github.io-4f46e5?style=for-the-badge)](https://qazimaazarshad.github.io/)
&nbsp;
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/qazimaazarshad/)

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-build-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-animation-0055FF?logo=framer&logoColor=white)
![Tests](https://img.shields.io/badge/tests-37_unit_·_29_e2e-16a34a)

<br/>

<a href="https://qazimaazarshad.github.io/">
  <img src="docs/preview.png" alt="Portfolio preview" width="820" />
</a>

</div>

---

A modern, interactive personal portfolio — designed and built from the ground up as a
typed, component-driven single-page app, then hardened with a full unit / e2e / visual /
responsiveness test suite.

**Live:** https://qazimaazarshad.github.io/

## ✨ Highlights

- **Animated canvas** particle constellation + aurora backdrop that reacts to the cursor
- **Interactive projects gallery** — searchable, category-filterable, with detail modals (focus-trapped & accessible)
- **Scroll-reveal** animations, scroll progress bar, active-section nav tracking, 3D tilt cards, glassmorphism UI
- **Fancy preloader**, custom favicon, and a polished dark theme (violet → cyan)
- **Fully responsive** (verified across 7 viewports) and **accessible** — keyboard-navigable, `prefers-reduced-motion` aware
- **100% data-driven** — all content lives in one typed source (`src/data/content.ts`)

## 🛠 Tech stack

| Area | Tools |
|---|---|
| Framework | **React 19** + **TypeScript** (strict) |
| Build | **Vite** |
| Styling | **Tailwind CSS** (custom design tokens) |
| Animation | **Framer Motion** |
| Icons | lucide-react + react-icons |
| Testing | **Vitest** + React Testing Library · **Playwright** (e2e, visual, responsive) |

## 🚀 Getting started

```bash
npm install
npm run dev        # start the Vite dev server
npm run build      # type-check + production build → dist/
npm run preview    # preview the production build
```

## 🧪 Testing

```bash
npm test                 # unit + component tests (Vitest)
npm run test:coverage    # unit tests with coverage
npm run test:e2e         # e2e, visual & responsiveness tests (Playwright)
npm run test:e2e:update  # regenerate visual baselines
```

## 📁 Structure

```
src/
  data/content.ts     # single source of truth for all content (typed)
  lib/                # utils (cn, asset), motion variants
  hooks/              # useActiveSection
  components/
    ui/               # Section, SectionHeading, Reveal, TiltCard, SocialLinks
    effects/          # AnimatedBackground, ScrollProgress, Preloader
    …                 # hero / projects / skills / timeline / …
  sections/           # Navbar, Hero, About, Experience, Projects, Skills, …
  App.tsx             # composition root
e2e/                  # Playwright specs + visual baselines
public/               # images, resume, static assets
```

## ✍️ Editing content

Everything — profile, experience, projects, skills, education, achievements — lives in
`src/data/content.ts`. Update the data and the UI updates automatically; no markup changes needed.

## 📦 Deployment

Deployed to **GitHub Pages** (user site) from the `gh-pages` branch:

```bash
npm run build
npx gh-pages -d dist
```

## 📫 Connect

[Portfolio](https://qazimaazarshad.github.io/) ·
[LinkedIn](https://www.linkedin.com/in/qazimaazarshad/) ·
[GitHub](https://github.com/QAZIMAAZARSHAD) ·
[LeetCode](https://leetcode.com/qazimaazarshad/)

## 📄 License

[MIT](LICENSE)
