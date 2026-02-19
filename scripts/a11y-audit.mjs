import { spawn } from 'node:child_process';
import process from 'node:process';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const host = '127.0.0.1';
const port = '4173';
const baseUrl = `http://${host}:${port}`;
const staticPaths = ['/', '/projects', '/blog'];

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.status >= 200 && response.status < 500) {
        return;
      }
    } catch {
      // keep retrying
    }
    await wait(300);
  }
  throw new Error(`Preview server was not reachable at ${url} within ${timeoutMs}ms`);
}

function formatViolation(violation) {
  const impacted = violation.nodes.length;
  return `- [${violation.impact ?? 'unknown'}] ${violation.id} (${impacted} node${impacted === 1 ? '' : 's'})`;
}

function formatNode(node) {
  const targets = node.target?.join(', ') || 'unknown-target';
  const summary = node.failureSummary ? node.failureSummary.trim().replace(/\s+/g, ' ') : '';
  return `  • ${targets}${summary ? ` — ${summary}` : ''}`;
}

async function run() {
  const preview = spawn(
    'npm',
    ['run', 'preview', '--', '--host', host, '--port', port, '--strictPort'],
    { stdio: 'pipe', shell: process.platform === 'win32' }
  );

  preview.stdout.on('data', (chunk) => {
    process.stdout.write(chunk);
  });

  preview.stderr.on('data', (chunk) => {
    process.stderr.write(chunk);
  });

  try {
    await waitForServer(baseUrl);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const allPaths = new Set(staticPaths);

    await page.goto(`${baseUrl}/projects`, { waitUntil: 'networkidle' });
    const projectDetailPaths = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href^="/projects/"]'))
        .map((anchor) => anchor.getAttribute('href'))
        .filter((href) => Boolean(href) && href !== '/projects');
    });
    projectDetailPaths.slice(0, 3).forEach((path) => allPaths.add(path));

    await page.goto(`${baseUrl}/blog`, { waitUntil: 'networkidle' });
    const blogDetailPaths = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href^="/blog/"]'))
        .map((anchor) => anchor.getAttribute('href'))
        .filter((href) => Boolean(href) && href !== '/blog');
    });
    blogDetailPaths.slice(0, 3).forEach((path) => allPaths.add(path));

    const allViolations = [];

    for (const path of allPaths) {
      await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
      await wait(1000);
      const results = await new AxeBuilder({ page }).analyze();
      if (results.violations.length > 0) {
        allViolations.push({ path, violations: results.violations });
      }
    }

    await context.close();
    await browser.close();

    if (allViolations.length > 0) {
      console.error('\nAccessibility violations found:\n');
      for (const pageResult of allViolations) {
        console.error(`Page: ${pageResult.path}`);
        for (const violation of pageResult.violations) {
          console.error(formatViolation(violation));
          for (const node of violation.nodes.slice(0, 8)) {
            console.error(formatNode(node));
          }
        }
        console.error('');
      }
      process.exitCode = 1;
      return;
    }

    console.log('\nNo accessibility violations found by axe on scanned routes.');
  } finally {
    preview.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
