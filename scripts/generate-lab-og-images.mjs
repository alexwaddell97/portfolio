/**
 * Generates per-lab OG images using Playwright.
 * Output: public/images/og-lab-{slug}.png
 * Usage: node scripts/generate-lab-og-images.mjs
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE_URL = 'https://alexw.dev';

const LABS = [
  {
    slug: 'ttr-dashboard',
    kicker: 'Lab Experiment · alexw.dev',
    title: 'TTR Newcastle',
    subtitle: 'Standings, fixtures and team stats for Try Tag Rugby Newcastle. The Parks on Mondays, RGS on Wednesdays and Thursdays.',
    accent1: '#d01c1c',
    accent2: '#991414',
    accent3: '#ff6b6b',
    tag: 'Tag Rugby',
    urlPath: 'ttr',
  },
  {
    slug: 'f1-dashboard',
    kicker: 'Lab Experiment · alexw.dev',
    title: 'F1 Dashboard',
    subtitle: 'Lap times, tyre strategy, position charts and race control messages for any session. Powered by the OpenF1 API.',
    accent1: '#e10600',
    accent2: '#ff6b35',
    accent3: '#ffcc00',
    tag: 'Formula 1',
    urlPath: 'f1',
  },
];

function buildHtml({ kicker, title, subtitle, accent1, accent2, accent3, tag, urlPath }) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        width: 1200px;
        height: 630px;
        overflow: hidden;
        background: #f6f6f6;
        font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        color: #111;
      }
      .frame {
        position: relative;
        width: 1200px;
        height: 630px;
        padding: 56px 64px;
        background: #f6f6f6;
      }
      .accent-bar {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 6px;
        background: linear-gradient(90deg, ${accent1}, ${accent2}, ${accent3});
      }
      .card {
        position: relative;
        height: 100%;
        border-radius: 20px;
        border: 1px solid rgba(0,0,0,0.1);
        background: #fff;
        padding: 52px 56px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 4px 32px rgba(0,0,0,0.08);
        overflow: hidden;
      }
      .card-accent {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 4px;
        background: linear-gradient(90deg, ${accent1}, ${accent2});
      }
      .dot-grid {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px);
        background-size: 24px 24px;
        opacity: 1;
      }
      .content { position: relative; }
      .kicker {
        margin: 0 0 20px;
        letter-spacing: 0.2em;
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        color: rgba(0,0,0,0.35);
      }
      .tag {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: ${accent1};
        background: ${accent1}18;
        border: 1px solid ${accent1}30;
        margin-bottom: 24px;
      }
      .title {
        margin: 0;
        font-size: 86px;
        line-height: 1.0;
        letter-spacing: -0.05em;
        font-weight: 900;
        color: #111;
      }
      .title span {
        color: ${accent1};
      }
      .subtitle {
        margin: 24px 0 0;
        max-width: 780px;
        font-size: 26px;
        line-height: 1.4;
        color: rgba(0,0,0,0.5);
        letter-spacing: -0.01em;
        font-weight: 400;
      }
      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
      }
      .url {
        font-size: 20px;
        font-weight: 600;
        color: rgba(0,0,0,0.3);
        letter-spacing: 0.02em;
      }
      .mark {
        width: 72px;
        height: 72px;
        border-radius: 16px;
        display: grid;
        place-items: center;
        background: #111;
        font-size: 32px;
        font-weight: 900;
        letter-spacing: -0.07em;
        text-transform: lowercase;
        color: #fff;
      }
    </style>
  </head>
  <body>
    <div class="frame">
      <div class="accent-bar"></div>
      <div class="card">
        <div class="dot-grid"></div>
        <div class="card-accent"></div>
        <div class="content">
          <div class="tag">${tag}</div>
          <p class="kicker">${kicker}</p>
          <h1 class="title">${title}</h1>
          <p class="subtitle">${subtitle}</p>
        </div>
        <div class="footer">
          <div class="url">alexw.dev/${urlPath}</div>
          <div class="mark">aw</div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

async function run() {
  mkdirSync('public/images', { recursive: true });
  const browser = await chromium.launch();

  for (const lab of LABS) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.setContent(buildHtml(lab));
    const outputPath = `public/images/og-lab-${lab.slug}.png`;
    await page.screenshot({ path: outputPath, type: 'png' });
    await page.close();
    process.stdout.write(`Generated ${outputPath}\n`);
  }

  await browser.close();
  process.stdout.write('Done.\n');
}

run().catch((err) => {
  process.stderr.write(`Failed: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
