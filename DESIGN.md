---
name: Alex Waddell Portfolio
description: Personal portfolio for a craft-obsessed full-stack engineer — dark, electric, precise.
colors:
  bg-primary: "#080810"
  bg-secondary: "#0e0e1a"
  bg-card: "#12121f"
  text-primary: "#e4e4e7"
  text-secondary: "#a1a1aa"
  text-muted: "#8b8b9d"
  electric-blue: "#3b82f6"
  accent-hover: "#2563eb"
  drift-indigo: "#818cf8"
  pale-sky: "#93c5fd"
typography:
  display:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(3rem, 8vw, 7rem)"
    fontWeight: 900
    lineHeight: 1.12
    letterSpacing: "-0.05em"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 3vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.2em"
rounded:
  full: "9999px"
  2xl: "16px"
  lg: "8px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.electric-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "#ffffff"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-outline-hover:
    textColor: "{colors.electric-blue}"
  button-soft-cyan:
    backgroundColor: "{colors.electric-blue}"
    textColor: "{colors.electric-blue}"
    rounded: "{rounded.lg}"
    padding: "6px 16px"
  nav-pill-active:
    backgroundColor: "{colors.electric-blue}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
  tag-cyan:
    backgroundColor: "{colors.electric-blue}"
    textColor: "{colors.electric-blue}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  project-card:
    backgroundColor: "{colors.bg-secondary}"
    rounded: "{rounded.2xl}"
    padding: "0px"
---

# Design System: Alex Waddell Portfolio

## 1. Overview

**Creative North Star: "The Signal in the Dark"**

This is a precision instrument that broadcasts from a deep black field. The architecture is discipline — maximal negative space, a single typeface, a tight constraint of three blue-family accents used with restraint. The personality is not in the layout. It lives in the interactions: the glitch easter egg on five name clicks, the Konami code that unlocks 30 lives, the snake game behind a hidden trigger. Find the layout, find the engineer. Find the easter eggs, find the person.

The system is dark because that is the correct answer for this context, not a reflex. A hiring manager reviewing work at night on a laptop, a founder scanning a portfolio at their standing desk — the deep navy-black reduces ambient glare, sharpens the contrast on the electric blue accents, and makes every interactive element feel like transmission rather than decoration. Light mode is supported as a genuine alternative, but dark is the native state.

Every element earns its presence. If something does not carry signal, it is removed. The labs section is the clearest expression of this principle: experiments built because there was a genuine question, not because portfolios need a "side projects" section. The design applies the same logic — no element exists to fill space.

**Key Characteristics:**
- Single typeface (Manrope), weight-based hierarchy only — no display pairing
- Three accents in the same blue family: Electric Blue, Drift Indigo, Pale Sky
- Glow-based depth: surfaces are flat, glows mark active and interactive edges
- Expo-out easing (cubic-bezier(0.22, 1, 0.36, 1)) for every transition
- Stagger-and-settle entry animation; spring physics on interactive hover
- Personality encoded in easter eggs and micromoments, not in decorative elements

## 2. Colors: The Signal Blue Palette

Three temperatures of one hue, deployed against a near-black field. The accents emit; they do not decorate.

