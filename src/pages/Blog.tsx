import { useState, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { FiClock, FiArrowRight } from 'react-icons/fi';
import Nav from '../components/Nav.tsx';
import Footer from '../components/Footer.tsx';
import posts from '../data/posts.ts';
import type { BlogPost, BlogTag } from '../types/index.ts';

const allTags = Array.from(new Set(posts.flatMap(p => p.tags))).sort() as BlogTag[];

const tagColor: Record<BlogTag, string> = {
  Dev: 'bg-cyan/10 text-cyan border-cyan/20',
  Architecture: 'bg-violet/10 text-violet border-violet/20',
  Career: 'bg-pink/10 text-pink border-pink/20',
  Life: 'bg-pink/10 text-pink border-pink/20',
  AI: 'bg-cyan/10 text-cyan border-cyan/20',
  'Open Source': 'bg-violet/10 text-violet border-violet/20',
};

const tagGlowRgb: Record<BlogTag, string> = {
  Dev: '6, 182, 212',
  Architecture: '124, 58, 237',
  Career: '236, 72, 153',
  Life: '236, 72, 153',
  AI: '6, 182, 212',
  'Open Source': '124, 58, 237',
};

function getGlowRgb(post: BlogPost): string {
  return tagGlowRgb[post.tags[0]] ?? '124, 58, 237';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const glowRgb = getGlowRgb(post);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springConfig = { stiffness: 220, damping: 28 };
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-5, 5]), springConfig);

  const glowX = useTransform(rawX, [-0.5, 0.5], ['10%', '90%']);
  const glowY = useTransform(rawY, [-0.5, 0.5], ['10%', '90%']);
  const glowBg = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, rgba(${glowRgb}, 0.14) 0%, transparent 65%)`;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      rawX.set((e.clientX - rect.left) / rect.width - 0.5);
      rawY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [rawX, rawY],
  );

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border border-border bg-bg-card"
    >
      {/* Mouse-tracking spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: glowBg }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      />

      <Link to={`/blog/${post.slug}`} className={`block h-full ${featured ? 'p-8 md:p-10' : 'p-6 md:p-7'}`}>
        <div className="relative z-10 flex h-full flex-col">
          {/* Meta row */}
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <span className="text-xs text-text-muted">{formatDate(post.date)}</span>
            <span className="text-text-muted/50" aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <FiClock size={11} />
              {post.readTime} min read
            </span>
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
          <h2
            className={`gradient-text-cyan-violet font-black leading-tight tracking-tight ${
              featured ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-xl md:text-2xl'
            }`}
          >
            {post.title}
          </h2>

          {/* Excerpt */}
          <p
            className={`mt-3 text-sm leading-relaxed text-text-secondary ${
              featured ? 'line-clamp-3 md:line-clamp-none' : 'line-clamp-2'
            }`}
          >
            {post.excerpt}
          </p>

          {/* Spacer pushes CTA to bottom */}
          <div className="mt-auto pt-5">
            <span className="flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors group-hover:text-cyan">
              Read post
              <FiArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function Blog() {
  const [activeTag, setActiveTag] = useState<BlogTag | 'All'>('All');

  const filtered = useMemo(
    () => (activeTag === 'All' ? posts : posts.filter(p => p.tags.includes(activeTag))),
    [activeTag],
  );

  const tagCounts = useMemo(() => {
    const counts: Partial<Record<BlogTag | 'All', number>> = { All: posts.length };
    allTags.forEach(tag => {
      counts[tag] = posts.filter(p => p.tags.includes(tag)).length;
    });
    return counts;
  }, []);

  const featuredPost = filtered[0];
  const restPosts = filtered.slice(1);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Nav />
      <main className="flex-1">
        {/* Header */}
        <div className="relative dot-grid border-b border-border overflow-hidden">
          {/* Ambient glow orbs */}
          <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-violet-glow opacity-[0.45] blur-3xl" />
          <div className="pointer-events-none absolute -top-8 right-1/4 h-56 w-56 rounded-full bg-cyan opacity-[0.05] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-cyan-glow opacity-[0.28] blur-3xl" />

          <div className="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <h1 className="page-heading-sweep display-heading-safe text-5xl font-black tracking-tighter md:text-7xl">
                Writing
              </h1>
              <p className="mt-4 max-w-xl text-lg text-text-secondary">
                Dev deep-dives, architecture notes, mentoring lessons, and career reflections.
              </p>
              <p className="mt-2 text-sm text-text-muted">{posts.length} posts</p>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Tag filter */}
          <div className="mb-10 flex flex-wrap gap-2">
            {(['All', ...allTags] as const).map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                aria-pressed={activeTag === tag}
                className={`relative cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
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
                <span className="relative z-10">
                  {tag}
                  <span className="ml-1.5 text-xs opacity-50">{tagCounts[tag]}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Posts */}
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center text-text-muted"
              >
                No posts in this category yet.
              </motion.p>
            ) : (
              <motion.div
                key={activeTag}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
              >
                {/* Featured post — full width */}
                {featuredPost && (
                  <div className="mb-5">
                    <PostCard post={featuredPost} featured />
                  </div>
                )}

                {/* Remaining posts — 2-col grid */}
                {restPosts.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {restPosts.map(post => (
                      <PostCard key={post.slug} post={post} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Blog;
