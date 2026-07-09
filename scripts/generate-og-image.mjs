import { chromium } from 'playwright';

const outputPath = 'public/og-image.png';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

  await page.setContent(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
        <style>
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            width: 1200px;
            height: 630px;
            overflow: hidden;
            background: oklch(14% 0.012 45);
            font-family: 'Bricolage Grotesque', system-ui, sans-serif;
            color: oklch(96% 0.01 80);
          }
          .frame {
            position: relative;
            width: 1200px;
            height: 630px;
            padding: 72px 80px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .border {
            position: absolute;
            inset: 28px;
            border: 1px solid oklch(96% 0.01 80 / 0.12);
            pointer-events: none;
          }
          .grain {
            position: absolute;
            inset: 0;
            opacity: 0.5;
            mix-blend-mode: overlay;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
          }
          .kicker {
            margin: 0;
            font-family: 'JetBrains Mono', ui-monospace, monospace;
            letter-spacing: 0.14em;
            font-size: 20px;
            font-weight: 500;
            text-transform: uppercase;
            color: oklch(70% 0.014 60);
          }
          .name {
            margin: 20px 0 0;
            font-size: 132px;
            line-height: 0.94;
            letter-spacing: -0.02em;
            font-weight: 800;
          }
          .tagline {
            margin: 28px 0 0;
            max-width: 760px;
            font-size: 30px;
            line-height: 1.4;
            font-weight: 400;
            color: oklch(70% 0.014 60);
          }
          .footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .url {
            font-size: 26px;
            font-weight: 500;
            color: oklch(96% 0.01 80);
            letter-spacing: -0.01em;
          }
          .mark {
            width: 72px;
            height: 72px;
            display: grid;
            place-items: center;
            background: oklch(62% 0.21 32);
            color: oklch(14% 0.012 45);
            font-size: 30px;
            font-weight: 800;
            letter-spacing: -0.06em;
            text-transform: lowercase;
          }
        </style>
      </head>
      <body>
        <div class="frame">
          <div class="grain"></div>
          <div class="border"></div>
          <div>
            <p class="kicker">Full-Stack Engineer &middot; Engineering Mentor</p>
            <h1 class="name">Alex Waddell</h1>
            <p class="tagline">I build fast, scalable web applications and optimise teams to deliver at their best.</p>
          </div>
          <div class="footer">
            <div class="url">alexw.dev</div>
            <div class="mark">aw</div>
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
