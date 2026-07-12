import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import pngToIco from 'png-to-ico';

const pngPath = 'public/favicon-256.png';
const icoPath = 'public/favicon.ico';
const png16Path = 'public/favicon-16.png';
const png32Path = 'public/favicon-32.png';
const png48Path = 'public/favicon-48.png';
const png64Path = 'public/favicon-64.png';

// logo.svg is a rasterised PNG wrapped in an <svg> (no vector paths to
// retint), so we pull its embedded base64 PNG out and reuse it as a CSS
// mask — same technique as the AW mark in PageLoader/App.css — rather than
// duplicating a second copy of the mark as a separate asset.
async function readLogoMaskDataUri() {
  const svg = await readFile('public/images/logo.svg', 'utf-8');
  const match = svg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
  if (!match) {
    throw new Error('Could not find embedded PNG in public/images/logo.svg');
  }
  return `data:image/png;base64,${match[1]}`;
}

async function makePng() {
  const logoDataUri = await readLogoMaskDataUri();
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
            background: #000000;
          }
          .wrap {
            position: relative;
            width: 256px;
            height: 256px;
            display: grid;
            place-items: center;
            isolation: isolate;
          }
          /* Static approximation of the hero's MeshGradient (colors:
             #000000, #000000, #ffffff, #d4ff00) — blurred radial blobs
             rather than the live WebGL shader, since a favicon is a
             single frame anyway. */
          .wrap::before {
            content: '';
            position: absolute;
            inset: -25%;
            z-index: 0;
            background:
              radial-gradient(circle at 22% 20%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 45%),
              radial-gradient(circle at 80% 78%, rgba(212, 255, 0, 0.95) 0%, rgba(212, 255, 0, 0) 48%),
              radial-gradient(circle at 78% 18%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 40%),
              #000000;
            filter: blur(30px) saturate(1.1);
          }
          /* Same darkening scrim the hero lays over its gradient, so the
             mark stays legible against the brightest parts of the blobs. */
          .wrap::after {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
            background: rgba(0, 0, 0, 0.5);
          }
          .tile {
            position: relative;
            z-index: 2;
            width: 168px;
            height: 168px;
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
        <div class="wrap">
          <div class="tile"></div>
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
