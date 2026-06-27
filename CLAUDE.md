# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # Type-check + Vite build + generate SEO pages (post-build script)
npm run preview      # Serve production build locally
npm run lint         # ESLint
npm run cms:proxy    # Start Decap local backend (run alongside dev for blog editing)
npm run a11y         # Build then run axe-core accessibility audit via Playwright
npm run ttr:snapshot # Scrape TTR rugby data and write JSON snapshots to public/data/ttr/
npm run ttr:snapshot:dry  # Same, but prints to stdout without writing
npm run og:image     # Generate public/og-image.png via Playwright
npm run cv:pdf       # Build + render /cv?pdf=1 + export PDF via Playwright
```

No test suite. Playwright is used only for the scripts above (OG image, CV PDF, a11y audit).

## Architecture

**Single-page app** (React 19 + Vite 8 + TypeScript + Tailwind CSS v4) deployed to Vercel. All routes are lazy-loaded via React Router 7 and fall back to `index.html` via `vercel.json` rewrites.

### Content is data-driven from `src/data/`

| File | What it drives |
|---|---|
| `src/data/projects.ts` | Project cards, case study content, gallery, accent colours |
| `src/data/labs.ts` | Lab experiment registry (slug, path, layout, case study) |
| `src/data/cv.ts` | CV profile, experience, education |
| `src/data/posts.ts` | Blog loader — uses `import.meta.glob` to parse `src/content/blog/*.md` at build time |

Blog posts are Markdown files in `src/content/blog/`. `posts.ts` contains a hand-rolled frontmatter parser (no external library). Posts with `status: hidden` or `draft: true` are excluded from public routes.

### Key shared types

All types live in `src/types/index.ts`: `Project`, `LabExperiment`, `BlogPost`, `CVProfile`, and their nested interfaces.

### Lab experiments

`src/labs/` contains full-page interactive experiments (`F1Dashboard.tsx`, `TTRDashboard.tsx`, `Gravity.tsx`). They are registered in `src/data/labs.ts` with a `slug` and `path`, then routed via `LabExperiment.tsx`. The `/ttr` and `/f1` shortcuts use `slugOverride` props on the route.

### Vercel API function

`api/ttr.ts` is a Vercel Serverless Function that proxies the TTR rugby upstream API (which has no public API — it's reverse-engineered HTML scraping). It parses standings, fixtures, and team profiles from HTML responses. The dev server proxies `/api` to `localhost:3000` via `vite.config.ts`.

### TTR data snapshots

`scripts/snapshot-ttr.mjs` scrapes all 6 Newcastle leagues and writes dated JSON to `public/data/ttr/season-{id}/`. A GitHub Action runs this every Monday at 08:00 UTC and commits any new data. The `latest.json` and `index.json` files in each season directory allow the frontend to discover snapshot history without hitting the live API.

### Theme

Dark/light theme is managed via `src/contexts/ThemeContext.tsx` and stored in `localStorage` under the key `theme`.

### Build pipeline

`npm run build` runs `tsc -b && vite build && node scripts/generate-seo-pages.mjs`. The post-build script generates pre-rendered HTML shells for SEO. The Vite config manually chunks vendor deps (framer-motion, gsap, react-icons, react/react-dom/react-router) into separate bundles.

## Content editing

- **Projects**: edit `src/data/projects.ts` — each entry has `caseStudy`, `gallery`, `stats`, and accent colour fields
- **Blog posts**: add/edit `.md` files in `src/content/blog/` (or use Decap CMS at `/admin` locally)
- **Labs**: register new experiments in `src/data/labs.ts`, create the component in `src/labs/`, add a route in `src/App.tsx`
- **CV**: edit `src/data/cv.ts`

## Environment variables

```bash
VITE_FORMSPREE_FORM_ID=your_form_id  # Optional — falls back to mailto: if unset
```
