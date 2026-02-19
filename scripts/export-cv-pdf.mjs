import { spawn } from 'node:child_process';
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';

const port = 4174;
const host = '127.0.0.1';
const baseUrl = `http://${host}:${port}`;
const cvUrl = `${baseUrl}/cv?pdf=1`;
const pdfFileName = 'alexander-waddell-cv.pdf';
const distPdfPath = join(process.cwd(), 'dist', pdfFileName);
const publicPdfPath = join(process.cwd(), 'public', pdfFileName);

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForServer(url, timeoutMs = 20000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      await wait(200);
    }
  }

  throw new Error(`Timed out waiting for preview server at ${url}`);
}

async function run() {
  const preview = spawn(
    'npm',
    ['run', 'preview', '--', '--host', host, '--port', String(port), '--strictPort'],
    {
      cwd: process.cwd(),
      stdio: 'ignore',
      shell: process.platform === 'win32',
    }
  );

  try {
    await waitForServer(baseUrl);

    const browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1280, height: 1800 },
    });

    await page.goto(cvUrl, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'screen' });
    await page.pdf({
      path: distPdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    });

    await browser.close();

    await mkdir(dirname(publicPdfPath), { recursive: true });
    await copyFile(distPdfPath, publicPdfPath);

    process.stdout.write(`Generated ${pdfFileName}\n`);
  } finally {
    preview.kill('SIGTERM');
  }
}

run().catch((error) => {
  process.stderr.write(`CV PDF export failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.stderr.write('If Chromium is missing, run: npx playwright install chromium\n');
  process.exit(1);
});
