# alexw.dev portfolio ✨

<p align="left">
	Personal portfolio and writing site built with React, TypeScript, Vite, and Tailwind CSS v4.
</p>

<p align="left">
	<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
	<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" />
	<img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
	<img alt="Tailwind CSS" src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
	<img alt="License" src="https://img.shields.io/badge/License-Private-8B5CF6" />
</p>

---

## Overview

This project powers **alexw.dev**: a multi-page portfolio experience with project case studies, blog posts, CV rendering/export, and a contact workflow.

### In this README

- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Environment variables](#environment-variables)
- [Routes](#routes)
- [Content editing](#content-editing)
- [Asset generation workflows](#asset-generation-workflows)
- [Notes](#notes)

---

## Tech stack

| Area | Tools |
|---|---|
| Core | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Motion | Framer Motion, GSAP |
| Routing | React Router 7 |
| Forms | Formspree (`@formspree/react`) with mailto fallback |
| Tooling | ESLint, Playwright, `@axe-core/playwright` |

---

## Quick start

### Prerequisites

- Node.js 20+
- npm
- Playwright Chromium (for PDF export, OG image, and accessibility scripts)
- `ffmpeg` (for favicon generation script only)

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build + preview

```bash
npm run build
npm run preview
```

> [!TIP]
> If Playwright browsers are missing:
>
> ```bash
> npx playwright install chromium
> ```

---

## Scripts

### NPM scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and create production build |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint across the repo |
| `npm run og:image` | Generate `public/og-image.png` |
| `npm run cv:pdf` | Build app, render `/cv?pdf=1`, export `alexander-waddell-cv.pdf` |
| `npm run a11y` | Build and run axe-core checks on preview output |

### Utility scripts (manual)

| Command | Purpose |
|---|---|
| `node scripts/generate-favicon.mjs` | Regenerate `public/favicon.ico` + PNG favicon sizes |

---

## Environment variables

Create a `.env` file at project root when needed:

```bash
VITE_FORMSPREE_FORM_ID=your_form_id_here
```

If `VITE_FORMSPREE_FORM_ID` is not set, the contact form opens the user's default mail client with a prefilled message.

---

## Routes

| Route | Description |
|---|---|
| `/` | Home page |
| `/projects` | All projects with category/tag filtering |
| `/projects/:slug` | Project case study detail |
| `/blog` | Blog index with tag filtering |
| `/blog/:slug` | Blog post detail |
| `/cv` | Browser CV view |
| `/lab` | Hidden experiments page |
| `*` | Custom 404 |

---

## Content editing

Most editable content is data-driven from `src/data`:

| File | Responsibility |
|---|---|
| `src/data/projects.ts` | Project cards, stats, and case study content |
| `src/data/posts.ts` | Blog metadata and post bodies |
| `src/data/cv.ts` | CV profile content and downloadable PDF filename/path |

Additional touchpoints:

- `src/components/Hero.tsx`
- `src/components/Mentorship.tsx`
- `src/components/IntroTimeline.tsx`
- `index.html` (SEO/social metadata)
- `public/robots.txt` and `public/sitemap.xml`

---

## Asset generation workflows

### Open Graph image

```bash
npm run og:image
```

Output: `public/og-image.png`

### CV PDF

```bash
npm run cv:pdf
```

Outputs:

- `dist/alexander-waddell-cv.pdf`
- `public/alexander-waddell-cv.pdf`

### Accessibility audit

```bash
npm run a11y
```

Scans with axe:

- Static routes: `/`, `/projects`, `/blog`
- Plus up to 3 discovered project detail routes and 3 discovered blog post routes

---

## Notes

- Theme state is stored in `localStorage` under `theme`.
- Intentional easter eggs exist (console helper + key-sequence overlay).
- The app is static-host friendly (Vercel, Netlify, GitHub Pages with SPA fallback config).
