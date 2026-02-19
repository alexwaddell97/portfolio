import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiArrowRight } from 'react-icons/fi';
import Nav from '../components/Nav.tsx';
import Footer from '../components/Footer.tsx';
import posts from '../data/posts.ts';
import type { BlogTag } from '../types/index.ts';

const allTags = Array.from(new Set(posts.flatMap(p => p.tags))).sort() as BlogTag[];

const tagColor: Record<BlogTag, string> = {
  Dev: 'bg-cyan/10 text-cyan border-cyan/20',
  Architecture: 'bg-violet/10 text-text-primary border-violet/20',
  Career: 'bg-pink/10 text-pink border-pink/20',
  Life: 'bg-pink/10 text-pink border-pink/20',
  AI: 'bg-cyan/10 text-cyan border-cyan/20',
  'Open Source': 'bg-violet/10 text-text-primary border-violet/20',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function Blog() {
  const [activeTag, setActiveTag] = useState<BlogTag | 'All'>('All');

  const filtered = useMemo(() =>
    activeTag === 'All' ? posts : posts.filter(p => p.tags.includes(activeTag)),
    [activeTag]
  );

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Nav />
      <main className="flex-1">
        {/* Header */}
        <div className="dot-grid border-b border-border">
          <div className="mx-auto max-w-3xl px-4 pb-12 pt-32 sm:px-6 lg:px-8">
            <h1 className="gradient-text-violet-pink display-heading-safe text-5xl font-black tracking-tighter md:text-7xl">
              Writing
            </h1>
            <p className="mt-4 text-lg text-text-secondary">
              Dev deep-dives, architecture notes, mentoring lessons, and career reflections.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Tag filter */}
        <div className="mb-10 flex flex-wrap gap-2">
          {(['All', ...allTags] as const).map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              aria-pressed={activeTag === tag}
              className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                activeTag === tag ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {activeTag === tag && (
                <motion.span
                  layoutId="blog-tag-pill"
                  className="absolute inset-0 rounded-full bg-white/8 border border-border"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tag}</span>
            </button>
          ))}
        </div>

        {/* Post list */}
        <div className="flex flex-col divide-y divide-border">
          <AnimatePresence mode="popLayout">
            {filtered.map((post, i) => (
              <motion.article
                key={post.slug}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] as const }}
                className="group py-8"
              >
                <Link to={`/blog/${post.slug}`} className="block">
                  {/* Tags + meta */}
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="text-xs text-text-secondary">{formatDate(post.date)}</span>
                    <span className="text-text-secondary/60" aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <FiClock size={11} />
                      {post.readTime} min read
                    </span>
                    <span className="text-text-secondary/60" aria-hidden="true">·</span>
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${tagColor[tag]}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-text-primary transition-colors group-hover:text-text-primary md:text-2xl">
                    <span className="gradient-text-violet-pink">{post.title}</span>
                  </h2>

                  {/* Excerpt */}
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Read more */}
                  <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors group-hover:text-violet">
                    Read post
                    <FiArrowRight
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Blog;
