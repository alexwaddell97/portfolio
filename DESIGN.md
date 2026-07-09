---
name: alexw.dev — Portfolio
description: Kinetic long-scroll portfolio for a craft-obsessed full-stack engineer; ink-black foundry-poster palette with an ember/volt/indigo full palette.
colors:
  home-ink: "oklch(14% 0.012 45)"
  home-ink-raised: "oklch(18% 0.014 45)"
  home-paper: "oklch(96% 0.01 80)"
  home-paper-dim: "oklch(70% 0.014 60)"
  home-ember: "oklch(62% 0.21 32)"
  home-volt: "oklch(87% 0.24 126)"
  home-indigo: "oklch(38% 0.16 292)"
  home-line: "oklch(96% 0.01 80 / 0.12)"
  legacy-ink: "#080810"
  legacy-card: "#12121f"
  legacy-text: "#e4e4e7"
  legacy-text-dim: "#a1a1aa"
  legacy-cyan: "#3b82f6"
  legacy-violet: "#818cf8"
  legacy-pink: "#93c5fd"
typography:
  display:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(3.2rem, 12vw, 9.5rem)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 4.2vw, 3rem)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  sharp: "2px"
  legacy-md: "8px"
  legacy-lg: "16px"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.home-ember}"
    textColor: "{colors.home-ink}"
    rounded: "{rounded.sharp}"
    padding: "0.9rem 1.75rem"
  button-primary-hover:
    backgroundColor: "{colors.home-volt}"
    textColor: "{colors.home-ink}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.home-paper}"
    rounded: "{rounded.sharp}"
    padding: "0.9rem 1.75rem"
  button-outline-hover:
    textColor: "{colors.home-paper}"
  input-field:
    backgroundColor: "{colors.home-ink-raised}"
    textColor: "{colors.home-paper}"
    rounded: "{rounded.sharp}"
    padding: "0.75rem 1rem"
  nav-active-pill:
    backgroundColor: "{colors.home-ember}"
    textColor: "{colors.home-ember}"
    rounded: "{rounded.full}"
---

# Design System: alexw.dev Portfolio

## 1. Overview

**Creative North Star: "The Foundry Proof"**

Ink-black stock, one hot flare color, one acid contrast, and a deep indigo held in reserve for shadow. The reference is a screen-printed gig poster or a foundry type-proof sheet, not a SaaS marketing page: high-contrast, deliberately printed-feeling, confident about negative space. The home page is a kinetic long-scroll narrative — one dominant idea per fold, choreographed reveals, cursor-reactive tilt — but the palette and type carry the "craft-obsessed" personality even when nothing is moving.

This system explicitly rejects the AI-generated pitfalls named in PRODUCT.md: gradient-clipped text used decoratively, three floating blur orbs, the generic blue-violet-indigo SaaS trio, glassmorphism, shimmer-sweep buttons, and Inter as a body font. It also rejects the editorial-magazine lane (italic display serif, ruled columns, mono kickers as the *entire* voice) as a substitute for genuine art direction — mono here is a small, functional wayfinding device (section index numbers), never the headline voice.

The site currently carries **two coexisting systems**: this one (the "home" system below) is the current, primary system and governs the home page. A **legacy system** (cyan/violet/pink, documented in §2 for completeness) still powers `/projects`, `/blog`, case studies, and the CV page, which have not yet been brought into the new system. Nav is shared chrome and deliberately splits the difference: its own accent (logo, active pill, CV button) now uses the home system's ember/volt everywhere, regardless of which page it sits on, while page content underneath keeps whichever system that page uses.

**Key Characteristics:**
- Ink-black stock (never true `#000`), one accent doing the talking, one doing the interaction, one held in reserve.
- Sharp, near-square geometry (2px radius) on every new-system button and image frame — a deliberate rejection of soft SaaS rounding.
- Mono numerals as wayfinding (`01`, `02`, `03`...), not as a personality costume.
- Flat by default. Depth comes from tone (`home-ink` vs `home-ink-raised`) and rule lines, not shadow.

## 2. Colors

Full-palette strategy: four named roles, each with exactly one job. No color is decorative-only; if a color appears, it's carrying either a surface, a body of text, or an action.

### Primary
- **Ember** (`oklch(62% 0.21 32)`, flare orange-red): the one color that means "act on this." Primary buttons, the nav logo mark, active nav pills, index numbers (`01`, `02`...), stat highlights. It never appears twice in the same fold doing two different jobs.

### Secondary
- **Volt** (`oklch(87% 0.24 126)`, acid lime): the interaction color. Hover states, focus rings, link underlines, the "Now" status dot. Volt only ever appears in response to a cursor or keyboard focus — it's the system's way of saying "this is live."

