import { spawnSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import pngToIco from 'png-to-ico';

const pngPath = 'public/favicon-256.png';
const icoPath = 'public/favicon.ico';
const png16Path = 'public/favicon-16.png';
const png32Path = 'public/favicon-32.png';
const png48Path = 'public/favicon-48.png';
const png64Path = 'public/favicon-64.png';

async function makePng() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 256, height: 256 } });

  await page.setContent(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          html, body {
            margin: 0;
            width: 256px;
            height: 256px;
            overflow: hidden;
            background: #080810;
          }
          .wrap {
            width: 256px;
            height: 256px;
            display: grid;
            place-items: center;
            background:
              radial-gradient(circle at 28% 18%, rgba(6, 182, 212, 0.16), transparent 52%),
              radial-gradient(circle at 72% 78%, rgba(124, 58, 237, 0.22), transparent 56%),
              #080810;
          }
          .tile {
            width: 256px;
            height: 256px;
            display: grid;
            place-items: center;
            background: transparent;
            color: transparent;
            font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            font-size: 132px;
            font-weight: 900;
            line-height: 1;
            letter-spacing: -0.08em;
            transform: translateY(-3px);
            text-transform: lowercase;
            user-select: none;
            background-image: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%);
            -webkit-background-clip: text;
            background-clip: text;
            filter: drop-shadow(0 4px 12px rgba(124, 58, 237, 0.24));
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="tile">aw</div>
        </div>
      </body>
    </html>
  `);

  await page.screenshot({ path: pngPath, type: 'png' });
  await browser.close();
}

function makePngSize(outputPath, size) {
  const result = spawnSync(
    'ffmpeg',
    ['-y', '-i', pngPath, '-vf', `scale=${size}:${size}:flags=lanczos`, outputPath],
    { stdio: 'pipe', encoding: 'utf-8' }
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || `ffmpeg failed generating ${outputPath}`);
  }
}

async function makeIco() {
  makePngSize(png16Path, 16);
  makePngSize(png32Path, 32);
  makePngSize(png48Path, 48);
  makePngSize(png64Path, 64);

  const icoBuffer = await pngToIco([png16Path, png32Path, png48Path, png64Path]);
  await writeFile(icoPath, icoBuffer);
}

async function run() {
  await makePng();
  await makeIco();
  process.stdout.write('Generated public/favicon.ico\n');
}

run().catch((error) => {
  process.stderr.write(`Favicon generation failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
