# Product

## Register

brand

## Users

Two audiences, one page:
- Hiring managers at product companies evaluating Alex as a candidate — scanning fast, judging craft and taste as much as the project list.
- Startup founders considering Alex for freelance/studio work — judging whether the work quality on display is the work quality they'd get.

Both are visiting a personal portfolio where the design of the page IS a work sample. It has to hold up as proof of craft, not just describe craft in words.

## Product Purpose

A personal portfolio for Alex Waddell (full-stack engineer, engineering mentor, Newcastle UK). Exists to get him hired or hired-as-a-contractor by demonstrating technical and design craft directly, not just listing it. Success: a visitor remembers the page itself, not just the project list.

## Brand Personality

Curious, craft-obsessed, playful. Playfulness lives in details and easter eggs (Konami code, name-click glitch, theme streak), not in tacked-on decoration across the whole layout.

Direction (confirmed 2026-07-01): kinetic long-scroll narrative. Awwards-caliber, choreographed type reveals, scroll-driven pacing, cursor-reactive interaction, one dominant idea per fold. Color strategy: full palette (3-4 named colors, each with a deliberate role) — a real escalation past the previous restrained blue/violet/pink trio. Primary theme is dark, fully art-directed; light mode is a simpler coherent secondary mode, not equally elaborate. Existing easter eggs (Konami code, hero-name click glitch, theme streak) are preserved as intentional personality, not removed.

## Anti-references

Generic dev-portfolio template feel: centered hero stack, cycling role text, icon-above-heading card grids, identical project cards.

AI-generated design pitfalls, confirmed present in the current implementation and explicitly what triggered this redesign: gradient-clipped text used decoratively (name, nav wordmark, section headings), three decorative blur/glow orbs, generic blue-violet-indigo accent trio, shimmer/sheen sweep on buttons, glassmorphism toast/backdrop-blur usage, Inter as the body font.

Also avoid, per brand-register guidance: defaulting into editorial-magazine aesthetics (italic display serif + ruled columns + mono labels) as a substitute for genuine artistic direction — that lane is currently saturated and wasn't the direction chosen here (kinetic long-scroll was).

## Design Principles

- Show, don't tell: the page's own craft is the pitch, not copy claiming craft.
- Earn every element: no decoration that isn't load-bearing for meaning or narrative pacing.
- Personality lives in details, not layout: easter eggs and micro-moments carry playfulness; the structural layout stays intentional and confident.
- Both audiences find their signal fast: a hiring manager and a founder should both get what they need without decoding a gimmick.
- The bar is Alex's own work: reference quality is his best project case studies, not generic SaaS marketing pages.

## Accessibility & Inclusion

Respect `prefers-reduced-motion` throughout (the existing codebase already gates several animations behind it — extend this pattern to all new scroll-driven and choreographed motion). Maintain WCAG AA contrast on whichever colors carry the full-palette strategy, especially body text and interactive states. Keep all interactive elements keyboard-reachable with visible focus states (existing `:focus-visible` patterns should carry forward).
