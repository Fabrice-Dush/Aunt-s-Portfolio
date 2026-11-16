// No traces, cookie exports, password screenshots, raw responses or driver errors.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

const root = fileURLToPath(new URL('../', import.meta.url));
const privateDir = resolve(root, '.cache/manual-dashboard-private');
let browser;
let stage = 'read owner-restricted temporary credentials';
try {
  const credentials = JSON.parse(await readFile(resolve(privateDir, 'credentials.json'), 'utf8'));
  const state = JSON.parse(await readFile(resolve(privateDir, 'state.json'), 'utf8'));
  assert.equal(state.status, 'ready');
  const base = credentials.origin;
  assert.equal(base, 'http://127.0.0.1:5186');
  const contextOptions = { viewport: { width: 1440, height: 1000 } };
  const report = { at: new Date().toISOString(), origin: base, database: state.database, engines: [], checks: [], limitations: ['Automated browser verification uses fresh profiles; the user browser profile was not controlled. Not a full compatibility or accessibility suite.'] };
  // The default smoke check leaves login-rate budget for the human tester.
  const channels = process.argv.includes('--all-browsers') ? ['chromium', 'chrome', 'msedge'] : ['chromium'];
  for (const channel of channels) {
    stage = channel + ' browser launch';
    browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
    report.engines.push({ name: channel, version: browser.version() });
    for (const role of ['ADMIN', 'SUPER_ADMIN']) {
      stage = channel + ' ' + role + ' sign-in and isolation';
      const context = await browser.newContext(contextOptions);
      try {
        const page = await context.newPage();
        const errors = []; page.on('pageerror', () => errors.push(true));
        const environment = await context.request.get(base + '/__manual-test-environment');
        assert.equal(environment.headers()['x-portfolio-environment'], 'isolated-test-x3306');
        assert.equal((await environment.json()).database, 'seraphine_portfolio_test_x3306_20261116');
        stage = channel + ' ' + role + ' login form load';
        const entry = await page.goto(base + '/login');
        assert.equal(entry.headers()['x-portfolio-environment'], 'isolated-test-x3306');
        await page.getByLabel('Email address', { exact: true }).fill(credentials[role].email);
        await page.getByLabel('Password', { exact: true }).fill(credentials[role].password);
        stage = channel + ' ' + role + ' dashboard redirect';
        await page.getByRole('button', { name: /Sign in/ }).click();
        const home = role === 'ADMIN' ? '/admin' : '/super-admin';
        await expect(page).toHaveURL(base + home, { timeout: 15000 });
        await expect(page.locator('.workspace.' + (role === 'ADMIN' ? 'studio' : 'operations'))).toBeVisible();
        await expect(page.locator('.dash-page-heading h1')).toBeVisible();
        stage = channel + ' ' + role + ' authenticated API identity';
        const me = await (await context.request.get(base + '/api/v1/auth/me')).json();
        assert.equal(me.data.role, role); assert.equal(me.data.mustChangePassword, false);
        assert.ok(state.ids.user.includes(me.data.id));
        const summaryResponse = await context.request.get(base + '/api/v1/dashboard/summary');
        assert.equal(summaryResponse.status(), 200);
        const summary = (await summaryResponse.json()).data;
        assert.equal(summary.profile, null); assert.equal(summary.messages, 0); assert.equal(summary.skills, 0);
        stage = channel + ' ' + role + ' role authorization and cookies';
        assert.equal((await context.request.get(base + '/api/v1/dashboard/security')).status(), role === 'ADMIN' ? 403 : 200);
        const cookies = await context.cookies();
        for (const name of ['sp_access', 'sp_refresh']) {
          const cookie = cookies.find(value => value.name === name);
          assert.ok(cookie?.httpOnly); assert.equal(cookie.sameSite, 'Strict');
        }
        stage = channel + ' ' + role + ' cross-role route correction';
        await page.goto(base + (role === 'ADMIN' ? '/super-admin' : '/admin'));
        await expect(page).toHaveURL(base + home);
        await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
        stage = channel + ' ' + role + ' logout';
        await page.getByRole('button', { name: 'Sign out', exact: true }).click();
        await expect(page).toHaveURL(base + '/login');
        assert.equal((await context.request.get(base + '/api/v1/auth/me')).status(), 401);
        assert.equal(errors.length, 0);
        report.checks.push({ engine: channel, role, path: home, result: 'PASS', isolation: 'exact test identity + fixture user ID + empty content', authorization: 'PASS', logout: 'PASS' });
        console.log('PASS ' + channel + ' ' + role + ': login, correct dashboard, test-only data, role guard, cookies and logout.');
      } finally { await context.close(); }
    }
    await browser.close(); browser = undefined;
  }
  // Confirm the credential file is not exposed through the development server's filesystem API.
  for (const path of ['/../.cache/manual-dashboard-private/credentials.json', '/@fs/' + resolve(privateDir, 'credentials.json').replaceAll('\\', '/')]) {
    const response = await fetch(base + path);
    const body = await response.text();
    assert.ok(!body.includes(credentials.ADMIN.password) && !body.includes(credentials.SUPER_ADMIN.password));
  }
  report.passed = true;
  await writeFile(resolve(root, '.cache/manual-dashboard-verification' + (channels.length > 1 ? '-all-browsers' : '') + '.json'), JSON.stringify(report, null, 2));
  console.log('PASS credential HTTP privacy. No credentials or cookies written to the report.');
} catch (error) {
  console.error('Location: ' + (error.stack?.split('\n').find(line => line.includes('manual-dashboard-verify.mjs:')) ?? error.name));
  console.error('FAIL manual dashboard verification at: ' + stage + '. Sensitive diagnostics suppressed.');
  process.exitCode = 1;
} finally { await browser?.close(); }
