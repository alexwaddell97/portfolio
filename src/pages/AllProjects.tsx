import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiExternalLink, FiGithub, FiArrowRight, FiLock } from 'react-icons/fi';
import Nav from '../components/Nav.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import Footer from '../components/Footer.tsx';
import projects from '../data/projects.ts';
import type { ProjectCategory } from '../types/index.ts';

// Derive unique tech tags from all projects
const allTags = Array.from(new Set(projects.flatMap(p => p.tags))).sort();
const categories: ProjectCategory[] = ['Full-Stack', 'Frontend', 'AI / ML', 'Data & Viz'];

const accentColor: Record<string, string> = {
  cyan: 'var(--color-cyan)',
  violet: 'var(--color-violet)',
  pink: 'var(--color-pink)',
};

const tagClass: Record<string, string> = {
  cyan: 'bg-cyan/10 text-cyan border-cyan/20',
  violet: 'bg-violet/10 text-violet border-violet/20',
  pink: 'bg-pink/10 text-pink border-pink/20',
};

const imageBorderClass: Record<string, string> = {
  cyan: 'gradient-border-cyan glow-cyan',
  violet: 'gradient-border-violet glow-violet',
  pink: 'gradient-border-pink glow-pink',
};

const placeholderGradient: Record<string, string> = {
  cyan: 'from-cyan/20 via-cyan/5 to-transparent',
  violet: 'from-violet/20 via-violet/5 to-transparent',
  pink: 'from-pink/20 via-pink/5 to-transparent',
};

const gradientTextClass: Record<string, string> = {
  cyan: 'gradient-text-cyan-violet',
  violet: 'gradient-text-violet-pink',
  pink: 'gradient-text-violet-pink',
};

const clientHighlights = [
  {
    client: 'De La Rue (via Boxmodel)',
    role: 'Frontend Developer',
    scope: 'Bespoke web experience delivered under strict brand and security constraints.',
    impact: 'Improved performance and accessibility while shipping to tight timelines.',
  },
  {
    client: 'Enterprise platform client (via Boxmodel)',
    role: 'Frontend Developer',
    scope: 'Component-led UI work for a high-stakes product area with evolving requirements.',
    impact: 'Raised UI consistency and reduced implementation churn through reusable patterns.',
  },
  {
    client: 'Public-sector digital service (via Boxmodel)',
    role: 'Frontend Developer',
    scope: 'Accessible interfaces for complex user journeys across responsive breakpoints.',
    impact: 'Improved task completion clarity and strengthened WCAG-aligned UX decisions.',
  },
];

function getProjectCategories(category: ProjectCategory | ProjectCategory[]): ProjectCategory[] {
  return Array.isArray(category) ? category : [category];
}

