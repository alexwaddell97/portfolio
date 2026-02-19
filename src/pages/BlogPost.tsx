import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiArrowRight } from 'react-icons/fi';
import Nav from '../components/Nav.tsx';
import Footer from '../components/Footer.tsx';
import posts from '../data/posts.ts';
import type { BlogTag } from '../types/index.ts';

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

function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = posts.find(p => p.slug === slug);
  const currentIndex = posts.findIndex(p => p.slug === slug);
  const nextPost = posts[currentIndex + 1] ?? null;

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary text-text-secondary gap-4">
        <p className="text-xl">Post not found.</p>
        <Link to="/blog" className="text-violet underline hover:text-violet/80">
          Back to writing
        </Link>
      </div>
    );
  }

  const paragraphs = post.content.split('\n\n').filter(Boolean);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Nav />

      <main className="flex-1">
        <article className="mx-auto w-full max-w-2xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/blog"
              className="mb-10 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-violet"
            >
              <FiArrowLeft size={14} /> All posts
            </Link>
          </motion.div>

          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            className="mb-12"
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="text-sm text-text-secondary">{formatDate(post.date)}</span>
              <span className="text-text-secondary/60" aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                <FiClock size={12} />
                {post.readTime} min read
              </span>
            </div>

            <h1 className="gradient-text-violet-pink text-4xl font-black leading-tight tracking-tight md:text-5xl">
              {post.title}
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-text-secondary">
              {post.excerpt}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${tagColor[tag]}`}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8 h-px bg-gradient-to-r from-violet/40 via-pink/20 to-transparent" />
          </motion.header>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {paragraphs.map((para, i) => (
              <p key={i} className="text-base leading-[1.85] text-text-primary">
                {para}
              </p>
            ))}
          </motion.div>

          {nextPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-20 border-t border-border pt-12"
            >
              <p className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-text-primary">
                Next Post
              </p>
              <Link
                to={`/blog/${nextPost.slug}`}
                className="group flex items-start justify-between gap-4"
              >
                <h2 className="gradient-text-violet-pink text-2xl font-bold leading-tight transition-opacity group-hover:opacity-80 md:text-3xl">
                  {nextPost.title}
                </h2>
                <FiArrowRight
                  size={22}
                  className="mt-1.5 shrink-0 text-violet transition-transform duration-200 group-hover:translate-x-1"
                />
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
