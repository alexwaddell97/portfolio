/**
 * Post-build script: generates per-route index.html files with correct
 * OpenGraph / Twitter Card / SEO meta tags for project case studies and blog posts.
 *
 * Social crawlers (LinkedIn, Twitter, Slack etc.) don't execute JS.
 * Vercel serves real files before the catchall rewrite, so placing
 * dist/projects/{slug}/index.html and dist/blog/{slug}/index.html
 * ensures crawlers receive route-specific OG data.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const BASE_URL = 'https://alexw.dev';

// ─── helpers ──────────────────────────────────────────────────────────────────

function escape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function injectMeta(html, { title, description, url, image, type = 'website' }) {
  const safeTitle = escape(title);
  const safeDesc = escape(description);
  const safeUrl = escape(url);
  const safeImg = escape(image);

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`)
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${safeDesc}$2`,
    )
    .replace(
      /(<meta property="og:title" content=")[^"]*(")/,
      `$1${safeTitle}$2`,
    )
    .replace(
      /(<meta property="og:description" content=")[^"]*(")/,
      `$1${safeDesc}$2`,
    )
    .replace(
      /(<meta property="og:url" content=")[^"]*(")/,
      `$1${safeUrl}$2`,
    )
    .replace(
      /(<meta property="og:image" content=")[^"]*(")/,
      `$1${safeImg}$2`,
    )
    .replace(
      /(<meta property="og:type" content=")[^"]*(")/,
      `$1${type}$2`,
    )
    .replace(
      /(<meta name="twitter:title" content=")[^"]*(")/,
      `$1${safeTitle}$2`,
    )
    .replace(
      /(<meta name="twitter:description" content=")[^"]*(")/,
      `$1${safeDesc}$2`,
    )
    .replace(
      /(<meta name="twitter:image" content=")[^"]*(")/,
      `$1${safeImg}$2`,
    )
    .replace(
      /(<meta property="og:image:alt" content=")[^"]*(")/,
      `$1${safeTitle}$2`,
    )
    .replace(
      /(<link rel="canonical" href=")[^"]*(")/,
      `$1${safeUrl}$2`,
    );
}

function writeRoute(distDir, routePath, html) {
  const dir = join(distDir, routePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
}

// ─── extract project data from source TS ──────────────────────────────────────

function extractProjects() {
  const src = readFileSync(join(root, 'src/data/projects.ts'), 'utf8');

  // Split on top-level object boundaries — each project starts with `{` after a `,` or `[`
  // Strategy: find all slug occurrences and extract the surrounding block
  const projectRegex =
    /slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?description:\s*\n?\s*'([\s\S]*?)',\s*\n\s*image:\s*'([^']+)'/g;

  const projects = [];
  let match;
  while ((match = projectRegex.exec(src)) !== null) {
    const [, slug, title, description, image] = match;
    // Collapse multiline string into single line
    const desc = description.replace(/\s*'\s*\+\s*'/g, ' ').replace(/\s+/g, ' ').trim();
    projects.push({ slug, title, description: desc, image });
  }

  return projects;
}

// ─── extract blog post frontmatter ────────────────────────────────────────────

function extractPosts() {
  const blogDir = join(root, 'src/content/blog');
  const files = readdirSync(blogDir).filter(f => f.endsWith('.md'));

  const posts = [];

  for (const file of files) {
    const raw = readFileSync(join(blogDir, file), 'utf8');
    const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) continue;

    const fm = fmMatch[1];

    // Skip hidden/draft
    if (/status:\s*hidden/i.test(fm) || /draft:\s*true/i.test(fm)) continue;

    const slugMatch = fm.match(/slug:\s*([^\r\n]+)/);
    const titleMatch = fm.match(/title:\s*['"]?([^'"\r\n]+)['"]?/);
    const excerptMatch = fm.match(/excerpt:\s*(.+)/);

    const fileSlug = file.replace(/\.md$/, '');
    const slug = slugMatch ? slugMatch[1].trim().replace(/^['"]|['"]$/g, '') : fileSlug;
    const title = titleMatch ? titleMatch[1].trim().replace(/^['"]|['"]$/g, '') : fileSlug;
    const excerpt = excerptMatch
      ? excerptMatch[1].trim().replace(/^['"]|['"]$/g, '')
      : 'A post by Alex Waddell on software development.';

    posts.push({ slug, title, excerpt });
  }

  return posts;
}

// ─── main ─────────────────────────────────────────────────────────────────────

const distDir = join(root, 'dist');
const baseHtml = readFileSync(join(distDir, 'index.html'), 'utf8');

// Project case studies
const projects = extractProjects();
let projectCount = 0;
for (const project of projects) {
  const url = `${BASE_URL}/projects/${project.slug}`;
  const image = `${BASE_URL}${project.image}`;
  const title = `${project.title} — Case Study | alexw.dev`;
  const description = project.description;

  const html = injectMeta(baseHtml, { title, description, url, image, type: 'article' });
  writeRoute(distDir, `projects/${project.slug}`, html);
  projectCount++;
}

// Blog posts
const posts = extractPosts();
let postCount = 0;
for (const post of posts) {
  const url = `${BASE_URL}/blog/${post.slug}`;
  const image = `${BASE_URL}/og-image.png`;
  const title = `${post.title} | alexw.dev`;
  const description = post.excerpt;

  const html = injectMeta(baseHtml, { title, description, url, image, type: 'article' });
  writeRoute(distDir, `blog/${post.slug}`, html);
  postCount++;
}

console.log(`✓ SEO pages: ${projectCount} project routes, ${postCount} blog routes generated`);

// Lab experiments
const LAB_EXPERIMENTS = [
  {
    slug: 'f1-dashboard',
    title: 'F1 Dashboard',
    description: 'Lap times, tyre strategy, position charts and race control feed for any session — powered by the OpenF1 API.',
    image: '/images/og-lab-f1-dashboard.png',
  },
  {
    slug: 'ttr-dashboard',
    title: 'TTR Newcastle',
    description: 'Live standings and fixtures for Try Tag Rugby Newcastle leagues — The Parks and RGS Wednesday & Thursday.',
    image: '/images/og-lab-ttr-dashboard.png',
  },
];

let labCount = 0;
for (const lab of LAB_EXPERIMENTS) {
  const url = `${BASE_URL}/lab/${lab.slug}`;
  const image = `${BASE_URL}${lab.image}`;
  const title = `${lab.title} | alexw.dev`;
  const html = injectMeta(baseHtml, { title, description: lab.description, url, image });
  writeRoute(distDir, `lab/${lab.slug}`, html);
  labCount++;
}

console.log(`✓ Lab SEO pages: ${labCount} routes generated`);