### Tertiary
- **Indigo** (`oklch(38% 0.16 292)`, deep indigo): held in reserve for depth and shadow-adjacent use (the hero's glitch-echo color pair, rare accent gradients). Used sparingly and never as a primary action color.

### Neutral
- **Ink Black** (`oklch(14% 0.012 45)`): the base surface. Warm-tinted near-black, never a true `#000`.
- **Raised Ink** (`oklch(18% 0.014 45)`): one step up from Ink Black — form fields, image placeholders, anything that needs to read as "a surface sitting on the surface" without a shadow.
- **Warm Paper** (`oklch(96% 0.01 80)`): primary text and headline color on dark. Warm-tinted off-white, never a true `#fff`.
- **Dim Paper** (`oklch(70% 0.014 60)`): secondary/body text, de-emphasized labels.
- **Line** (`oklch(96% 0.01 80 / 0.12)`): the only border/divider color in the new system. One opacity, one job: separate sections and rows.

### Legacy (still live on non-home pages — do not use for new home-system work)
- **Legacy Cyan** (`#3b82f6`), **Legacy Violet** (`#818cf8`), **Legacy Pink** (`#93c5fd`): the pre-redesign accent trio. Still powers `/projects`, `/blog`, case studies, and `CV.tsx`. Don't introduce these into new home-page components; don't remove them from the pages that still depend on them without a dedicated migration.
- **Legacy Ink** (`#080810`), **Legacy Card** (`#12121f`), **Legacy Text** (`#e4e4e7`) / **Legacy Text Dim** (`#a1a1aa`): the legacy neutral scale, close in value to the new Ink Black / Warm Paper but authored independently — don't assume they're interchangeable pixel-for-pixel.

### Named Rules
**The One Job Rule.** Ember means action, Volt means "this is responding to you," Indigo means depth. A color that starts doing more than one job is a sign the palette is collapsing back into decoration.

**The No True Black Rule.** Never `#000` or `#fff`. Every neutral in the new system carries a warm hue tint (`45`–`80`) at low chroma (`0.01`–`0.014`), even at the extremes.

## 3. Typography

**Display Font:** Bricolage Grotesque (variable, weights 200–800), with `system-ui, sans-serif` fallback.
**Label/Mono Font:** JetBrains Mono (weights 400, 500), with `ui-monospace, monospace` fallback.

**Character:** One committed grotesk carries both display and body — Bricolage Grotesque's slightly playful ball terminals fit "curious, craft-obsessed" without reading as a display/body pairing cliché. Mono is reserved entirely for small numeric wayfinding; it never carries a headline.

### Hierarchy
- **Display** (800, `clamp(3.2rem, 12vw, 9.5rem)`, line-height 0.94): the hero name only. One use per page.
- **Headline** (800, `clamp(1.9rem, 4.2vw, 3rem)`, line-height 0.94): the one big statement per fold (Approach, Featured Work, Mentorship, Contact section headings).
- **Title** (800, `clamp(1.6rem, 3.2vw, 2.4rem)`, line-height 1.2): project titles inside the Featured Work rows.
- **Body** (400, 1rem–1.125rem, line-height 1.625): all paragraph copy. Capped at `max-w-xl`/`max-w-2xl` containers, which keep measure close to the 65–75ch guideline.
- **Label** (400, 0.75rem, letter-spacing 0.14em, uppercase, mono): section kickers (`Approach`, `Selected Work`) and index numbers (`01`, `02`...).

### Named Rules
**The One Family Rule.** Bricolage Grotesque carries every weight of voice from a 9.5rem hero to 1rem body copy. A second display family would be a tell that the system doesn't trust its own type.

**The Mono-Is-Furniture Rule.** JetBrains Mono is restricted to numerals and kickers under 0.8rem. The moment mono shows up in a headline, it's costume, not craft.

## 4. Elevation

Flat by default. The new home system has no drop shadows at rest — depth is conveyed through two tonal steps (Ink Black → Raised Ink) and `home-line` rule dividers between rows and sections, never through `box-shadow`. The one exception is the Konami-code toast, which genuinely floats above content mid-scroll and earns a soft shadow for that reason. The legacy system (still live on other pages) uses colored glow shadows (`glow-cyan`/`glow-violet`/`glow-pink`) and a gradient-border mask trick; don't port those into new home-system work.

### Shadow Vocabulary
- **Floating toast** (`box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` — Tailwind `shadow-xl`): the only shadow in the new system, reserved for elements that are genuinely floating (the Konami-code toast).
- **Focus ring** (`box-shadow: 0 0 0 2px var(--color-home-bg), 0 0 0 4px var(--color-home-volt)`): not elevation in the traditional sense, but the system's only other `box-shadow` use — a two-layer ring (ink gap + volt ring) so the ring reads on any background.

### Named Rules
**The Flat Proof Rule.** Nothing lifts off the page at rest. If an element needs to feel important, make it bigger or give it Ember — don't give it a shadow.

## 5. Components

### Buttons
- **Shape:** near-square (2px radius) — the system's most visible rejection of soft SaaS rounding.
- **Primary:** Ember background, Ink Black text, Ember border. Padding `0.9rem 1.75rem`.
- **Hover / Focus:** background and border shift to Volt; lifts 2px on the Y axis (`translateY(-2px)`); focus-visible adds the two-layer ink/volt ring.
- **Outline:** transparent background, Warm Paper text, `home-line` border; hover darkens the border toward Dim Paper and lifts 2px, same focus ring treatment.
- **Legacy Primary (still live on `NotFound.tsx`):** blue gradient (`#3b82f6` → `#1d4ed8`), white text, soft rounded corners (8px), a shimmer-sweep on hover. Don't reuse this on new home-system work — it's one of the named anti-references.

### Inputs / Fields
- **Style:** Raised Ink background, `home-line` border (1px), Warm Paper text, Dim Paper placeholder, near-square corners matching the button radius.
- **Focus:** border and ring shift to Volt (`focus:border-home-volt focus:ring-1 focus:ring-home-volt`) — no glow, just a clean color shift.
- **Error:** validation messages render in Ember, not a separate red — errors are still "the system's accent," not an out-of-palette warning color.

### Navigation
- **Style:** fixed, transparent until scrolled past 50px, then a blurred Legacy Ink bar (`backdrop-blur-md bg-[legacy-ink]/80`). Logo wordmark is solid Ember (no gradient-clip text — the last gradient-text instance in the codebase was removed from here), shifting to Volt on hover. Active section/route gets an Ember-tinted pill (`border-home-ember/30 bg-home-ember/10`), consistently on every route regardless of which color system that page's own content uses. Mobile menu mirrors the desktop states with an Ember underline on the active link.
- **CV download button:** a neutral outline pill (`home-line` border, Warm Paper text) that turns Ember on hover — deliberately not tied to either color system's content palette, since it's persistent chrome rather than page content.

### Cards / Containers
- **New system:** avoids cards almost entirely in favor of full-width rows separated by `home-line` dividers (see Editorial Work Row below). Where a contained surface is needed (image placeholders, the Konami toast), it's Raised Ink with no border, 2px radius, no shadow.
- **Legacy system (still live elsewhere):** rounded-2xl (16px) cards on a `bg-bg-card` surface with a 1px low-alpha border and, on hover, a mouse-tracked radial-gradient spotlight plus a tilt transform. Don't introduce this pattern into new home-system work — it's exactly the "identical card grid + hover glow" shape the redesign moved away from.

### Editorial Work Row (signature component)
The Featured Work section's core pattern, and the clearest expression of the new system: a full-width row (not a card) pairing a real project screenshot with an index number (`01`, mono, Ember), a kicker label (category, mono, Dim Paper), a Title-scale project name, body copy, and a Volt-underline "View case study" link that resolves to the project's own accent color. Rows alternate image-left/image-right down the page and are separated by `home-line`, never boxed.

### Index Label (signature component)
The small mono number-plus-kicker pair (`02  APPROACH`, `01  FULL-STACK`) that opens every section and every Featured Work row. It's the system's wayfinding device through the long scroll and the one place Ember and mono are allowed to share a line.

## 6. Do's and Don'ts

### Do:
- **Do** use OKLCH for every new home-system color, and keep every neutral warm-tinted (hue ~45–80, chroma 0.01–0.014) even at the lightness extremes.
- **Do** give Ember exactly one job per fold: the action color. If a second element wants Ember too, ask whether it's actually an action.
- **Do** use `home-line` full borders and rule dividers for structure instead of shadows or cards.
- **Do** use the mono index-number pattern (`01`, `02`...) as the wayfinding device for new long-scroll sections; keep it under 0.8rem.
- **Do** respect `prefers-reduced-motion` for every new choreographed or scroll-driven animation, matching the pattern already used for the marquee, hero reveals, and button transitions.

### Don't:
- **Don't** use gradient-clipped text (`background-clip: text` with a gradient) anywhere. This was true before the redesign and remains true — it was one of the explicit reasons for the redesign.
- **Don't** add decorative blur orbs, glow spheres, or any floating shape with no informational purpose. (One was removed from the hero for exactly this reason — a rotating dashed ring with no tie to real content.)
- **Don't** reach for the legacy cyan/violet/pink trio in new home-page work. It's retained only for the pages that haven't been migrated yet.
- **Don't** use rounded-2xl cards with a mouse-tracked glow spotlight in new work — that's the legacy "identical card grid" pattern the redesign explicitly moved away from.
- **Don't** use a shimmer/sheen sweep on buttons, glassmorphism as a default surface treatment, the hero-metric template (big number + small label + gradient accent), or Inter as a body font — all named anti-references in PRODUCT.md.
- **Don't** let mono typography carry a headline or a large body of text. It's furniture for numerals and short kickers only.
