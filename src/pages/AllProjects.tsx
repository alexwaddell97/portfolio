import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiExternalLink, FiGithub, FiArrowRight, FiLock } from 'react-icons/fi';
import Nav from '../components/Nav.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import Footer from '../components/Footer.tsx';
import projects from '../data/projects.ts';
import { labs } from '../data/labs.ts';
import type { ProjectCategory } from '../types/index.ts';

const EASE = [0.16, 1, 0.3, 1] as const;

// Derive unique tech tags from all projects
const allTags = Array.from(new Set([...projects.flatMap(p => p.tags), ...labs.flatMap(l => l.tags)])).sort();
const categories: ProjectCategory[] = ['Full-Stack', 'Frontend', 'AI / ML', 'Data & Viz'];

type DisplayItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  imageBgHex?: string;
  accentHex?: string;
  accentHexLight?: string;
  accentHexDark?: string;
  liveUrl?: string;
  repoUrl?: string;
  tags: string[];
  category: ProjectCategory | ProjectCategory[];
  href: string;
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
];

function getProjectCategories(category: ProjectCategory | ProjectCategory[]): ProjectCategory[] {
  return Array.isArray(category) ? category : [category];
}

function AllProjects() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'All'>('All');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  const displayItems = useMemo<DisplayItem[]>(() => [
    ...projects.map(p => ({ ...p, href: `/projects/${p.slug}` })),
    ...labs.map(l => ({
      id: l.slug,
      slug: l.slug,
      title: l.title,
      description: l.description,
      image: l.image ?? '',
      accentHex: l.color,
      tags: l.tags,
      category: ['Data & Viz'] as ProjectCategory[],
      href: `/projects/lab/${l.slug}`,
      liveUrl: l.path,
    })),
  ], []);

  const filtered = useMemo(() => {
    return displayItems.filter(p => {
      const projectCategories = getProjectCategories(p.category);
      const categoryMatch = activeCategory === 'All' || projectCategories.includes(activeCategory);
      const tagMatch = activeTags.size === 0 || [...activeTags].every(t => p.tags.includes(t));
      return categoryMatch && tagMatch;
    });
  }, [displayItems, activeCategory, activeTags]);

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
    <div className="home-scene flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        {/* Page header */}
        <div className="border-b border-home-line">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-32 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <Link
                to="/"
                className="home-link-volt mb-8 inline-flex items-center gap-2 text-sm text-home-paper-dim"
              >
                <FiArrowLeft size={14} /> Back to home
              </Link>
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="home-heading text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold text-home-paper">
                    All Projects
                  </h1>
                  <p className="mt-3 max-w-2xl text-base text-home-paper-dim">
                    A curated collection of projects I&rsquo;ve worked on or contributed to.
                  </p>
                  <p className="mt-3 text-home-paper-dim">
                    {filtered.length} project{filtered.length !== 1 ? 's' : ''}
                    {isFiltered && ' matching filters'}
                  </p>
                </div>
                {isFiltered && (
                  <button
                    onClick={clearFilters}
                    className="home-link-volt text-sm text-home-paper-dim"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Filter bar */}
          <div className="mb-10 flex flex-col gap-5">
            {/* Category tabs — underline indicator, matching Nav's active-item language */}
            <div className="flex flex-wrap gap-1">
              {(['All', ...categories] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
                  className={`relative cursor-pointer rounded-xs px-4 py-1.5 font-mono text-xs uppercase tracking-[0.12em] transition-colors duration-200 ${
                    activeCategory === cat
                      ? 'text-home-paper'
                      : 'text-home-paper-dim hover:text-home-paper'
                  }`}
                >
                  {activeCategory === cat && (
                    <motion.span
                      layoutId="category-underline"
                      className="absolute inset-x-3 bottom-0.5 h-0.5 bg-home-ember"
                      transition={{ duration: 0.3, ease: EASE }}
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              ))}
            </div>

            {/* Tech tag toggles — multi-select chips */}
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => {
                const active = activeTags.has(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    aria-pressed={active}
                    className={`cursor-pointer rounded-xs border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] transition-all duration-200 ${
                      active
                        ? 'border-home-ember/50 bg-home-ember/10 text-home-ember'
                        : 'border-home-line bg-home-bg-raised text-home-paper-dim hover:border-home-paper-dim hover:text-home-paper'
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
                  className="col-span-2 py-24 text-center text-home-paper-dim"
                >
                  No projects match those filters.
                </motion.div>
              ) : (
                filtered.map((project, index) => {
                  const accent = (theme === 'light'
                    ? (project.accentHexDark ?? project.accentHexLight ?? project.accentHex)
                    : project.accentHex) ?? 'var(--color-home-paper-dim)';
                  const projectCategories = getProjectCategories(project.category);
                  const primaryCategory = projectCategories[0];
                  const extraCategoryCount = Math.max(0, projectCategories.length - 1);
                  const openCaseStudy = () => navigate(project.href);
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
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.45, ease: EASE, delay: Math.min(index, 7) * 0.05 }}
                      whileHover={{ y: -3 }}
                      className="group relative cursor-pointer rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-volt focus-visible:ring-offset-2 focus-visible:ring-offset-home-bg"
                    >
                      {/* Image panel */}
                      <div
                        className="relative overflow-hidden rounded-xs bg-home-bg-raised"
                        style={{ aspectRatio: '16/9', backgroundColor: project.imageBgHex }}
                      >
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.title}
                            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-home-bg-raised">
                            <span
                              className="select-none text-[clamp(3rem,10vw,6rem)] font-extrabold leading-none opacity-20"
                              style={{ color: accent }}
                            >
                              {project.title[0]}
                            </span>
                          </div>
                        )}

                        {/* Hover overlay — flat, no blur */}
                        <div className="absolute inset-0 flex items-center justify-center bg-home-bg/75 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <div
                            className="flex items-center gap-2 rounded-xs border px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-home-paper"
                            style={{ borderColor: `${accent}60`, background: `${accent}15` }}
                          >
                            View Case Study
                            <FiArrowRight size={14} />
                          </div>
                        </div>

                        {/* Category badge */}
                        <div className="absolute top-3 right-3 rounded-xs border border-home-line bg-home-bg px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-home-paper-dim">
                          {primaryCategory}
                          {extraCategoryCount > 0 && ` +${extraCategoryCount}`}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mt-4 px-1">
                        <h2
                          className="text-xl font-extrabold leading-tight"
                          style={{ color: accent }}
                        >
                          {project.title}
                        </h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-home-paper-dim line-clamp-2">
                          {project.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1.5">
                            {project.tags.map(tag => (
                              <span
                                key={tag}
                                className="rounded-xs border border-home-line bg-home-bg-raised px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-home-paper-dim"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex shrink-0 items-center gap-3 pl-3">
                            {project.liveUrl && (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                aria-label={`Open live site for ${project.title}`}
                                className="text-home-paper-dim transition-colors hover:text-home-volt"
                              >
                                <FiExternalLink size={14} />
                              </a>
                            )}
                            {project.repoUrl && (
                              <a
                                href={project.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                aria-label={`Open source code for ${project.title}`}
                                className="text-home-paper-dim transition-colors hover:text-home-volt"
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

          <section className="mt-16 border-t border-home-line pt-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: EASE }}
              className="max-w-4xl"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-xs border border-home-line bg-home-bg-raised px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-home-paper-dim">
                <FiLock size={12} />
                Confidential client work
              </div>
              <h2 className="home-heading text-3xl font-extrabold text-home-paper md:text-4xl">
                Selected Client Work
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-home-paper-dim">
                Bespoke projects delivered under confidentiality agreements. Summaries are limited to NDA-safe scope and outcomes.
              </p>
            </motion.div>

            <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
              {clientHighlights.map((item, idx) => (
                <motion.article
                  key={item.client}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.55, delay: idx * 0.1, ease: EASE }}
                  className="rounded-xs border border-home-line bg-home-bg-raised p-5"
                >
                  <div className="home-kicker mb-3 inline-flex items-center gap-1.5">
                    <FiLock size={10} />
                    NDA-safe summary
                  </div>
                  <h3 className="text-base font-semibold text-home-paper">{item.client}</h3>
                  <p className="home-kicker mt-1">{item.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-home-paper-dim">{item.scope}</p>
                  <p className="mt-2 text-sm leading-relaxed text-home-paper-dim">{item.impact}</p>
                </motion.article>
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
