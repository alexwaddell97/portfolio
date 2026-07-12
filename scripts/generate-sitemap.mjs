/**
 * Regenerates public/sitemap.xml from the site's actual routes (see
 * src/App.tsx). Static list rather than importing src/data — the other
 * generator scripts in this repo (generate-seo-pages.mjs) follow the same
 * plain-Node/no-TS-loader convention, so route data is kept in sync by hand
 * in the couple of places it's needed rather than adding a build-time
 * TS import just for this.
 */

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const BASE_URL = 'https://alexw.dev';

const routes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/lab', changefreq: 'weekly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/cv', changefreq: 'monthly', priority: '0.6' },
  // Lab experiments — canonical shortcut paths (see src/data/labs.ts
  // `path` field / src/App.tsx), not the generic /lab/:slug form.
  { path: '/f1', changefreq: 'weekly', priority: '0.5' },
  { path: '/ttr', changefreq: 'weekly', priority: '0.5' },
];

const body = routes
  .map(
    (r) =>
      `  <url>\n    <loc>${BASE_URL}${r.path}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

writeFileSync(join(root, 'public', 'sitemap.xml'), xml, 'utf8');
process.stdout.write(`✓ sitemap.xml: ${routes.length} routes\n`);
