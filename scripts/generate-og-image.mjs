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
        <style>
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            width: 1200px;
            height: 630px;
            overflow: hidden;
            background: #080810;
            font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            color: #e4e4e7;
          }
          .frame {
            position: relative;
            width: 1200px;
            height: 630px;
            padding: 56px 64px;
            background:
              radial-gradient(circle at 14% 22%, rgba(6, 182, 212, 0.28), transparent 42%),
              radial-gradient(circle at 86% 78%, rgba(124, 58, 237, 0.34), transparent 45%),
              radial-gradient(circle at 74% 20%, rgba(236, 72, 153, 0.2), transparent 35%),
              #080810;
          }
          .grid {
            position: absolute;
            inset: 0;
            background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
            background-size: 28px 28px;
            opacity: 0.35;
          }
          .card {
            position: relative;
            height: 100%;
            border-radius: 28px;
            border: 1px solid rgba(255,255,255,0.12);
            background: linear-gradient(180deg, rgba(18,18,31,0.82), rgba(10,10,18,0.72));
            padding: 48px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            backdrop-filter: blur(2px);
          }
          .kicker {
            margin: 0;
            letter-spacing: 0.24em;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            color: #a1a1aa;
          }
          .title {
            margin: 16px 0 0;
            font-size: 78px;
            line-height: 1.02;
            letter-spacing: -0.045em;
            font-weight: 900;
            max-width: 820px;
            background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 62%, #ec4899 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .subtitle {
            margin: 20px 0 0;
            max-width: 860px;
            font-size: 28px;
            line-height: 1.35;
            color: #c7c7d2;
            letter-spacing: -0.01em;
          }
          .footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .url {
            font-size: 24px;
            font-weight: 600;
            color: #d4d4db;
            letter-spacing: -0.01em;
          }
          .mark {
            width: 86px;
            height: 86px;
            border-radius: 22px;
            display: grid;
            place-items: center;
            background: #0d0d18;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 8px 24px rgba(124, 58, 237, 0.24);
            font-size: 40px;
            font-weight: 900;
            letter-spacing: -0.07em;
            text-transform: lowercase;
            background-image: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
        </style>
      </head>
      <body>
        <div class="frame">
          <div class="grid"></div>
          <div class="card">
            <div>
              <p class="kicker">Alexander Waddell</p>
              <h1 class="title">Lead Developer · Architect · Mentor</h1>
              <p class="subtitle">Building fast, scalable web applications and helping teams ship with confidence.</p>
            </div>
            <div class="footer">
              <div class="url">alexw.dev</div>
              <div class="mark">aw</div>
            </div>
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