### Primary
- **Electric Blue** (#3b82f6): The primary carrier. CTAs, active navigation states, focus rings, interactive borders, link hover treatments, and all chip/tag accents. Every interactive element resolves to this color or its hover derivative (#2563eb). Its rarity is the point — it only appears where something can be acted upon.

### Secondary
- **Drift Indigo** (#818cf8): Harmonic support. Used alongside Electric Blue in gradients (scrollbar, section dividers), glow orbs on the hero, and the animated `.dev` suffix in the nav brand. Never used alone as a standalone CTA color.

### Tertiary
- **Pale Sky** (#93c5fd): Ambient emission. The softest member of the trio. Appears in section divider gradients, glitch afterimage effects on the hero name easter egg, and the lightest stop in scrollbar gradient fills. Carries no action weight independently.

### Neutral
- **Abyss Ink** (#080810): The page background. The deep field everything else broadcasts from. Not pure black — it carries a blue cast that keeps the surface in family with the accent trio. Never use `#000000`.
- **Deep Void** (#0e0e1a): Secondary background. Used for scrolled-nav fill, section alternation, and the image panel on project cards. The step above Abyss Ink in the surface stack.
- **Surface Slate** (#12121f): Card background. The warmest of the three dark surfaces.
- **Off-White Signal** (#e4e4e7): Primary text. Near-white with a zinc cast — prevents harsh contrast against the near-black field while remaining clearly legible.
- **Ash Type** (#a1a1aa): Secondary text. Descriptions, subtitles, project meta.
- **Faded Lavender** (#8b8b9d): Muted text. Hints, decorative labels, Konami code hint at hero bottom-right. Very low visual weight by design.

**Light mode:** Backgrounds invert to #f8f9fc / #eef0f6 / #ffffff. Text inverts to #18181b / #52525b / #71717a. The Electric Blue accent shifts to #0369a1, Drift Indigo to #1d4ed8, and Pale Sky to #be123c (rose) in light mode — the light-mode trio diverges in hue to maintain contrast ratios on the lighter field.

**Border tokens:** The default border is `rgba(255, 255, 255, 0.06)` in dark mode — a near-invisible hairline that separates surfaces without drawing attention. Accent borders use alpha variants: cyan/30 (`rgba(59,130,246,0.3)`), violet/30, pink/25.

### Named Rules

**The One Source Rule.** All three accent colors derive from the blue family. Never introduce a warm accent (orange, green, yellow) into the primary palette. Warmth enters only as per-project accent overrides on case study cards (`accentHex` / `accentHexLight` props) — scoped to that card, invisible to the rest of the system.

**The Glow Rule.** Glows are not atmosphere. A glow on a surface marks it as active, hoverable, or focused. No glow should appear on a static non-interactive element at rest. Adding a glow for mood is the wrong answer — remove it.

**The Gradient Text Rule.** The `.gradient-text-*` utilities exist for one purpose: project card titles inherit a gradient from their project's assigned accent color. This is a functional identifier, not a decorative treatment. Gradient text on any other element — headings, CTAs, section labels — is prohibited.

## 3. Typography

**Display Font:** Manrope (with system-ui, sans-serif fallback)
**Body Font:** Manrope (same)
**Label Font:** Manrope (same — hierarchy via weight and tracking, not family)

**Character:** A single-typeface system that uses weight contrast as its sole tool. No serif for gravitas, no mono for technical personality — just Manrope spanning weights 400 through 900. The constraint forces the hierarchy to be exact. Where a different typeface might carry the personality, this system encodes it in interactions instead.

### Hierarchy
- **Display** (weight 900, clamp(3rem, 8vw, 7rem), line-height 1.12, tracking -0.05em): Hero name only. Font-black with tight negative tracking closes the letterforms at large sizes. The `.display-heading-safe` utility adds a small padding-bottom (0.06em) to prevent descender clipping at scale. Never apply display weight to section headings or body copy.
- **Headline** (weight 700, clamp(1.875rem, 4vw, 2.25rem), line-height 1.2): Section titles (h2 elements). The primary structural landmark on each page view.
- **Title** (weight 700, clamp(1.25rem, 3vw, 1.875rem), line-height 1.3): Project card titles, h3 elements. Prominent but secondary to section headings. May receive the gradient-text treatment per the Gradient Text Rule.
- **Body** (weight 400, 1.125rem / 1.25rem on md, line-height 1.625): All paragraph copy, project descriptions. Cap line length at 65–70ch. Do not use body weight for navigational or interactive elements.
- **Label** (weight 600, 0.75rem, tracking 0.2em, uppercase): Role cycling text above the hero name, tech tag text, nav-brand mark. The 0.2em tracking and uppercase transform compensate for the small scale and create visual separation from body text.

**Nav:** weight 600, text-sm (0.875rem), tracking-tight (-0.01em).

### Named Rules

**The Single-Family Rule.** Manrope only. If a future version introduces a display serif or a mono face, it must be a deliberate system-wide decision documented here — never added for a single component.

## 4. Elevation

Flat by default. Depth is conveyed through glow emission, not z-axis shadow stacks.

The system deliberately avoids traditional box-shadow elevation (`0 4px 16px rgba(0,0,0,0.24)` on cards). Instead, active and interactive surfaces emit a low-opacity colored glow from their accent, signaling that the element has energy and can respond. Resting surfaces are flat against their background. The distinction between a flat surface (no glow) and an active surface (faint glow) communicates affordance without adding visual weight to the resting state.

### Shadow Vocabulary
- **Glow-ambient** (`0 0 20px rgba(59,130,246,0.08), 0 0 60px rgba(59,130,246,0.04)`): Low-intensity ambient glow on accent-bordered card panels. Barely perceptible at rest; its absence would feel more mechanical than its presence.
- **Button-lift** (`0 16px 30px -16px rgba(59,130,246,0.75)`): Directional shadow beneath primary buttons on hover only. The negative spread (-16px) keeps the glow tightly coupled to the button edge. Tracks the gradient fill direction.
- **Focus-ring** (`0 0 0 2px rgba(147,197,253,0.5)`): Keyboard focus indicator using Pale Sky alpha. Visible without competing with the Electric Blue active state. Applied to all interactive elements.
- **Badge-glow** (per-accent radial gradient): Project number badges and image placeholder panels emit a radial gradient from their assigned accent. `radial-gradient(ellipse 60% 60% at 50% 50%, accent/0.18, transparent)`.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Glow and shadow appear only as state transitions — hover, focus, or active. A static glow on any resting, non-interactive element is a mistake. If the audit test is: "does this glow respond to something?" and the answer is no, remove it.

## 5. Components

Components feel built and intentional. No rounding for warmth's sake, no color for variety's sake. Every choice is load-bearing.

### Buttons

- **Shape:** Gently rounded (8px radius, `rounded-lg`). Pills (`rounded-full`) are reserved for navigation active states and tag chips — never buttons that trigger actions.
- **Primary (`btn-primary`):** Electric Blue gradient fill (135deg, #3b82f6 → #1d4ed8), white text (#ffffff), 12px 24px padding. On hover: `translateY(-1px) scale(1.02)`, directional glow shadow. On focus: Pale Sky ring (`0 0 0 2px rgba(147,197,253,0.5)`). Disabled: no transform, no shadow.
- **Outline (`btn-outline`):** Transparent background, ghost border (`rgba(255,255,255,0.06)`), text-primary color, 12px 24px padding. On hover: Electric Blue border at 45% opacity, Electric Blue text, `translateY(-1px)`. On focus: Electric Blue ring at 30% opacity.
- **Soft Cyan (`btn-soft-cyan`):** Electric Blue at 10% opacity background, Electric Blue at 35% opacity border, Electric Blue text, 6px 16px padding. Used for lower-hierarchy CTAs (Download CV in nav). On hover: background deepens to 15% opacity, border to 45%, `translateY(-1px)`.
- **Transition timing:** All button state changes use 220ms cubic-bezier(0.22, 1, 0.36, 1). No bounce, no elastic.

### Navigation

- **Brand mark (`alexw.dev`):** Manrope weight 600, tracking-tight. The `.dev` suffix receives an animated multi-stop gradient (Electric Blue → Pale Sky → Drift Indigo) that sweeps on hover via background-position shift. A 1px gradient underline (from-cyan to-violet, via Tailwind) sits beneath the full mark when on the home page.
- **Desktop nav items:** text-sm, text-secondary by default. Active state: pill-shaped background (cyan/10) with cyan/30 border, rounded-full, animated in/out via Framer Motion scale (0.88 → 1).
- **Scrolled nav:** backdrop-blur-md, bg-primary at 80% opacity, border-b border-border. Transparent at rest.
- **Mobile menu:** Full-width column layout, py-3.5 border-b separators between items. Active item underlined with `decoration-cyan/80`, `underline-offset-8`.

### Tags / Chips

- **Shape:** rounded-full, text-xs (0.75rem), font-medium (500), 4px 12px padding.
- **Variants:** cyan, violet, pink — each maps to one of the Signal Blue trio. Background is accent/10, border is accent/20, text is the accent color.
- **Custom accents:** When a project has an `accentHex` override, the tag uses that color at the same 10%/20% opacities.
- **Display only.** Tags in this system are not interactive filter controls.

### Cards / Containers

- **Corner style:** Rounded (16px, `rounded-2xl`) on both the outer wrapper and the image panel.
- **Background:** bg-secondary (#0e0e1a) for the image panel.
- **Border:** 1px gradient border via CSS mask trick — `linear-gradient(135deg, accent/60, accent/10)` — creating a fading accent edge rather than a flat-color border.
- **Glow:** Ambient glow from the accent (`0 0 20px accent/0.08, 0 0 60px accent/0.04`) on the image panel at rest.
- **Hover overlay:** bg-primary/60 with `backdrop-blur-sm`, fades in on hover (opacity 0 → 1). Contains a "View Case Study" pill with accent border and background.
- **Hover motion:** `y: -3px` spring lift (stiffness 280, damping 22) via Framer Motion `whileHover`.
- **No nested cards.** The card's inner structure uses sections, not sub-cards.

### Inputs / Fields

Used in the Contact form. No distinct design tokens extracted yet — to be documented on the next Contact section redesign pass.

### Section Heading (Signature Component)

Every `h2` section heading is followed by a 2px × 64px horizontal rule with a three-stop linear gradient: Electric Blue → Drift Indigo → Pale Sky. This is the only element in the system that uses all three accents simultaneously on a single element. It acts as a rhythmic anchor and visual identity mark at every section entry point.

```
h2 [Section Title]
p  [Optional subtitle]
── gradient rule (64px, 2px, cyan → violet → pink) ──
```

## 6. Do's and Don'ts

### Do:
- **Do** use Electric Blue (#3b82f6) as the sole action color. Every CTA, link hover, active state, and focus ring resolves to #3b82f6 or its hover derivative (#2563eb). Rarity is the point.
- **Do** keep surfaces flat at rest. Glow and shadow appear only as state transitions — hover, focus, active. The Flat-By-Default Rule is the system's core discipline.
- **Do** use Manrope exclusively. All hierarchy is expressed through weight (400/500/600/700/900) and scale. No second typeface without a system-level decision documented here.
- **Do** use cubic-bezier(0.22, 1, 0.36, 1) for every transition. It is the system's signature expo-out curve. It is not negotiable per element.
- **Do** respect `prefers-reduced-motion`. All animation and transitions are disabled for reduced-motion users. No animation is structural to readability — every animated element must degrade gracefully to a static state.
- **Do** encode personality in interactions and easter eggs: glitch on name click, Konami code, hidden snake game. The layout is disciplined; the personality is discovered.
- **Do** use the three-stop section divider (Electric Blue → Drift Indigo → Pale Sky) beneath every h2 section title. It is the rhythmic anchor of the system.

### Don't:
- **Don't** build the generic dev portfolio template: big avatar hero, role cycling as the primary heading, skills logo grid, identical project card grid. The anti-pattern is the format. Styling it differently does not fix it.
- **Don't** use gradient text (`background-clip: text`, `-webkit-text-fill-color: transparent`) for any heading, CTA, or decorative element. Gradient text in this system is restricted to project card titles as a functional per-project accent identifier, per the Gradient Text Rule. This is an absolute prohibition.
- **Don't** use glassmorphism as a surface style. `backdrop-blur` appears in this system as an interaction state (project card hover overlay, scrolled nav), not as a resting card background. Blurred glass surfaces at rest are prohibited.
- **Don't** introduce warm colors — orange, red, yellow, green — into the primary palette. Warmth enters only as a per-project accent override scoped to a single case study card, controlled via the `accentHex` prop. Nowhere else.
- **Don't** add decorative shadows or glows to non-interactive elements. Glows are state indicators. A glow on a resting static element violates the Glow Rule.
- **Don't** use side-stripe borders (border-left or border-right greater than 1px as a colored accent on cards, list items, or callouts). Not present in this system. If a vertical accent is needed, use a background tint or a leading icon instead.
- **Don't** build an over-animated showreel: particles, WebGL backgrounds, everything-enters-animated on load. The motion system is stagger-and-settle — elements enter once, then respond to interaction. Everything-in-motion is exhausting after 10 seconds.
- **Don't** apply a dry CV-with-theme approach — resume data with a dark theme is not this portfolio. The labs section and case studies carry the argument. A section that does not demonstrate something is a section that should not exist.
- **Don't** use AI-generated design output patterns: hero metric blocks (big number, small label, gradient accent), identical card grids, gradient-heavy CTAs, glassmorphism cards. These are the patterns the portfolio exists to distinguish itself from.
