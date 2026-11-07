// Read-only review of the real published development DTO through compiled serving.
// No fixtures, account creation, development writes or database lifecycle operations.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, '.cache/phase09/actual-public');
await mkdir(output, { recursive: true });
const child = spawn(process.execPath, ['scripts/phase08-performance-server.mjs'], {
  cwd: root, env: { ...process.env, NODE_ENV: 'production', PORT: '4496' },
  stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
});
const ended = once(child, 'exit');
let ready = false, browser;
child.stdout.on('data', bytes => { if (String(bytes).includes('Portfolio API available')) ready = true; });
child.stderr.on('data', () => {});
const report = { startedAt: new Date().toISOString(), screenshots: [], accessibility: null };
try {
  for (let i = 0; i < 200 && !ready && child.exitCode === null; i++) await delay(100);
  assert.ok(ready, 'Owned compiled server must start on free loopback port 4496');
  browser = await chromium.launch({ headless: true });
  report.browser = browser.version();
  report.node = process.version;
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  assert.equal((await page.goto('http://127.0.0.1:4496/')).status(), 200);
  await expect(page.locator('#hero-title')).toContainText('Nyirarukundo');
  await expect(page.locator('.expertise-card')).toHaveCount(6);
  await expect(page.locator('#projects,#experience,#education,#training')).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"],a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator('.public-contact-form button')).toBeEnabled();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  for (const width of [320,375,390,768,1024,1440,1920]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Public overflow at ' + width);
    for (const [kind, fullPage] of [['top', false], ['full', true]]) {
      const name = `actual-public-${width}-${kind}.png`;
      await page.screenshot({ path: resolve(output, name), fullPage });
      report.screenshots.push({ name, sha256: createHash('sha256').update(await readFile(resolve(output, name))).digest('hex') });
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  report.accessibility = { violations: result.violations, incomplete: result.incomplete };
  assert.equal(result.violations.length, 0);
  assert.deepEqual(errors, []);
  report.passed = true;
} finally {
  try { await browser?.close(); }
  finally {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
    let timer;
    try { await Promise.race([ended, new Promise((_, reject) => { timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('Owned review server shutdown deadline')); }, 12000); })]); }
    finally { clearTimeout(timer); }
    report.finishedAt = new Date().toISOString();
    await writeFile(resolve(output, 'results.json'), JSON.stringify(report, null, 2));
  }
}
console.log(JSON.stringify({ passed: report.passed, screenshots: report.screenshots.length, axeViolations: report.accessibility.violations.length }));
