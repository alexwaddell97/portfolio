import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
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

const EASE = [0.16, 1, 0.3, 1] as const;

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

  // Pointer-driven tilt on the hero statement — same treatment as the Home hero.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const heroSpringX = useSpring(pointerX, { stiffness: 80, damping: 20 });
  const heroSpringY = useSpring(pointerY, { stiffness: 80, damping: 20 });
  const heroRotateX = useTransform(heroSpringY, [-0.5, 0.5], [3, -3]);
  const heroRotateY = useTransform(heroSpringX, [-0.5, 0.5], [-3, 3]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const handlePointerMove = (e: PointerEvent) => {
      pointerX.set(e.clientX / window.innerWidth - 0.5);
      pointerY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [pointerX, pointerY]);

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
      <div className="home-scene flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-xl text-home-paper-dim">Project not found.</p>
        <button
          onClick={() => navigate('/')}
          className="home-btn home-btn-outline"
        >
          Back to home
        </button>
      </div>
    );
  }

  const isLight = theme === 'light';

  const cs = project.caseStudy;
  const accent = isLight
    ? (project.accentHexLight ?? project.accentHex)
    : project.accentHex;
  const nextAccent = isLight
    ? (nextProject.accentHexLight ?? nextProject.accentHex)
    : nextProject.accentHex;

  const panels = [
    { label: 'The Challenge', content: cs.challenge },
    { label: 'The Approach', content: cs.approach },
    { label: 'The Outcome', content: cs.outcome },
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
    <div ref={containerRef} className="home-scene overflow-x-clip">
      <Nav />

      {/* ── 1a. HERO — STATEMENT ─────────────────────── */}
      <section
        id="cs-hero"
        className="home-grain relative flex min-h-screen flex-col justify-center overflow-hidden px-4 sm:px-8"
      >
        <motion.div
          className="relative z-10 mx-auto w-full max-w-5xl"
          style={{ rotateX: heroRotateX, rotateY: heroRotateY, transformPerspective: 1000 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex items-center gap-3"
          >
            <span className="home-index text-sm">{String(currentIndex + 1).padStart(2, '0')}</span>
            <span className="home-kicker">Case Study</span>
          </motion.div>

          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
              className={`home-heading ${titleSizeClass} font-extrabold`}
              style={{ color: accent }}
            >
              {displayTitle}
            </motion.h1>
          </div>

          {/* Category chips + links */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            {(Array.isArray(project.category) ? project.category : [project.category]).map(cat => (
              <span
                key={cat}
                className="rounded-xs border border-home-line bg-home-bg-raised px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-home-paper-dim"
              >
                {cat}
              </span>
            ))}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xs border px-4 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-home-bg-raised"
                style={{ borderColor: `${accent}60`, color: accent }}
              >
                <FiExternalLink size={11} /> Live Site
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xs border px-4 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-home-bg-raised"
                style={{ borderColor: `${accent}60`, color: accent }}
              >
                <FiGithub size={11} /> Source
              </a>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="absolute bottom-10 left-4 z-10 flex items-center gap-3 sm:left-8"
        >
          <span className="home-kicker">Scroll</span>
          <span className="relative h-10 w-px overflow-hidden bg-home-line">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-home-volt" />
          </span>
        </motion.div>
      </section>

      {/* ── 1b. PROOF ─────────────────────────────────── */}
      {project.image && (
        <section className="border-t border-home-line">
          <div className="aspect-4/3 w-full overflow-hidden bg-home-bg-raised sm:aspect-video lg:aspect-21/9">
            <motion.img
              src={project.image}
              alt={`${project.title} interface`}
              className="h-full w-full object-cover object-top"
              loading="eager"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          </div>
        </section>
      )}

      {/* ── 2. OVERVIEW ──────────────────────────────── */}
      <section className="border-t border-home-line py-32">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
        >
          <span className="home-kicker">Overview</span>
          <p className="mt-6 text-2xl leading-relaxed text-home-paper lg:text-3xl">{cs.overview}</p>
        </motion.div>
      </section>

      {/* ── 3. CHALLENGE / APPROACH / OUTCOME ─────────── */}
      {panels.map((panel, i) => (
        <motion.section
          key={panel.label}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="border-t border-home-line py-24"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="home-index text-sm">0{i + 1}</span>
              <span className="home-kicker">{panel.label}</span>
            </div>
            <p className="max-w-3xl text-xl leading-relaxed text-home-paper md:text-2xl">
              {panel.content}
            </p>
          </div>
        </motion.section>
      ))}

      {/* ── 4. STATS ─────────────────────────────────── */}
      {project.stats && project.stats.length > 0 && (
        <section className="border-y border-home-line py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              {project.stats.map((stat, statIdx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.55, delay: statIdx * 0.09, ease: EASE }}
                  className="rounded-xs border border-home-line bg-home-bg-raised p-8 text-center"
                >
                  <div
                    className="cs-stat-value text-5xl font-extrabold text-home-ember md:text-6xl"
                    data-value={stat.value}
                  >
                    0
                  </div>
                  <p className="mt-3 text-sm text-home-paper-dim">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. STACK ─────────────────────────────────── */}
      <section id="cs-tech" className="border-t border-home-line py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: EASE }}
          className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
        >
          <span className="home-kicker">Stack</span>
          {project.techBrief && (
            <p className="mt-6 mb-10 text-lg leading-relaxed text-home-paper-dim">
              {project.techBrief}
            </p>
          )}
          <div className="flex flex-wrap gap-2.5">
            {project.tags.map((tag) => {
              const iconEntry = tagIconMap[tag];
              const iconColor = iconEntry?.color ?? accent;
              return (
                <span
                  key={tag}
                  className="flex items-center gap-2 rounded-xs border border-home-line bg-home-bg-raised px-4 py-2 text-sm font-medium text-home-paper-dim"
                >
                  {iconEntry
                    ? <iconEntry.Icon size={14} style={{ color: iconColor }} />
                    : <FiCode size={13} style={{ color: accent }} />
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
        <section className="border-t border-home-line py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mb-10"
            >
              <span className="home-kicker">Gallery</span>
            </motion.div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((src, i) => (
                <motion.button
                  key={src + i}
                  onClick={() => setLightboxIndex(i)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: EASE }}
                  className="group block w-full rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-volt"
                  aria-label={`View image ${i + 1}`}
                >
                  <div className="aspect-video w-full overflow-hidden rounded-xs bg-home-bg-raised">
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
        className="border-t border-home-line py-24"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65, ease: EASE }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <span className="home-kicker">Next Project</span>
          <button
            onClick={transitionToNextCaseStudy}
            disabled={isTransitioning}
            className="group mt-6 block w-full text-left disabled:cursor-wait disabled:opacity-80"
          >
            <div className="relative overflow-hidden rounded-xs border border-home-line bg-home-bg-raised transition-colors duration-300 group-hover:border-home-paper-dim">
              {/* Background image */}
              {nextProject.image && (
                <div className="absolute inset-0">
                  <img
                    src={nextProject.image}
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover object-top opacity-10 blur-sm transition-opacity duration-300 group-hover:opacity-20"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-home-bg-raised via-home-bg-raised/85 to-transparent" />
                </div>
              )}
              <div className="relative flex items-center justify-between gap-8 p-8 md:p-12">
                <div>
                  <span className="home-kicker mb-3 block">Up Next</span>
                  <h3
                    className="home-heading text-3xl font-extrabold md:text-5xl"
                    style={{ color: nextAccent }}
                  >
                    {displayNextTitle}
                  </h3>
                  {nextProject.description && (
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-home-paper-dim">
                      {nextProject.description}
                    </p>
                  )}
                </div>
                <FiArrowRight
                  size={36}
                  className="shrink-0 text-home-paper-dim transition-transform duration-300 group-hover:translate-x-2 group-hover:text-home-volt"
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
            className="fixed inset-0 z-200 flex items-center justify-center bg-home-bg/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-4 right-4 rounded-xs border border-home-line p-2 text-home-paper-dim transition-colors hover:text-home-paper"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close lightbox"
            >
              <FiX size={22} />
            </button>
            {lightboxIndex > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-xs border border-home-line p-3 text-home-paper-dim transition-colors hover:text-home-paper"
                onClick={e => { e.stopPropagation(); setLightboxIndex(i => Math.max(0, (i ?? 0) - 1)); }}
                aria-label="Previous image"
              >
                <FiChevronLeft size={26} />
              </button>
            )}
            {lightboxIndex < galleryImages.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xs border border-home-line p-3 text-home-paper-dim transition-colors hover:text-home-paper"
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
              className="max-h-[85vh] max-w-[90vw] rounded-xs object-contain"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-xs border border-home-line px-4 py-1.5 font-mono text-xs text-home-paper-dim">
              {lightboxIndex + 1} / {galleryImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-120"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <div className="absolute inset-0 bg-home-bg/85" />
            <motion.div
              className="absolute inset-x-0 top-0 h-1 bg-home-ember"
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
