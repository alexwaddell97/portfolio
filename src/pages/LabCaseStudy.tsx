import { useLayoutEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiExternalLink, FiArrowRight } from 'react-icons/fi';
import {
  SiReact, SiTypescript, SiVite,
} from 'react-icons/si';
import type { IconType } from 'react-icons';
import { FiCode } from 'react-icons/fi';
import Nav from '../components/Nav.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { labs } from '../data/labs.ts';

const tagIconMap: Record<string, { Icon: IconType; color: string }> = {
  'React':         { Icon: SiReact,      color: '#61dafb' },
  'TypeScript':    { Icon: SiTypescript, color: '#3178c6' },
  'Vite':          { Icon: SiVite,       color: '#646cff' },
};

function LabCaseStudy() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const labIndex = labs.findIndex(l => l.slug === slug);
  const lab = labs[labIndex];
  const nextLab = labs[(labIndex + 1) % labs.length];

  useLayoutEffect(() => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    const raf = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      window.setTimeout(() => {
        root.style.scrollBehavior = prev;
      }, 0);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [slug]);

  if (!lab || !lab.caseStudy) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary text-text-secondary gap-4">
        <p className="text-xl">Lab not found.</p>
        <button onClick={() => navigate('/projects')} className="btn-outline">Back to projects</button>
      </div>
    );
  }

  const cs = lab.caseStudy;
  const accentColor = lab.color;
  const isLight = theme === 'light';

  const titleLen = lab.title.length;
  const titleSizeClass =
    titleLen > 40
      ? 'text-[clamp(1.8rem,5.5vw,3.2rem)]'
      : titleLen > 24
        ? 'text-[clamp(2.6rem,7.5vw,5rem)]'
        : 'text-[clamp(3.2rem,9vw,9rem)]';

  const panels = [
    { label: 'The Challenge', content: cs.challenge, color: 'var(--color-cyan)' },
    { label: 'The Approach',  content: cs.approach,  color: 'var(--color-violet)' },
    { label: 'The Outcome',   content: cs.outcome,   color: 'var(--color-pink)' },
  ];

  return (
    <div className="bg-bg-primary text-text-primary overflow-x-clip">
      <Nav />

      {/* ── 1. HERO ──────────────────────────────────── */}
      <section className="dot-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
        {/* Cinematic image backdrop */}
        {lab.image && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={lab.image}
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

        {/* Glow */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-40"
          style={{ background: `radial-gradient(circle, ${accentColor}55 0%, transparent 70%)` }}
        />

        <div className="relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-sm font-semibold tracking-[0.2em] uppercase text-text-muted"
          >
            Lab Experiment
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
            className={`display-heading-safe ${titleSizeClass} font-black tracking-tighter`}
            style={{ color: accentColor }}
          >
            {lab.title}
          </motion.h1>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <span
              className="rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase backdrop-blur-md"
              style={{
                borderColor: `${accentColor}60`,
                background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)',
                color: isLight ? '#111' : 'var(--color-text-secondary)',
              }}
            >
              Data &amp; Viz
            </span>
            <a
              href={lab.path}
              className="flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase backdrop-blur-md transition-opacity hover:opacity-80"
              style={{
                borderColor: `${accentColor}80`,
                color: accentColor,
                background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)',
              }}
            >
              <FiExternalLink size={11} /> View Lab
            </a>
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
          <p className="mb-6 text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: accentColor }}>
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
          <div
            className="pointer-events-none absolute top-0 right-0 h-96 w-96 opacity-[0.07] blur-3xl"
            style={{ background: panel.color }}
          />
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className={`grid items-start gap-16 ${i % 2 === 1 ? 'md:grid-cols-[1fr_280px]' : 'md:grid-cols-[280px_1fr]'}`}>
              <div className={i % 2 === 1 ? 'md:order-2 md:text-right' : ''}>
                <span
                  className="block select-none text-[8rem] font-black leading-none opacity-[0.07]"
                  style={{ color: panel.color }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mt-2 text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: panel.color }}>
                  {panel.label}
                </p>
              </div>
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

      {/* ── 4. STACK ─────────────────────────────────── */}
      <section className="border-t border-border py-24">
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
          {cs.techBrief && (
            <p className="mb-10 text-lg leading-relaxed text-text-secondary">{cs.techBrief}</p>
          )}
          <div className="flex flex-wrap gap-2.5">
            {lab.tags.map(tag => {
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

      {/* ── 5. VIEW LAB CTA ──────────────────────────── */}
      <section className="border-t border-border py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
        >
          <a
            href={lab.path}
            className="inline-flex items-center gap-3 rounded-2xl border px-8 py-4 text-base font-semibold transition-all duration-200 hover:opacity-80"
            style={{
              borderColor: `${accentColor}60`,
              color: accentColor,
              background: `${accentColor}12`,
            }}
          >
            <FiExternalLink size={16} />
            Open {lab.title}
          </a>
        </motion.div>
      </section>

      {/* ── 6. NEXT LAB ──────────────────────────────── */}
      {nextLab && nextLab.slug !== lab.slug && (
        <motion.section
          className="border-t border-border py-24"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="mb-8 text-xs font-semibold tracking-[0.2em] uppercase text-text-muted">
              Next Lab
            </p>
            <Link
              to={`/projects/lab/${nextLab.slug}`}
              className="group block"
            >
              <div
                className="relative overflow-hidden rounded-2xl border bg-bg-card transition-all duration-300"
                style={{ borderColor: `${nextLab.color}44`, boxShadow: `0 0 40px ${nextLab.color}12` }}
              >
                {/* Background image */}
                {nextLab.image && (
                  <div className="absolute inset-0">
                    <img
                      src={nextLab.image}
                      alt=""
                      aria-hidden
                      className="h-full w-full object-cover object-top opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-35"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-bg-card via-bg-card/85 to-transparent" />
                  </div>
                )}
                <div className="relative flex items-center justify-between gap-8 p-8 md:p-12">
                  <div>
                    <span
                      className="mb-3 block text-xs font-semibold tracking-[0.2em] uppercase"
                      style={{ color: nextLab.color }}
                    >
                      Up Next
                    </span>
                    <h3
                      className="display-heading-safe text-3xl font-black md:text-5xl"
                      style={{ color: nextLab.color }}
                    >
                      {nextLab.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">
                      {nextLab.description}
                    </p>
                  </div>
                  <FiArrowRight
                    size={36}
                    className="shrink-0 transition-transform duration-300 group-hover:translate-x-2"
                    style={{ color: nextLab.color }}
                  />
                </div>
              </div>
            </Link>
          </div>
        </motion.section>
      )}

      {/* ── BACK LINK ────────────────────────────────── */}
      <div className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/projects"
            className="hover-underline-accent inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <FiArrowLeft size={14} /> Back to projects
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LabCaseStudy;