function AllProjects() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'All'>('All');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const projectCategories = getProjectCategories(p.category);
      const categoryMatch = activeCategory === 'All' || projectCategories.includes(activeCategory);
      const tagMatch = activeTags.size === 0 || [...activeTags].every(t => p.tags.includes(t));
      return categoryMatch && tagMatch;
    });
  }, [activeCategory, activeTags]);

  function toggleTag(tag: string) {
    setActiveTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) { next.delete(tag); } else { next.add(tag); }
      return next;
    });
  }

  function clearFilters() {
    setActiveCategory('All');
    setActiveTags(new Set());
  }

  const isFiltered = activeCategory !== 'All' || activeTags.size > 0;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Nav />
      <main className="flex-1">
        {/* Page header */}
        <div className="dot-grid border-b border-border">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-32 sm:px-6 lg:px-8">
            <Link
              to="/"
              className="hover-underline-accent mb-8 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-cyan"
            >
              <FiArrowLeft size={14} /> Back to home
            </Link>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="page-heading-sweep display-heading-safe text-5xl font-black tracking-tighter md:text-7xl">
                  All Projects
                </h1>
                <p className="mt-3 text-lg text-text-secondary">
                  {filtered.length} project{filtered.length !== 1 ? 's' : ''}
                  {isFiltered && ' matching filters'}
                </p>
              </div>
              {isFiltered && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Filter bar */}
        <div className="mb-10 flex flex-col gap-5">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {(['All', ...categories] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={`relative cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  activeCategory === cat
                    ? 'text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {activeCategory === cat && (
                  <motion.span
                    layoutId="category-pill"
                    className="absolute inset-0 rounded-full bg-white/8 border border-border"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            ))}
          </div>

          {/* Tech tag toggles */}
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => {
              const active = activeTags.has(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={active}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${
                    active
                      ? 'border-cyan/40 bg-cyan/10 text-cyan'
                      : 'border-border bg-bg-card text-text-secondary hover:border-border hover:text-text-primary'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Project grid */}
        <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-2 py-24 text-center text-text-muted"
              >
                No projects match those filters.
              </motion.div>
            ) : (
              filtered.map((project) => {
                const accent = project.accentColor;
                const hasCustomAccent = Boolean(project.accentHex);
                const color = hasCustomAccent
                  ? (theme === 'light' ? (project.accentHexLight ?? project.accentHex!) : project.accentHex!)
                  : accentColor[accent];
                const projectCategories = getProjectCategories(project.category);
                const primaryCategory = projectCategories[0];
                const extraCategoryCount = Math.max(0, projectCategories.length - 1);
                const openCaseStudy = () => navigate(`/projects/${project.slug}`);
                return (
                  <motion.div
                    key={project.id}
                    layout
                    onClick={openCaseStudy}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openCaseStudy();
                      }
                    }}
                    tabIndex={0}
                    aria-label={`Open case study for ${project.title}`}
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
                    whileHover={{ y: -3 }}
                    className="group relative cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
                  >
                    {/* Image panel */}
                    <div
                      className={`relative overflow-hidden rounded-2xl bg-bg-secondary ${hasCustomAccent ? 'border' : imageBorderClass[accent]}`}
                      style={{
                        aspectRatio: '16/9',
                        backgroundColor: project.imageBgHex,
                        borderColor: hasCustomAccent ? `${color}66` : undefined,
                        boxShadow: hasCustomAccent ? `0 0 0 1px ${color}22, 0 0 30px ${color}20` : undefined,
                      }}
                    >
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div
                          className={`flex h-full w-full items-center justify-center ${hasCustomAccent ? '' : `bg-gradient-to-br ${placeholderGradient[accent]}`}`}
                          style={hasCustomAccent ? { background: `linear-gradient(135deg, ${color}22, transparent 70%)` } : undefined}
                        >
                          <div className="absolute inset-0 dot-grid opacity-30" />
                          <span
                            className="relative select-none text-[clamp(4rem,12vw,8rem)] font-black leading-[1.05] opacity-15"
                            style={{ color }}
                          >
                            {project.title[0]}
                          </span>
                          <div
                            className="pointer-events-none absolute inset-0"
                            style={{ background: `radial-gradient(ellipse 70% 70% at 50% 50%, ${color}15, transparent)` }}
                          />
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 rounded-2xl">
                        <div
                          className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold text-white"
                          style={{ borderColor: `${color}60`, background: `${color}15` }}
                        >
                          View Case Study
                          <FiArrowRight size={14} />
                        </div>
                      </div>

                      {/* Category badge */}
                      <div className="absolute top-3 right-3 rounded-full border border-border/80 bg-bg-primary/85 px-2.5 py-1 text-xs font-semibold text-text-primary backdrop-blur-sm">
                        {primaryCategory}
                        {extraCategoryCount > 0 && (
                          <span className="ml-1 text-text-secondary">+{extraCategoryCount}</span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mt-4 px-1">
                      <h2
                        className={`${hasCustomAccent ? '' : gradientTextClass[accent]} text-xl font-bold leading-tight`}
                        style={hasCustomAccent ? { color } : undefined}
                      >
                        {project.title}
                      </h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-text-secondary line-clamp-2">
                        {project.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {project.tags.map(tag => (
                            <span
                              key={tag}
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${hasCustomAccent ? 'bg-bg-card text-text-primary' : tagClass[accent]}`}
                              style={hasCustomAccent ? { borderColor: `${color}55`, background: `${color}12` } : undefined}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex shrink-0 items-center gap-3 pl-3">
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            aria-label={`Open live site for ${project.title}`}
                            className="text-text-secondary transition-colors hover:text-text-primary"
                          >
                            <FiExternalLink size={14} />
                          </a>
                          {project.repoUrl && (
                            <a
                              href={project.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              aria-label={`Open source code for ${project.title}`}
                              className="text-text-secondary transition-colors hover:text-text-primary"
                            >
                              <FiGithub size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </motion.div>

        <section className="mt-16 border-t border-border pt-10">
          <div className="max-w-4xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-bg-card px-3 py-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
              <FiLock size={12} />
              Confidential client work
            </div>
            <h2 className="display-heading-safe text-3xl font-black tracking-tight md:text-4xl">
              Selected Client Work
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Bespoke projects delivered under confidentiality agreements. Summaries are limited to NDA-safe scope and outcomes.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
            {clientHighlights.map((item) => (
              <article
                key={item.client}
                className="rounded-2xl border border-border bg-bg-card/60 p-5"
              >
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-primary/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  <FiLock size={10} />
                  NDA-safe summary
                </div>
                <h3 className="text-base font-semibold text-text-primary">{item.client}</h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-cyan">{item.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{item.scope}</p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.impact}</p>
              </article>
            ))}
          </div>
        </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AllProjects;
