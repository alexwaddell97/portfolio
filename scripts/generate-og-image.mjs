import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const outputPath = 'public/og-image.png';

// logo.svg is a rasterised PNG wrapped in an <svg> (no vector paths to
// retint), so we pull its embedded base64 PNG out and reuse it as a CSS
// mask — same technique as generate-favicon.mjs and the AW mark elsewhere
// in the app — rather than duplicating a second copy of the mark as a
// separate asset.
async function readLogoMaskDataUri() {
  const svg = await readFile('public/images/logo.svg', 'utf-8');
  const match = svg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
  if (!match) {
    throw new Error('Could not find embedded PNG in public/images/logo.svg');
  }
  return `data:image/png;base64,${match[1]}`;
}

async function run() {
  const logoDataUri = await readLogoMaskDataUri();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

  await page.setContent(`
    <!doctype html>
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
            background: #000000;
            font-family: 'Bricolage Grotesque', system-ui, sans-serif;
            color: #ffffff;
          }
          .frame {
            position: relative;
            width: 1200px;
            height: 630px;
            padding: 72px 80px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            isolation: isolate;
          }
          /* Same static approximation of the hero's MeshGradient used by
             generate-favicon.mjs — blurred radial blobs rather than the
             live WebGL shader, since this is a single rasterised frame. */
          .frame::before {
            content: '';
            position: absolute;
            inset: -25%;
            z-index: 0;
            background:
              radial-gradient(circle at 18% 15%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 42%),
              radial-gradient(circle at 88% 85%, rgba(212, 255, 0, 0.9) 0%, rgba(212, 255, 0, 0) 45%),
              radial-gradient(circle at 82% 12%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 38%),
              #000000;
            filter: blur(40px) saturate(1.1);
          }
          .frame::after {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
            background: rgba(0, 0, 0, 0.5);
          }
          .border {
            position: absolute;
            inset: 28px;
            z-index: 2;
            border: 1px solid rgba(255, 255, 255, 0.12);
            pointer-events: none;
          }
          .content {
            position: relative;
            z-index: 2;
          }
          .kicker {
            margin: 0;
            font-family: 'JetBrains Mono', ui-monospace, monospace;
            letter-spacing: 0.14em;
            font-size: 20px;
            font-weight: 500;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.65);
          }
          .name {
            margin: 20px 0 0;
            font-size: 116px;
            line-height: 0.94;
            letter-spacing: -0.02em;
            font-weight: 800;
            text-transform: uppercase;
          }
          .tagline {
            margin: 28px 0 0;
            max-width: 760px;
            font-size: 28px;
            line-height: 1.4;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.65);
          }
          .footer {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .url {
            font-size: 26px;
            font-weight: 500;
            color: #ffffff;
            letter-spacing: -0.01em;
          }
          .mark {
            width: 64px;
            height: 64px;
            background-color: #d4ff00;
            -webkit-mask-image: url('${logoDataUri}');
            mask-image: url('${logoDataUri}');
            -webkit-mask-size: contain;
            mask-size: contain;
            -webkit-mask-repeat: no-repeat;
            mask-repeat: no-repeat;
            -webkit-mask-position: center;
            mask-position: center;
          }
        </style>
      </head>
      <body>
        <div class="frame">
          <div class="border"></div>
          <div class="content">
            <p class="kicker">Lead Developer &middot; Software Architect &middot; Mentor</p>
            <h1 class="name">Alex Waddell</h1>
            <p class="tagline">I build things that work, and the teams that can keep building them.</p>
          </div>
          <div class="footer">
            <div class="url">alexw.dev</div>
            <div class="mark"></div>
          </div>
        </div>
      </body>
    </html>
  `);

  await page.screenshot({ path: outputPath, type: 'png' });
  await browser.close();
  process.stdout.write(`Generated ${outputPath}\n`);
}

run().catch((error) => {
  process.stderr.write(`OG image generation failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
