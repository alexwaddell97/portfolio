import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiExternalLink, FiGithub, FiX } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import {
  SiReact, SiTypescript, SiNodedotjs, SiNextdotjs, SiPostgresql,
  SiDocker, SiTailwindcss, SiGraphql, SiRedis, SiPython, SiFigma, SiVite,
  SiStripe, SiOpenai, SiMongodb, SiPrisma, SiVercel,
  SiD3Dotjs, SiSupabase, SiElasticsearch,
  SiWordpress, SiWoo, SiElectron, SiPwa, SiEthereum,
  SiClaude, SiGooglegemini, SiHuggingface, SiLeaflet,
  SiSanity, SiStrapi, SiAmazonwebservices,
} from 'react-icons/si';
import { FiCode } from 'react-icons/fi';
import Nav from '../components/Nav.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import projects from '../data/projects.ts';

// Map tag strings → icon component + brand colour
const tagIconMap: Record<string, { Icon: IconType; color: string }> = {
  'React':               { Icon: SiReact,            color: '#61dafb' },
  'TypeScript':          { Icon: SiTypescript,        color: '#3178c6' },
  'Node.js':             { Icon: SiNodedotjs,         color: '#6cc24a' },
  'Next.js':             { Icon: SiNextdotjs,         color: '#a3a3a3' },
  'PostgreSQL':          { Icon: SiPostgresql,        color: '#4169e1' },
  'Postgres':            { Icon: SiPostgresql,        color: '#4169e1' },
  'Docker':              { Icon: SiDocker,            color: '#2496ed' },
  'Tailwind CSS':        { Icon: SiTailwindcss,       color: '#06b6d4' },
  'GraphQL':             { Icon: SiGraphql,           color: '#e10098' },
  'Redis':               { Icon: SiRedis,             color: '#dc382d' },
  'Python':              { Icon: SiPython,            color: '#3776ab' },
  'Figma':               { Icon: SiFigma,             color: '#f24e1e' },
  'Vite':                { Icon: SiVite,              color: '#646cff' },
  'Stripe':              { Icon: SiStripe,            color: '#635bff' },
  'OpenAI API':          { Icon: SiOpenai,            color: '#74aa9c' },
  'AI':                  { Icon: SiOpenai,            color: '#74aa9c' },
  'LLM':                 { Icon: SiOpenai,            color: '#74aa9c' },
  'MongoDB':             { Icon: SiMongodb,           color: '#47a248' },
  'Prisma':              { Icon: SiPrisma,            color: '#5a67d8' },
  'Vercel':              { Icon: SiVercel,            color: '#a3a3a3' },
  'AWS':                 { Icon: SiAmazonwebservices, color: '#ff9900' },
  'D3.js':               { Icon: SiD3Dotjs,           color: '#f9a03c' },
  'Supabase':            { Icon: SiSupabase,          color: '#3ecf8e' },
  'Elasticsearch':       { Icon: SiElasticsearch,     color: '#f04e98' },
  'WordPress':           { Icon: SiWordpress,         color: '#21759b' },
  'Headless Wordpress':  { Icon: SiWordpress,         color: '#21759b' },
  'WooCommerce':         { Icon: SiWoo,               color: '#96588a' },
  'Electron':            { Icon: SiElectron,          color: '#47848f' },
  'PWA':                 { Icon: SiPwa,               color: '#5a0fc8' },
  'Web3':                { Icon: SiEthereum,          color: '#627eea' },
  'Claude':              { Icon: SiClaude,            color: '#D97757' },
  'Gemini':              { Icon: SiGooglegemini,      color: '#4285F4' },
  'Hugging Face':        { Icon: SiHuggingface,       color: '#FFD21E' },
  'Leaflet Map':         { Icon: SiLeaflet,           color: '#199900' },
  'Sanity.io':           { Icon: SiSanity,            color: '#f03e2f' },
  'Strapi':              { Icon: SiStrapi,            color: '#8e75ff' },
};

