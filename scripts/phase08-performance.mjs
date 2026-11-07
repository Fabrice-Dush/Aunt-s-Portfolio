// Local lab measurements against the compiled, gated development build. No writes/accounts.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import desktop from 'lighthouse/core/config/desktop-config.js';

const label = process.argv[2];
assert.ok(['baseline', 'final'].includes(label), 'Use baseline or final');
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, '.cache/phase08-performance', label);
await mkdir(output, { recursive: true });
const fingerprint = createHash('sha256').update(await readFile(resolve(root, 'frontend/dist/index.html'))).update(await readFile(resolve(root, 'backend/dist/middlewares/public-site.js'))).digest('hex');
const previousBuild = await readFile(resolve(output, 'build.json'), 'utf8').then(JSON.parse).catch(() => null);
assert.ok(!previousBuild || previousBuild.fingerprint === fingerprint, 'Saved measurements belong to another build; preserve them before starting a new measurement set');
await writeFile(resolve(output, 'build.json'), JSON.stringify({ fingerprint, label }));
const report = { label, environment: { node: process.version, os: process.platform, localLab: true, fieldINP: 'NOT MEASURED', runsPerProfile: 3, buildFingerprint: fingerprint }, runs: [], medians: {} };
for (const profile of ['mobile', 'desktop']) {
  for (let run = 1; run <= 3; run++) {
    const saved = await readFile(resolve(output, `${profile}-${run}.json`), 'utf8').then(JSON.parse).catch(() => null);
    if (saved && !saved.runtimeError) {
      report.runs.push(summarize(saved, profile, run));
      console.log(`${label} ${profile} ${run}: retained successful measurement`);
      continue;
    }
    // Fresh owned application process: unchanged rate limits, no database restart.
    const child = spawn(process.execPath, ['scripts/phase08-performance-server.mjs'], { cwd: root, env: { ...process.env, NODE_ENV: 'production', PORT: '4496' }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let ready = false, chrome;
    child.stdout.on('data', bytes => { if (String(bytes).includes('Portfolio API available')) ready = true; });
    child.stderr.on('data', () => {});
    try {
      for (let i = 0; i < 100 && !ready && child.exitCode === null; i++) await delay(100);
      assert.ok(ready, 'Owned compiled API must start on 4496');
      const response = await fetch('http://127.0.0.1:4496/');
      assert.equal(response.status, 200, 'Current gated build required');
      await response.text();
      chrome = await launch({ chromePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', chromeFlags: ['--headless', '--disable-gpu'], logLevel: 'error' });
      const result = await lighthouse('http://127.0.0.1:4496/', { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] }, profile === 'desktop' ? desktop : undefined);
      if (!result?.lhr || result.lhr.runtimeError) {
        if (result?.lhr) await writeFile(resolve(output, `${profile}-${run}-failed.json`), JSON.stringify(result.lhr, null, 2));
        throw new Error('Lighthouse failed: ' + (result?.lhr?.runtimeError?.code ?? 'NO_RESULT'));
      }
      const { lhr } = result;
      await writeFile(resolve(output, `${profile}-${run}.json`), JSON.stringify(lhr, null, 2));
      const row = summarize(lhr, profile, run);
      report.runs.push(row);
      console.log(JSON.stringify({ label, profile, run, scores: row.scores, metrics: row.metrics }));
    } finally {
      await chrome?.kill();
      if (child.exitCode === null) { const ended = once(child, 'exit'); child.kill(); await ended; }
    }
  }
  const median = values => [...values].sort((a,b) => a-b)[1];
  const rows = report.runs.filter(row => row.profile === profile);
  report.medians[profile] = { scores: Object.fromEntries(Object.keys(rows[0].scores).map(key => [key, median(rows.map(row => row.scores[key]))])), metrics: Object.fromEntries(Object.keys(rows[0].metrics).map(key => [key, median(rows.map(row => row.metrics[key]))])) };
}
await writeFile(resolve(output, 'summary.json'), JSON.stringify(report, null, 2));
console.log('Local lab results saved; no real-user INP or deployed p75 claim.');
function summarize(lhr, profile, run) {
  const number = id => lhr.audits[id]?.numericValue ?? null;
  return { profile, run, lighthouseVersion: lhr.lighthouseVersion, userAgent: lhr.userAgent, settings: lhr.configSettings, scores: Object.fromEntries(Object.entries(lhr.categories).map(([key, value]) => [key, Math.round(value.score * 100)])), metrics: { LCP: number('largest-contentful-paint'), FCP: number('first-contentful-paint'), CLS: number('cumulative-layout-shift'), TBT: number('total-blocking-time'), transferredBytes: number('total-byte-weight'), requests: lhr.audits['network-requests']?.details?.items?.length ?? null }, failedAudits: Object.values(lhr.audits).filter(audit => audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== 'informative').map(audit => ({ id: audit.id, title: audit.title, score: audit.score, displayValue: audit.displayValue })) };
}
