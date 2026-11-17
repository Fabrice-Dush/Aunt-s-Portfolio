// Focused verification of the actual normal development website. Never records secrets.
import assert from 'node:assert/strict';
import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
const root = fileURLToPath(new URL('../', import.meta.url));
const directory = resolve(root, '.cache/development-dashboard-private');
let browser, stage = 'private state';
try {
  const credentials = JSON.parse(await readFile(resolve(directory, 'credentials.json'), 'utf8'));
  const state = JSON.parse(await readFile(resolve(directory, 'state.json'), 'utf8'));
  assert.equal(state.status, 'ready');
  const base = credentials.origin; assert.equal(base, 'http://localhost:5173');
  stage = 'browser launch'; browser = await chromium.launch({ headless: true });
  const report = { at: new Date().toISOString(), origin: base, database: state.database, browser: browser.version(), checks: [], limitations: ['Focused Chromium check in fresh profiles; not a full compatibility or accessibility suite.'] };
  for (const role of ['ADMIN', 'SUPER_ADMIN']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    try {
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', () => errors.push(true));
      stage = role + ' login form';
      assert.equal((await page.goto(base + '/login')).status(), 200);
      await page.getByLabel('Email address', { exact: true }).fill(credentials[role].email);
      await page.getByLabel('Password', { exact: true }).fill(credentials[role].password);
      stage = role + ' dashboard redirect';
      await page.getByRole('button', { name: /Sign in/ }).click();
      const home = role === 'ADMIN' ? '/admin' : '/super-admin';
      await expect(page).toHaveURL(base + home, { timeout: 15000 });
      await expect(page.locator('.workspace.' + (role === 'ADMIN' ? 'studio' : 'operations'))).toBeVisible();
      stage = role + ' dashboard identity';
      await expect(page.locator('.dash-footer')).toContainText(role === 'ADMIN' ? 'PORTFOLIO STUDIO' : 'SYSTEM OPERATIONS');
      stage = role + ' normal backend identity and real content';
      const identityResponse = await context.request.get(base + '/api/v1/auth/me');
      assert.equal(identityResponse.status(), 200);
      const me = (await identityResponse.json()).data;
      assert.equal(me.id, state.accounts[role].id); assert.equal(me.role, role); assert.equal(me.mustChangePassword, false);
      const summaryResponse = await context.request.get(base + '/api/v1/dashboard/summary');
      assert.equal(summaryResponse.status(), 200);
      const summary = (await summaryResponse.json()).data;
      assert.ok(summary.profile); assert.equal(summary.skills, 6); assert.equal(summary.messages, 1);
      assert.equal(summary.experience, 2); assert.equal(summary.education, 3); assert.equal(summary.certifications, 3);
      stage = role + ' role guard and secure cookies';
      assert.equal((await context.request.get(base + '/api/v1/dashboard/security')).status(), role === 'ADMIN' ? 403 : 200);
      const cookies = await context.cookies();
      for (const name of ['sp_access', 'sp_refresh']) {
        const cookie = cookies.find(value => value.name === name); assert.ok(cookie?.httpOnly); assert.equal(cookie.sameSite, 'Strict');
      }
      assert.equal((await context.request.post(base + '/api/v1/auth/refresh', { data: {} })).status(), 403);
      stage = role + ' cross-role navigation';
      await page.goto(base + (role === 'ADMIN' ? '/super-admin' : '/admin'));
      await expect(page).toHaveURL(base + home);
      stage = role + ' logout';
      await page.getByRole('button', { name: 'Sign out', exact: true }).click();
      await expect(page).toHaveURL(base + '/login');
      assert.equal((await context.request.get(base + '/api/v1/auth/me')).status(), 401);
      assert.equal(errors.length, 0);
      report.checks.push({ role, path: home, login: 'PASS', dashboard: 'PASS', developmentContent: 'PASS', roleGuards: 'PASS', cookies: 'PASS', csrf: 'PASS', logout: 'PASS' });
      console.log('PASS ' + role + ': normal development login, dashboard, existing content, role guards, cookies, CSRF and logout.');
    } finally { await context.close(); }
  }
  stage = 'private credential HTTP exclusion';
  for (const folder of ['development-dashboard-private', 'manual-dashboard-private']) {
    const path = resolve(root, '.cache', folder, 'credentials.json');
    const response = await fetch(base + '/@fs/' + path.replaceAll('\\', '/'));
    const present = await access(path).then(() => true, error => { if (error.code === 'ENOENT') return false; throw error; });
    if (present) assert.equal(response.status, 403);
    else {
      // Vite may serve the SPA shell for an already deleted file; no credential
      // file exists to expose. Reject any response containing current secrets.
      const body = await response.text();
      assert.ok(!body.includes(credentials.ADMIN.password) && !body.includes(credentials.SUPER_ADMIN.password));
      assert.ok([403, 404].includes(response.status) || response.headers.get('content-type')?.includes('text/html'));
    }
  }
  report.credentialHttpPrivacy = 'PASS'; report.passed = true;
  await writeFile(resolve(root, '.cache/development-dashboard-verification.json'), JSON.stringify(report, null, 2));
  console.log('PASS private credentials blocked from Vite HTTP serving.');
} catch {
  console.error('FAIL development dashboard verification at: ' + stage + '. Sensitive diagnostics suppressed.'); process.exitCode = 1;
} finally { await browser?.close(); }