gsap.registerPlugin(ScrollTrigger);

const accentVar: Record<string, string> = {
  cyan: 'var(--color-cyan)',
  violet: 'var(--color-violet)',
  pink: 'var(--color-pink)',
};

const glowClass: Record<string, string> = {
  cyan: 'bg-cyan-glow',
  violet: 'bg-violet-glow',
  pink: 'bg-pink-glow',
};

const gradientTextClass: Record<string, string> = {
  cyan: 'gradient-text-cyan-violet',
  violet: 'gradient-text-violet-pink',
  pink: 'gradient-text-violet-pink',
};

function CaseStudy() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const previousBodyOverflowRef = useRef<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const project = projects.find(p => p.slug === slug);
  const currentIndex = projects.findIndex(p => p.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);

    const frame1 = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      window.requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });

      window.setTimeout(() => {
        window.scrollTo(0, 0);
        root.style.scrollBehavior = previousScrollBehavior;
      }, 0);
    });

    return () => {
      window.cancelAnimationFrame(frame1);
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, [slug]);

  useGSAP(
    () => {
      if (!project?.caseStudy) return;

      ScrollTrigger.clearScrollMemory();

      // 1. ANIMATED COUNTERS
      gsap.utils.toArray<HTMLElement>('.cs-stat-value').forEach(el => {
        const raw = el.dataset.value ?? '0';
        const isPercent = raw.includes('%');
        const isPlus = raw.includes('+');
        const isLt = raw.startsWith('<');
        const numeric = parseFloat(raw.replace(/[^0-9.]/g, ''));
        const current = { val: 0 };

        gsap.to(current, {
          val: numeric,
          duration: 2,
          ease: 'power2.out',
          snap: { val: 1 },
          onUpdate() {
            const v = Math.round(current.val);
            el.innerText = `${isLt ? '<' : ''}${v}${isPercent ? '%' : ''}${isPlus ? '+' : ''}`;
          },
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        });
      });

      ScrollTrigger.refresh();
    },
    { scope: containerRef, dependencies: [slug], revertOnUpdate: true }
  );

  if (!project || !project.caseStudy) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary text-text-secondary gap-4">
        <p className="text-xl">Project not found.</p>
        <button
          onClick={() => navigate('/')}
          className="btn-outline"
        >
          Back to home
        </button>
      </div>
    );
  }

  const isLight = theme === 'light';

  const cs = project.caseStudy;
  const accent = project.accentColor;
  const hasCustomAccent = Boolean(project.accentHex);
  const accentColor = hasCustomAccent
    ? (isLight ? (project.accentHexLight ?? accentVar[accent]) : project.accentHex!)
    : accentVar[accent];
  // In light mode use accentHexLight as a solid color (dark-mode titleGradient values are pastel)
  const titleStyle = isLight
    ? (hasCustomAccent ? { color: project.accentHexLight ?? accentVar[accent] } : undefined)
    : cs.titleGradient
      ? {
        backgroundImage: `linear-gradient(135deg, ${cs.titleGradient.from}, ${cs.titleGradient.to})`,
        WebkitBackgroundClip: 'text' as const,
        backgroundClip: 'text' as const,
        color: 'transparent',
      }
      : hasCustomAccent
        ? { color: accentColor }
        : undefined;
  const nextAccentColor = nextProject.accentHex
    ? (isLight ? (nextProject.accentHexLight ?? accentVar[nextProject.accentColor]) : nextProject.accentHex)
    : accentVar[nextProject.accentColor];
  const nextTitleStyle = isLight
    ? (nextProject.accentHex ? { color: nextProject.accentHexLight ?? accentVar[nextProject.accentColor] } : undefined)
    : nextProject.caseStudy?.titleGradient
      ? {
        backgroundImage: `linear-gradient(135deg, ${nextProject.caseStudy.titleGradient.from}, ${nextProject.caseStudy.titleGradient.to})`,
        WebkitBackgroundClip: 'text' as const,
        backgroundClip: 'text' as const,
        color: 'transparent' as const,
      }
      : nextProject.accentHex
        ? { color: nextAccentColor }
        : undefined;

  const panels = [
    { label: 'The Challenge', content: cs.challenge, color: 'var(--color-cyan)' },
    { label: 'The Approach', content: cs.approach, color: 'var(--color-violet)' },
    { label: 'The Outcome', content: cs.outcome, color: 'var(--color-pink)' },
  ];

  const galleryImages: string[] = (project.gallery ?? []).filter(Boolean);

  // Adjust hero title size based on length to avoid overflow for very long titles
  const titleLen = project.title ? project.title.length : 0;
  const titleSizeClass = titleLen > 40
    ? 'text-[clamp(1.8rem,5.5vw,3.2rem)]'
    : titleLen > 24
      ? 'text-[clamp(2.6rem,7.5vw,5rem)]'
      : 'text-[clamp(3.2rem,9vw,9rem)]';
  // Replace wide en/em dashes with a normal hyphen for more consistent spacing
  const displayTitle = project.title.replace(/\s[–—]\s/g, ' - ');
  const displayNextTitle = nextProject.title.replace(/\s[–—]\s/g, ' - ');

  useEffect(() => {
    setIsTransitioning(false);
  }, [slug]);

  useEffect(() => {
    if (!isTransitioning) {
      if (previousBodyOverflowRef.current !== null) {
        document.body.style.overflow = previousBodyOverflowRef.current;
        previousBodyOverflowRef.current = null;
      }
      return;
    }

    previousBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      if (previousBodyOverflowRef.current !== null) {
        document.body.style.overflow = previousBodyOverflowRef.current;
        previousBodyOverflowRef.current = null;
      }
    };
  }, [isTransitioning]);

  function transitionToNextCaseStudy() {
    if (isTransitioning) return;

    setIsTransitioning(true);
    window.setTimeout(() => {
      navigate(`/projects/${nextProject.slug}`);
    }, 260);
  }

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex(i => i === null ? 0 : Math.min(galleryImages.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setLightboxIndex(i => i === null ? 0 : Math.max(0, i - 1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, galleryImages.length]);

  return (
    <div ref={containerRef} className="bg-bg-primary text-text-primary overflow-x-hidden">
      <Nav />

      {/* ── 1. HERO ──────────────────────────────────── */}
      <section
        id="cs-hero"
        className="dot-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
      >
        {/* Cinematic image backdrop */}
        {project.image && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={project.image}
              alt=""
              aria-hidden
              className="h-full w-full object-cover object-top scale-110 blur-[2px]"
              style={{ opacity: isLight ? 0.45 : 0.18 }}
            />
            <div
              className="absolute inset-0"
              style={{ background: isLight ? 'rgba(255,255,255,0.35)' : 'var(--color-bg-primary)', opacity: isLight ? 1 : 0.65 }}
            />
          </div>
        )}

        <div
          className={`pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-50 ${hasCustomAccent ? '' : glowClass[accent]}`}
          style={hasCustomAccent ? { background: `radial-gradient(circle, ${accentColor}55 0%, transparent 70%)` } : undefined}
        />

        <div className="relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-sm font-semibold tracking-[0.2em] uppercase text-text-muted"
          >
            Case Study — {String(currentIndex + 1).padStart(2, '0')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
            className={`${titleStyle === undefined ? gradientTextClass[accent] : ''} display-heading-safe ${titleSizeClass} font-black tracking-tighter`}
            style={titleStyle}
          >
              {displayTitle}
          </motion.h1>

          {/* Category chips + links */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            {(Array.isArray(project.category) ? project.category : [project.category]).map(cat => (
              <span
                key={cat}
                className="rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase backdrop-blur-md"
                style={{
                  borderColor: `${accentColor}60`,
                  background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)',
                  color: isLight ? '#111' : 'var(--color-text-secondary)',
                }}
              >
                {cat}
              </span>
            ))}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase backdrop-blur-md transition-opacity hover:opacity-80"
                style={{
                  borderColor: `${accentColor}80`,
                  color: isLight ? accentColor : accentColor,
                  background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)',
                }}
              >
                <FiExternalLink size={11} /> Live Site
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase backdrop-blur-md transition-opacity hover:opacity-80"
                style={{
                  borderColor: `${accentColor}80`,
                  color: isLight ? accentColor : accentColor,
                  background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)',
                }}
              >
                <FiGithub size={11} /> Source
              </a>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-12 flex flex-col items-center gap-2 text-text-muted"
          >
            <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
            <div
              className="h-10 w-px animate-bounce"
              style={{ background: `linear-gradient(to bottom, ${accentColor}, transparent)` }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── 2. OVERVIEW ──────────────────────────────── */}
      <section className="py-32">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
        >
          <p
            className="mb-6 text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ color: accentColor }}
          >
            Overview
          </p>
          <p className="text-2xl leading-relaxed text-text-secondary lg:text-3xl">{cs.overview}</p>
        </motion.div>
      </section>

      {/* ── 3. CHALLENGE / APPROACH / OUTCOME ─────────── */}
      {panels.map((panel, i) => (
        <motion.section
          key={panel.label}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden border-t border-border py-28"
        >
          {/* Corner glow */}
          <div
            className="pointer-events-none absolute top-0 right-0 h-96 w-96 opacity-[0.07] blur-3xl"
            style={{ background: panel.color }}
          />
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className={`grid items-start gap-16 ${i % 2 === 1 ? 'md:grid-cols-[1fr_280px]' : 'md:grid-cols-[280px_1fr]'}`}>
              {/* Label + ordinal */}
              <div className={i % 2 === 1 ? 'md:order-2 md:text-right' : ''}>
                <span
                  className="block select-none text-[8rem] font-black leading-none opacity-[0.07]"
                  style={{ color: panel.color }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p
                  className="mt-2 text-xs font-semibold tracking-[0.2em] uppercase"
                  style={{ color: panel.color }}
                >
                  {panel.label}
                </p>
              </div>
              {/* Content */}
              <div
                className={i % 2 === 1 ? 'border-r-[3px] pr-10 md:order-1' : 'border-l-[3px] pl-10'}
                style={{ borderColor: panel.color }}
              >
                <p className="text-xl leading-relaxed text-text-secondary md:text-2xl lg:text-3xl">
                  {panel.content}
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      ))}

      {/* ── 4. STATS ─────────────────────────────────── */}
      {project.stats && project.stats.length > 0 && (
        <section className="border-y border-border py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
              {project.stats.map((stat, statIdx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.55, delay: statIdx * 0.09, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-2xl border border-border bg-bg-card p-8 text-center"
                >
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${accentColor}22, transparent 65%)` }}
                  />
                  <div
                    className="cs-stat-value relative text-5xl font-black md:text-6xl"
                    data-value={stat.value}
                    style={{ color: accentColor }}
                  >
                    0
                  </div>
                  <p className="relative mt-3 text-sm text-text-muted">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. STACK ─────────────────────────────────── */}
      <section id="cs-tech" className="border-t border-border py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
        >
          <p className="mb-6 text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: accentColor }}>
            Stack
          </p>
          {project.techBrief && (
            <p className="mb-10 text-lg leading-relaxed text-text-secondary">
              {project.techBrief}
            </p>
          )}
          <div className="flex flex-wrap gap-2.5">
            {project.tags.map((tag) => {
              const iconEntry = tagIconMap[tag];
              const iconColor = iconEntry?.color ?? accentColor;
              return (
                <span
                  key={tag}
                  className="flex items-center gap-2 rounded-full border bg-bg-card px-4 py-2 text-sm font-medium text-text-secondary"
                  style={{ borderColor: `${iconColor}40` }}
                >
                  {iconEntry
                    ? <iconEntry.Icon size={14} style={{ color: iconColor }} />
                    : <FiCode size={13} style={{ color: accentColor }} />
                  }
                  {tag}
                </span>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ── 6. GALLERY ───────────────────────────────── */}
      {galleryImages.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-10 text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: accentColor }}
            >
              Gallery
            </motion.p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((src, i) => (
                <motion.button
                  key={src + i}
                  onClick={() => setLightboxIndex(i)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="group block w-full rounded-xl border border-border focus-visible:outline-none focus-visible:ring-2"
                  style={{
                    boxShadow: `0 0 0 0 ${accentColor}`,
                  }}
                  aria-label={`View image ${i + 1}`}
                >
                  <div className="aspect-video w-full overflow-hidden rounded-xl">
                    <img
                      src={src}
                      alt={`${project.title} screenshot ${i + 1}`}
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. NEXT PROJECT ──────────────────────────── */}
      <motion.section
        className="border-t border-border py-24"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-xs font-semibold tracking-[0.2em] uppercase text-text-muted">
            Next Project
          </p>
          <button
            onClick={transitionToNextCaseStudy}
            disabled={isTransitioning}
            className="group block w-full text-left disabled:cursor-wait disabled:opacity-80"
          >
            <div
              className="relative overflow-hidden rounded-2xl border bg-bg-card transition-all duration-300"
              style={{ borderColor: `${nextAccentColor}44`, boxShadow: `0 0 40px ${nextAccentColor}12` }}
            >
              {/* Background image */}
              {nextProject.image && (
                <div className="absolute inset-0">
                  <img
                    src={nextProject.image}
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover object-top opacity-10 blur-sm transition-opacity duration-300 group-hover:opacity-20"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-bg-card via-bg-card/85 to-transparent" />
                </div>
              )}
              <div className="relative flex items-center justify-between gap-8 p-8 md:p-12">
                <div>
                  <span
                    className="mb-3 block text-xs font-semibold tracking-[0.2em] uppercase"
                    style={{ color: nextAccentColor }}
                  >
                    Up Next
                  </span>
                  <h3
                    className={`${nextTitleStyle === undefined ? gradientTextClass[nextProject.accentColor] : ''} display-heading-safe text-3xl font-black md:text-5xl`}
                    style={nextTitleStyle}
                  >
                    {displayNextTitle}
                  </h3>
                  {nextProject.description && (
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">
                      {nextProject.description}
                    </p>
                  )}
                </div>
                <FiArrowRight
                  size={36}
                  className="shrink-0 transition-transform duration-300 group-hover:translate-x-2"
                  style={{ color: nextAccentColor }}
                />
              </div>
            </div>
          </button>
        </div>
      </motion.section>
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && galleryImages[lightboxIndex] && (
          <motion.div
            className="fixed inset-0 z-200 flex items-center justify-center bg-black/92 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close lightbox"
            >
              <FiX size={22} />
            </button>
            {lightboxIndex > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                onClick={e => { e.stopPropagation(); setLightboxIndex(i => Math.max(0, (i ?? 0) - 1)); }}
                aria-label="Previous image"
              >
                <FiChevronLeft size={26} />
              </button>
            )}
            {lightboxIndex < galleryImages.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                onClick={e => { e.stopPropagation(); setLightboxIndex(i => Math.min(galleryImages.length - 1, (i ?? 0) + 1)); }}
                aria-label="Next image"
              >
                <FiChevronRight size={26} />
              </button>
            )}
            <motion.img
              key={lightboxIndex}
              src={galleryImages[lightboxIndex]}
              alt={`${project.title} screenshot ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs text-white/60">
              {lightboxIndex + 1} / {galleryImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page transition overlay */}      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[120]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-0 bg-bg-primary/75 backdrop-blur-[2px]" />
            <motion.div
              className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-cyan via-violet to-pink"
              initial={{ scaleX: 0, transformOrigin: 'left center' }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CaseStudy;
