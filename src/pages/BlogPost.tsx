import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiArrowRight } from 'react-icons/fi';
import Nav from '../components/Nav.tsx';
import Footer from '../components/Footer.tsx';
import posts from '../data/posts.ts';
import type { BlogTag } from '../types/index.ts';

const tagColorMap: Record<string, string> = {
  Dev: 'bg-cyan/10 text-cyan border-cyan/20',
  Architecture: 'bg-violet/10 text-violet border-violet/20',
  Career: 'bg-pink/10 text-pink border-pink/20',
  Life: 'bg-pink/10 text-pink border-pink/20',
  AI: 'bg-cyan/10 text-cyan border-cyan/20',
  'Open Source': 'bg-violet/10 text-violet border-violet/20',
};

function getTagColor(tag: BlogTag): string {
  return tagColorMap[tag] ?? 'bg-violet/10 text-violet border-violet/20';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-60 h-0.5 bg-border">
      <div
        className="h-full transition-[width] duration-75"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #06b6d4, #7c3aed)',
        }}
      />
    </div>
  );
}

function renderContent(content: string) {
  const blocks = content.split('\n\n').filter(Boolean);

  return blocks.map((block, i) => {
    if (block.startsWith('## ')) {
      return (
        <h2
          key={i}
          className="mt-10 mb-4 text-2xl font-bold tracking-tight text-text-primary"
        >
          {block.slice(3)}
        </h2>
      );
    }
    if (block.startsWith('### ')) {
      return (
        <h3 key={i} className="mt-8 mb-3 text-xl font-semibold text-text-primary">
          {block.slice(4)}
        </h3>
      );
    }
    return (
      <p
        key={i}
        className={`leading-[1.85] text-text-primary ${i === 0 ? 'text-lg' : 'text-base'}`}
      >
        {block}
      </p>
    );
  });
}

function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = posts.find(p => p.slug === slug);
  const currentIndex = posts.findIndex(p => p.slug === slug);
  const nextPost = posts[currentIndex + 1] ?? null;

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary text-text-secondary gap-4">
        <p className="text-xl">Post not found.</p>
        <Link to="/blog" className="hover-underline-accent text-cyan transition-colors hover:text-cyan/80">
          Back to writing
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <ReadingProgress />
      <Nav />

      <main className="flex-1">
        {/* Hero header with dot grid + ambient orbs */}
        <div className="relative dot-grid border-b border-border overflow-hidden">
          <div className="pointer-events-none absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-violet opacity-[0.07] blur-3xl" />
          <div className="pointer-events-none absolute top-8 right-1/4 h-48 w-48 rounded-full bg-pink opacity-[0.05] blur-3xl" />

          <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link
                to="/blog"
                className="hover-underline-accent mb-8 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-cyan"
              >
                <FiArrowLeft size={14} /> All posts
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="text-sm text-text-secondary">{formatDate(post.date)}</span>
                <span className="text-text-secondary/60" aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <FiClock size={12} />
                  {post.readTime} min read
                </span>
              </div>

              <h1 className="page-heading-sweep display-heading-safe text-4xl font-black leading-tight tracking-tight md:text-5xl">
                {post.title}
              </h1>

              <p className="mt-4 text-lg leading-relaxed text-text-secondary">
                {post.excerpt}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getTagColor(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Article body */}
        <article className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {renderContent(post.content)}
          </motion.div>

          {/* Next post card */}
          {nextPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
              className="mt-20"
            >
              <p className="mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-text-muted">
                Next Post
              </p>
              <Link
                to={`/blog/${nextPost.slug}`}
                className="group block rounded-2xl border border-border bg-bg-card p-6 transition-colors hover:border-cyan/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="gradient-text-cyan-violet text-xl font-bold leading-snug md:text-2xl">
                      {nextPost.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary line-clamp-2">
                      {nextPost.excerpt}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors group-hover:text-cyan">
                      Read post
                      <FiArrowRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="flex items-center gap-1 text-xs text-text-muted whitespace-nowrap">
                      <FiClock size={11} />
                      {nextPost.readTime} min
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}

export default BlogPost;
