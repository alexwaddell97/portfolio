import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowRight, FiExternalLink, FiGithub } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import {
  SiReact, SiTypescript, SiNodedotjs, SiNextdotjs, SiPostgresql,
  SiDocker, SiTailwindcss, SiGraphql, SiRedis, SiPython, SiFigma, SiVite,
  SiStripe, SiOpenai, SiMongodb, SiPrisma, SiVercel, SiAmazon,
  SiD3Dotjs, SiSupabase, SiElasticsearch,
} from 'react-icons/si';
import Nav from '../components/Nav.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import projects from '../data/projects.ts';

// Map tag strings → icon component + brand colour
const tagIconMap: Record<string, { Icon: IconType; color: string }> = {
  'React':         { Icon: SiReact,         color: '#61dafb' },
  'TypeScript':    { Icon: SiTypescript,     color: '#3178c6' },
  'Node.js':       { Icon: SiNodedotjs,      color: '#6cc24a' },
  'Next.js':       { Icon: SiNextdotjs,      color: '#e4e4e7' },
  'PostgreSQL':    { Icon: SiPostgresql,     color: '#4169e1' },
  'Docker':        { Icon: SiDocker,         color: '#2496ed' },
  'Tailwind CSS':  { Icon: SiTailwindcss,    color: '#06b6d4' },
  'GraphQL':       { Icon: SiGraphql,        color: '#e10098' },
  'Redis':         { Icon: SiRedis,          color: '#dc382d' },
  'Python':        { Icon: SiPython,         color: '#3776ab' },
  'Figma':         { Icon: SiFigma,          color: '#f24e1e' },
  'Vite':          { Icon: SiVite,           color: '#646cff' },
  'Stripe':        { Icon: SiStripe,         color: '#635bff' },
  'OpenAI API':    { Icon: SiOpenai,         color: '#74aa9c' },
  'MongoDB':       { Icon: SiMongodb,        color: '#47a248' },
  'Prisma':        { Icon: SiPrisma,         color: '#5a67d8' },
  'Vercel':        { Icon: SiVercel,         color: '#e4e4e7' },
  'AWS':           { Icon: SiAmazon,         color: '#ff9900' },
  'D3.js':         { Icon: SiD3Dotjs,        color: '#f9a03c' },
  'Supabase':      { Icon: SiSupabase,       color: '#3ecf8e' },
  'Elasticsearch': { Icon: SiElasticsearch,  color: '#f04e98' },
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

const placeholderGrad: Record<string, string> = {
  cyan: 'from-cyan/10 to-cyan/5',
  violet: 'from-violet/10 to-violet/5',
  pink: 'from-pink/10 to-pink/5',
};

function CaseStudy() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const previousBodyOverflowRef = useRef<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

      // 1. PIN HERO — stays while user starts scrolling
      ScrollTrigger.create({
        trigger: '#cs-hero',
        start: 'top top',
        end: '+=500',
        pin: true,
        pinSpacing: true,
      });

      // 2. HORIZONTAL SCROLL — Challenge / Approach / Outcome
      const panels = gsap.utils.toArray<HTMLElement>('.cs-panel');
      if (panels.length > 1) {
        const totalTravel = (panels.length - 1) * window.innerWidth;
        gsap.to('.cs-panels-track', {
          x: -totalTravel,
          ease: 'none',
          scrollTrigger: {
            trigger: '#cs-horizontal',
            start: 'top top',
            end: () => `+=${totalTravel}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });
      }

      // 3. ANIMATED COUNTERS
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

      // 4. IMAGE REVEAL via clipPath
      const imageEl = document.querySelector<HTMLElement>('#cs-image-reveal');
      if (imageEl) {
        gsap.from(imageEl, {
          clipPath: 'inset(0 100% 0 0)',
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: imageEl,
            start: 'top 72%',
            once: true,
          },
        });
      }

      // 5. TECH PILL SCATTER
      const pills = gsap.utils.toArray<HTMLElement>('.cs-tech-pill');
      pills.forEach((pill, i) => {
        const angle = (i / pills.length) * Math.PI * 2;
        const radius = 50 + Math.random() * 40;
        gsap.from(pill, {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          opacity: 0,
          scale: 0.6,
          duration: 0.7,
          delay: i * 0.06,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: '#cs-tech',
            start: 'top 80%',
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

  return (
    <div ref={containerRef} className="bg-bg-primary text-text-primary overflow-x-hidden">
      <Nav />

      {/* ── 1. HERO ──────────────────────────────────── */}
      <section
        id="cs-hero"
        className="dot-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
      >
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text-primary"
              >
                <FiExternalLink size={14} /> Live Site
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text-primary"
              >
                <FiGithub size={14} /> Source
              </a>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <p
                className="mb-4 text-xs font-semibold tracking-[0.2em] uppercase"
                style={{ color: accentColor }}
              >
                Overview
              </p>
              <p className="text-xl leading-relaxed text-text-secondary">{cs.overview}</p>
            </div>
            <div className="space-y-0">
              {project.tags.map((tag, i) => (
                <div
                  key={tag}
                  className="flex items-center gap-4 border-b border-border py-4"
                >
                  <span className="w-6 text-sm font-medium text-text-muted">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-text-primary">{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. HORIZONTAL SCROLL ─────────────────────── */}
      <section id="cs-horizontal" className="overflow-hidden">
        <div
          className="cs-panels-track flex"
          style={{ width: `${panels.length * 100}vw` }}
        >
          {panels.map((panel) => (
            <div
              key={panel.label}
              className="cs-panel flex min-h-screen w-screen flex-col items-center justify-center px-8 md:px-24"
            >
              <div className="max-w-2xl">
                <p
                  className="mb-6 text-xs font-semibold tracking-[0.2em] uppercase"
                  style={{ color: panel.color }}
                >
                  {panel.label}
                </p>
                <p className="text-2xl font-medium leading-relaxed text-text-primary md:text-3xl lg:text-4xl">
                  {panel.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. STATS ─────────────────────────────────── */}
      {project.stats && project.stats.length > 0 && (
        <section className="border-y border-border py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
              {project.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className={`cs-stat-value gradient-text-full text-5xl font-black md:text-6xl`}
                    data-value={stat.value}
                  >
                    0
                  </div>
                  <p className="mt-2 text-sm text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. TECH SCATTER ──────────────────────────── */}
      <section id="cs-tech" className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-12 text-xs font-semibold tracking-[0.2em] uppercase text-text-muted">
            Built With
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {project.tags.map((tag, i) => {
              const iconEntry = tagIconMap[tag];
              // Stagger the pulse animation so pills don't all pulse together
              const pulseDelay = `${(i * 0.22) % 2.8}s`;
              const pulseClass = accent === 'cyan'
                ? 'cs-tech-pill-cyan'
                : accent === 'pink'
                  ? 'cs-tech-pill-pink'
                  : 'cs-tech-pill-violet';
              return (
                <div
                  key={tag}
                  className={`cs-tech-pill ${pulseClass} flex items-center gap-2.5 rounded-full border bg-bg-card px-5 py-2.5 text-sm font-medium text-text-secondary`}
                  style={{ animationDelay: pulseDelay }}
                >
                  {iconEntry && (
                    <iconEntry.Icon size={16} style={{ color: iconEntry.color }} />
                  )}
                  {tag}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. IMAGE REVEAL ──────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div
            id="cs-image-reveal"
            className="relative aspect-video overflow-hidden rounded-2xl bg-bg-secondary"
            style={{ clipPath: 'inset(0 0% 0 0)' }}
          >
            {project.image ? (
              <img
                src={project.image}
                alt={project.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center ${hasCustomAccent ? '' : `bg-gradient-to-br ${placeholderGrad[accent]}`}`}
                style={hasCustomAccent ? { background: `linear-gradient(135deg, ${accentColor}22, transparent 70%)` } : undefined}
              >
                <span
                  className="text-8xl font-black opacity-20"
                  style={{ color: accentColor }}
                >
                  {project.title[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 7. NEXT PROJECT ──────────────────────────── */}
      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-text-muted">
            Next Project
          </p>
          <button
            onClick={transitionToNextCaseStudy}
            disabled={isTransitioning}
            className="group flex items-center gap-4 disabled:cursor-wait disabled:opacity-80"
          >
            <span
                className={`${nextTitleStyle === undefined ? gradientTextClass[nextProject.accentColor] : ''} display-heading-safe text-4xl font-black transition-opacity group-hover:opacity-80 md:text-5xl`}
              style={nextTitleStyle}
            >
              {displayNextTitle}
            </span>
            <FiArrowRight
              size={28}
              className="transition-transform duration-200 group-hover:translate-x-2"
              style={{ color: nextAccentColor }}
            />
          </button>
        </div>
      </section>

      <AnimatePresence>
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
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan via-violet to-pink"
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
