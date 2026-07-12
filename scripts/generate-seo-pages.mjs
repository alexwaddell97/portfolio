/**
 * Post-build script: generates per-route index.html files with correct
 * OpenGraph / Twitter Card / SEO meta tags for lab experiment pages.
 *
 * Social crawlers (LinkedIn, Twitter, Slack etc.) don't execute JS.
 * Vercel serves real files before the catchall rewrite, so placing
 * dist/{path}/index.html ensures crawlers receive route-specific OG data.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
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

// ─── main ─────────────────────────────────────────────────────────────────────

const distDir = join(root, 'dist');
const baseHtml = readFileSync(join(distDir, 'index.html'), 'utf8');

// Lab experiments
const LAB_EXPERIMENTS = [
  {
    slug: 'f1-dashboard',
    path: 'f1',
    title: 'F1 Dashboard',
    description: 'Lap times, tyre strategy, position charts and race control feed for any session, powered by the OpenF1 API.',
    image: '/images/og-lab-f1-dashboard.png',
  },
  {
    slug: 'ttr-dashboard',
    path: 'ttr',
    title: 'TTR Newcastle',
    description: 'Live standings and fixtures for Try Tag Rugby Newcastle leagues, running Monday, Wednesday and Thursday.',
    image: '/images/og-lab-ttr-dashboard.png',
  },
];

let labCount = 0;
for (const lab of LAB_EXPERIMENTS) {
  const url = `${BASE_URL}/${lab.path}`;
  const image = `${BASE_URL}${lab.image}`;
  const title = `${lab.title} | alexw.dev`;
  const html = injectMeta(baseHtml, { title, description: lab.description, url, image });
  writeRoute(distDir, lab.path, html);
  labCount++;
}

console.log(`✓ Lab SEO pages: ${labCount} routes generated`);
