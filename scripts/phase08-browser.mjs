// Run sequentially: node --import tsx scripts/phase08-browser.mjs
// Owns only the initially empty, exact isolated test DB while its lock exists.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, firefox, webkit, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { fixture, isolatedEnvironment, reportDirectory, root } from './phase08-fixtures.mjs';

if (process.argv.includes('--api')) {
  assert.equal(process.env.NODE_ENV, 'test', 'The browser API helper requires explicit isolated test mode');
  let target;
  try { target = new URL(process.env.DATABASE_URL ?? 'mysql://invalid'); }
  catch { throw new Error('Invalid isolated browser API database configuration'); }
  assert.ok(['127.0.0.1', 'localhost'].includes(target.hostname));
  assert.equal(target.port, '13312');
  assert.equal(target.pathname, '/seraphine_portfolio_test');
  assert.equal(decodeURIComponent(target.username), 'seraphine_test');
  assert.equal(process.env.PORT, '4408');
  const { app } = await import('../backend/src/app.ts');
  const { disconnectDatabase } = await import('../backend/src/config/database.ts');
  const server = app.listen(Number(process.env.PORT), '127.0.0.1');
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => server.close(async () => { await disconnectDatabase(); process.exit(0); }));
} else {
  isolatedEnvironment();
  process.env.PORT = '4408';
  process.env.FRONTEND_ORIGIN = 'http://127.0.0.1:5178';
  const base = process.env.FRONTEND_ORIGIN;
  const apiBase = 'http://127.0.0.1:4408';
  const report = { startedAt: new Date().toISOString(), environment: { platform: process.platform, node: process.version, database: 'isolated local seraphine_portfolio_test:13312', headless: true }, responsive: { cssWidths: [320,375,390,768,1024,1440,1920], landscape: { width: 844, height: 390 }, reflow: '640 CSS px and 320 CSS px model a 1280 px viewport at 200% and 400%; these are viewport reflow checks, not actual browser zoom or OS magnification.' }, tests: [], engines: [], accessibility: [], screenshots: [], limitations: ['Playwright WebKit on Windows is not actual Safari/macOS/iOS.', 'No real owner accounts or real client content are used.', 'Automated keyboard and screenshots do not replace owner/device acceptance.', 'axe incomplete contrast checks on gradients/images need separate review; zero violations is not a complete WCAG conformance claim.'] };
  const f = await fixture().catch(() => { throw new Error('Isolated browser fixture preparation failed. Verify the documented empty test database; raw database errors are not logged.'); });
  const focus = process.env.PHASE08_BROWSER_FOCUS?.toLowerCase();
  report.selection = focus ?? 'all';
  report.notRun = [];
  const disposableSecrets = [f.password, process.env.JWT_SECRET, process.env.DATABASE_URL, process.env.TEST_DATABASE_URL];
  let apiChild, previewServer, browser;
  let activePage;
  const errors = [];
  function safe(error) {
    if (/Prisma|DriverAdapter|SqlError|MariaDb/i.test(error?.name ?? '')) return 'Isolated database operation failed; raw driver errors are not logged.';
    let value = String(error?.stack ?? error?.message ?? error);
    for (const secret of disposableSecrets) value = value.replaceAll(secret, '[redacted]');
    return value.slice(0, 2300);
  }
  async function test(name, operation) {
    if (focus && !name.toLowerCase().includes(focus)) { report.notRun.push(name); return; }
    const started = performance.now();
    try { await operation(); report.tests.push({ name, status: 'PASSED', milliseconds: Math.round(performance.now() - started) }); console.log('PASS ' + name); }
    catch (error) {
      const diagnostics = activePage && !activePage.isClosed() ? await activePage.evaluate(() => ({ url: location.pathname, alerts: [...document.querySelectorAll('[role="alert"]')].map(item => item.textContent), focus: { tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.slice(0, 150) } })).catch(() => null) : null;
      report.tests.push({ name, status: 'FAILED', error: safe(error), diagnostics, milliseconds: Math.round(performance.now() - started) }); console.log('FAIL ' + name + ': ' + safe(error)); if (diagnostics) console.log(JSON.stringify(diagnostics)); errors.push(error);
    }
    finally { await f.capture(); }
  }
  async function build() {
    const child = spawn(process.execPath, ['frontend/scripts/build.mjs'], { cwd: root, env: process.env, windowsHide: true, stdio: 'ignore' });
    const [code] = await once(child, 'exit');
    assert.equal(code, 0, 'Isolated published build failed');
  }
  async function bounded(operation, milliseconds, label) {
    let timer;
    try {
      return await Promise.race([operation, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(label + ' exceeded its shutdown deadline')), milliseconds); })]);
    } finally { clearTimeout(timer); }
  }
  async function stopChild(child) {
    if (!child || child.exitCode !== null || child.signalCode !== null) return;
    const ended = once(child, 'exit');
    child.kill('SIGTERM');
    try { await bounded(ended, 10000, 'Owned API'); }
    catch {
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
      await bounded(ended, 5000, 'Owned API forced stop');
    }
  }
  async function stopPreview(server) {
    if (!server?.httpServer?.listening) return;
    const closed = new Promise((resolveClose, reject) => server.httpServer.close(error => error ? reject(error) : resolveClose()));
    try { await bounded(closed, 10000, 'Owned preview'); }
    catch {
      server.httpServer.closeAllConnections?.();
      await bounded(closed, 5000, 'Owned preview forced stop');
    }
  }
  async function restartApi() {
    if (apiChild) { const child = apiChild; apiChild = null; await stopChild(child); }
    apiChild = spawn(process.execPath, ['--import', 'tsx', 'scripts/phase08-browser.mjs', '--api'], { cwd: root, env: { ...process.env, NODE_ENV: 'test', PORT: '4408' }, windowsHide: true, stdio: 'ignore' });
    let lastStatus = 'not listening';
    for (let attempt = 0; attempt < 300; attempt++) {
      if (apiChild.exitCode !== null) throw new Error('Isolated API exited during startup: ' + apiChild.exitCode);
      try { const response = await fetch(apiBase + '/api/v1/health', { signal: AbortSignal.timeout(1000) }); lastStatus = response.status; if (response.ok) return; } catch { /* start */ }
      await new Promise(resolveWait => setTimeout(resolveWait, 100));
    }
    throw new Error('Isolated API did not become ready; final status: ' + lastStatus);
  }
  async function login(page, role) {
    await page.context().clearCookies();
    if (page.url() !== base + '/login') await page.goto(base + '/login');
    await expect(page.getByLabel('Email address', { exact: true })).toBeVisible();
    await page.getByLabel('Email address', { exact: true }).fill(f.users[role].email);
    await page.getByLabel('Password', { exact: true }).fill(f.password);
    await page.getByRole('button', { name: /Sign in/ }).click();
    await expect(page).toHaveURL(base + (role === 'ADMIN' ? '/admin' : '/super-admin'));
    await expect(page.locator('.dash-page-heading h1')).toBeVisible();
  }
  async function request(page, path, method = 'GET', body) {
    const response = await page.request.fetch(base + '/api/v1' + path, { method, headers: { Origin: base, 'X-Portfolio-Request': '1', 'Idempotency-Key': randomUUID() }, ...(body === undefined ? {} : { data: body }) });
    return { status: response.status(), body: await response.json().catch(() => null), headers: response.headers() };
  }
  async function route(page, path) { await page.goto(base + path); await expect(page.locator('.dash-page-heading h1')).toBeVisible(); }
  async function screenshot(page, name) { await page.screenshot({ path: resolve(reportDirectory, name + '.png'), fullPage: true }); report.screenshots.push(name + '.png'); }
  async function viewportScreenshots(page, name) { await screenshot(page, name + '-full'); await page.screenshot({ path: resolve(reportDirectory, name + '-top.png'), fullPage: false }); report.screenshots.push(name + '-top.png'); }
  async function reflow(page, name) {
    await page.setViewportSize({ width: 844, height: 390 }); await overflow(page); await viewportScreenshots(page, name + '-landscape');
    for (const [zoom, width] of [[200,640], [400,320]]) {
      await page.setViewportSize({ width, height: 900 }); await overflow(page);
      const fields = page.locator('input:not([type="hidden"]):visible,textarea:visible,button:visible');
      assert.ok(await fields.count() > 0, 'Controls visible at equivalent ' + zoom + '% reflow');
    }
  }
  async function overflow(page) {
    const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(dimensions.scroll <= dimensions.width + 1, 'Horizontal overflow: ' + JSON.stringify(dimensions));
  }
  async function axe(page, name) {
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    report.accessibility.push({ name, passes: result.passes.length, incomplete: result.incomplete.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })), violations: result.violations.map(item => ({ id: item.id, impact: item.impact, description: item.description, nodes: item.nodes.map(node => ({ target: node.target, html: node.html, summary: node.failureSummary })) })) });
    assert.equal(result.violations.length, 0, 'axe violations: ' + result.violations.map(item => item.id + ':' + item.nodes.length).join(', '));
  }
  async function dialog(page, accept, action) {
    const pending = page.waitForEvent('dialog', { timeout: 5000 });
    const actionPromise = action();
    const value = await pending;
    const event = { type: value.type() };
    await (accept ? value.accept() : value.dismiss());
    await actionPromise;
    return event;
  }
  try {
    await build();
    await restartApi();
    const { preview } = await import('vite');
    previewServer = await preview({ root: resolve(root, 'frontend'), configFile: resolve(root, 'frontend/vite.config.ts'), build: { outDir: '.cache/test-public' }, preview: { host: '127.0.0.1', port: 5178, strictPort: true, proxy: { '/api': { target: apiBase, changeOrigin: true } }, headers: { 'X-Robots-Tag': 'noindex, nofollow' } } });
    browser = await chromium.launch({ headless: true });
    report.engines.push({ name: 'Chromium', version: browser.version(), launch: 'PASSED' });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    activePage = page;
    const consoleErrors = [];
    page.on('pageerror', error => consoleErrors.push(safe(error)));
    page.on('console', message => { if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) consoleErrors.push(message.text()); });
    await test('Chromium public hydration, full published sections, image loading and privacy', async () => {
      const response = await page.goto(base);
      assert.equal(response.status(), 200);
      await expect(page.locator('#hero-title')).toBeVisible();
      await expect(page.locator('#hero-title')).toContainText('Nyirarukundo');
      await expect(page.locator('#hero-title')).toContainText('Seraphine');
      await expect(page.getByText('TEST ONLY published achievement', { exact: true })).toBeVisible();
      await expect(page.getByText('TEST ONLY published training', { exact: true })).toBeVisible();
      await page.waitForFunction(() => document.querySelector('.public-contact-form button')?.disabled === false);
      assert.equal(await page.locator('body').innerText().then(text => /PRIVATE_PHASE08/.test(text)), false);
      assert.equal(await page.evaluate(() => [...document.images].every(image => image.complete && image.naturalWidth > 0)), true);
      assert.deepEqual(consoleErrors, []);
      assert.equal(await page.title(), 'TEST ONLY | Nyirarukundo Seraphine');
      assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
      await screenshot(page, 'chromium-public-1440');
    });
    await test('Public seven responsive widths, landscape, anchors and reduced motion', async () => {
      for (const width of [320,375,390,768,1024,1440,1920]) {
        await page.setViewportSize({ width, height: 900 });
        await overflow(page);
        await expect(page.locator('#hero-title')).toBeVisible();
        await viewportScreenshots(page, 'chromium-public-' + width);
      }
      await page.setViewportSize({ width: 844, height: 390 }); await overflow(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('.mobile-menu summary').click();
      await page.locator('.mobile-nav').getByRole('link', { name: 'About', exact: true }).click();
      await expect(page).toHaveURL(/#about$/);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
      const animation = await page.locator('h1').evaluate(element => getComputedStyle(element).animationDuration);
      assert.ok(animation.split(',').every(value => parseFloat(value) <= 0.01), 'Reduced motion animation duration');
      await reflow(page, 'chromium-public');
      await page.setViewportSize({ width: 1440, height: 1000 });
    });
    await test('Public WCAG 2.2 AA axe scan and keyboard skip navigation', async () => {
      await page.goto(base);
      await page.keyboard.press('Tab');
      assert.match(await page.evaluate(() => document.activeElement?.textContent), /Skip/);
      await page.keyboard.press('Enter');
      await axe(page, 'public-full-published');
    });
    await test('No JavaScript preserves content/navigation and disables contact submission', async () => {
      const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
      try {
        const p = await nojs.newPage(); await p.goto(base);
        await expect(p.locator('#hero-title')).toBeVisible();
        await expect(p.locator('.public-contact-form button')).toBeDisabled();
        await expect(p.locator('.public-contact-form input[name="senderEmail"]')).toBeDisabled();
        assert.equal(await p.locator('.public-contact-form').getAttribute('method'), 'post');
        await p.locator('.mobile-menu summary').click();
        await p.locator('.mobile-nav').getByRole('link', { name: 'About', exact: true }).click();
        await expect(p).toHaveURL(/#about$/); await overflow(p); await screenshot(p, 'chromium-nojs-375');
      } finally { await nojs.close(); }
    });
    await test('Public contact real storage, duplicate-submit guard and privacy', async () => {
      await page.goto(base);
      const form = page.locator('.public-contact-form');
      await form.getByLabel('Your name', { exact: true }).fill('TEST ONLY browser visitor');
      await form.getByLabel('Email', { exact: true }).fill('phase08-visitor@example.invalid');
      await form.getByLabel('Subject', { exact: true }).fill('TEST ONLY browser message');
      await form.getByLabel('Message', { exact: true }).fill('PRIVATE_PHASE08_MESSAGE body from actual contact form.');
      await page.waitForTimeout(3100); // Actual anti-spam minimum; no test bypass.
      await form.getByRole('button', { name: /Send message/ }).dblclick();
      await expect(form.getByRole('status')).toContainText('has been received');
      assert.equal(await f.db.contactMessage.count(), 1);
      const payload = await request(page, '/public-content');
      assert.equal(JSON.stringify(payload.body).includes('PRIVATE_PHASE08'), false);
    });
    await restartApi();
    await test('ADMIN login, live cookie protections, session expiry and role separation', async () => {
      await login(page, 'ADMIN');
      await expect(page.locator('.workspace.studio')).toBeVisible();
      const cookies = await context.cookies();
      for (const cookie of cookies.filter(item => ['sp_access','sp_refresh'].includes(item.name))) { assert.equal(cookie.httpOnly, true); assert.equal(cookie.sameSite, 'Strict'); }
      assert.equal(cookies.filter(item => ['sp_access','sp_refresh'].includes(item.name)).length, 2);
      assert.equal(await page.evaluate(() => /sp_access|sp_refresh/.test(document.cookie)), false);
      assert.deepEqual(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) })), { local: [], session: [] });
      assert.equal((await request(page, '/dashboard/status')).status, 403);
      await page.goto(base + '/super-admin'); await expect(page).toHaveURL(base + '/admin');
      const expired = await f.db.authSession.updateMany({ where: { userId: f.users.ADMIN.id, revokedAt: null }, data: { expiresAt: new Date(Date.now() - 1000) } });
      assert.equal(expired.count, 1);
      await page.reload();
      await expect(page).toHaveURL(base + '/login');
      await expect(page.getByLabel('Email address', { exact: true })).toBeVisible();
      await expect(page.locator('.workspace')).toHaveCount(0);
      await login(page, 'ADMIN');
      assert.deepEqual(consoleErrors, []);
      await screenshot(page, 'chromium-admin-overview');
    });
    await test('ADMIN responsive sidebar keyboard/focus and overview axe', async () => {
      for (const width of [320,375,390,768,1024,1440,1920]) { await page.setViewportSize({ width, height: 900 }); await overflow(page); await viewportScreenshots(page, 'chromium-admin-' + width); }
      await reflow(page, 'chromium-admin');
      await page.setViewportSize({ width: 390, height: 844 });
      const menu = page.getByRole('button', { name: /^Menu/ }); await menu.click();
      await expect(page.locator('.dash-sidebar nav a').first()).toBeFocused();
      await page.keyboard.press('Escape'); await expect(menu).toBeFocused(); await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await page.setViewportSize({ width: 1440, height: 1000 }); await axe(page, 'admin-overview');
    });
    await test('ADMIN CMS form validation, save draft, preview modal and rejected publication', async () => {
      await route(page, '/admin/skills'); await page.getByRole('button', { name: 'Add skill', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Add skill', exact: true })).toBeFocused();
      await page.getByRole('button', { name: 'Save draft', exact: true }).click();
      assert.equal(await page.getByLabel('Skill name', { exact: true }).evaluate(element => element.validity.valueMissing), true, 'Empty required name must be invalid');
      await page.getByLabel('Skill name', { exact: true }).fill('TEST ONLY browser CMS workflow');
      await page.getByLabel('Description', { exact: true }).fill('Stored via the real browser CMS form.');
      await page.getByRole('button', { name: 'Save draft', exact: true }).click();
      await expect(page.getByRole('status').filter({ hasText: 'Draft saved privately' })).toBeVisible();
      let row = page.locator('.dash-record-list li').filter({ hasText: 'TEST ONLY browser CMS workflow' });
      assert.equal((await request(page, '/public-content')).body.data.skills.some(item => item.name === 'TEST ONLY browser CMS workflow'), false);
      await row.getByRole('button', { name: 'Preview', exact: true }).click();
      await expect(page.getByRole('dialog')).toBeVisible(); await expect(page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
      await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
      // Some native dialog implementations allow focus to browser chrome (BODY as activeElement).
      // They must never focus an inert application control, and Tab must return to the dialog.
      const modalFocus = await page.evaluate(() => ({ tag: document.activeElement?.tagName, inside: !!document.activeElement?.closest('dialog') }));
      if (modalFocus.tag === 'BODY') { report.nativeDialogBrowserChromeTransition = true; await page.keyboard.press('Tab'); }
      else assert.equal(modalFocus.inside, true, 'Native modal must not focus outside application controls');
      await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
      await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0); await expect(row.getByRole('button', { name: 'Preview', exact: true })).toBeFocused();
      await row.getByRole('button', { name: 'Publish', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).click();
      await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
      await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
      row = page.locator('.dash-record-list li').filter({ hasText: 'TEST ONLY browser CMS workflow' }); await row.getByRole('button', { name: 'Edit', exact: true }).click();
      await page.getByLabel('I have checked these details and they are accurate', { exact: true }).check();
      await page.getByRole('button', { name: 'Save draft', exact: true }).click();
      row = page.locator('.dash-record-list li').filter({ hasText: 'TEST ONLY browser CMS workflow' }); await row.getByRole('button', { name: 'Publish', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0); await expect(row.locator('.dash-badge')).toHaveText('published');
      assert.equal((await request(page, '/public-content')).body.data.skills.some(item => item.name === 'TEST ONLY browser CMS workflow'), true, 'Published verified skill must appear in public DTO');
      await axe(page, 'admin-cms-list');
    });
    await test('Actual isolated rebuild displays publication, edit withdraws it, unpublish removes it', async () => {
      await build();
      const publicPage = await context.newPage();
      try { await publicPage.goto(base); await expect(publicPage.getByText('TEST ONLY browser CMS workflow', { exact: true })).toBeVisible(); } finally { await publicPage.close(); }
      const row = page.locator('.dash-record-list li').filter({ hasText: 'TEST ONLY browser CMS workflow' });
      await row.getByRole('button', { name: 'Edit', exact: true }).click(); await page.locator('#cms-description').fill('Private changed browser draft.');
      await page.getByRole('button', { name: 'Save draft', exact: true }).click(); await expect(row.locator('.dash-badge')).toHaveText('draft');
      assert.equal((await request(page, '/public-content')).body.data.skills.some(item => item.name === 'TEST ONLY browser CMS workflow'), false);
      assert.equal((await page.request.get(base)).status(), 503);
      await row.getByRole('button', { name: 'Publish', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).click(); await expect(page.getByRole('dialog')).toHaveCount(0);
      await row.getByRole('button', { name: 'Unpublish', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).click(); await expect(page.getByRole('dialog')).toHaveCount(0);
      await build();
      const publicPage2 = await context.newPage(); try { await publicPage2.goto(base); await expect(publicPage2.getByText('TEST ONLY browser CMS workflow', { exact: true })).toHaveCount(0); } finally { await publicPage2.close(); }
      assert.ok(await f.db.auditLog.count({ where: { entity: 'skills', actorId: f.users.ADMIN.id } }) > 0);
      const files = await readdir(resolve(root, 'frontend/.cache/test-public/assets'));
      const artifacts = (await readFile(resolve(root, 'frontend/.cache/test-public/index.html'), 'utf8')) + (await Promise.all(files.map(file => readFile(resolve(root, 'frontend/.cache/test-public/assets', file), 'utf8')))).join('');
      for (const sentinel of ['PRIVATE_PHASE08', f.password, process.env.JWT_SECRET, 'passwordHash', 'mysql://']) assert.equal(artifacts.includes(sentinel), false, 'Private sentinel in public artifact');
    });
    await restartApi();
    await test('Native link, Back, Forward, refresh and tab-close dirty warnings preserve changes', async () => {
      await route(page, '/admin/projects'); await route(page, '/admin/skills');
      await page.getByRole('button', { name: 'Add skill', exact: true }).click(); await page.getByLabel('Skill name', { exact: true }).fill('TEST ONLY unsaved history');
      await dialog(page, false, () => page.getByRole('link', { name: 'Education', exact: true }).click());
      await expect(page.getByLabel('Skill name', { exact: true })).toHaveValue('TEST ONLY unsaved history');
      await dialog(page, false, () => page.goBack().catch(() => null)); await expect(page).toHaveURL(base + '/admin/skills');
      await dialog(page, false, () => page.reload().catch(() => null)); await expect(page.getByLabel('Skill name', { exact: true })).toHaveValue('TEST ONLY unsaved history');
      await dialog(page, true, () => page.getByRole('button', { name: 'Cancel', exact: true }).click());
      await page.goBack(); await expect(page).toHaveURL(base + '/admin/projects');
      await page.getByRole('button', { name: 'Add project', exact: true }).click(); await page.getByLabel('Project title', { exact: true }).fill('TEST ONLY unsaved forward');
      await dialog(page, false, () => page.goForward().catch(() => null)); await expect(page.getByLabel('Project title', { exact: true })).toHaveValue('TEST ONLY unsaved forward');
      await dialog(page, false, async () => { await page.close({ runBeforeUnload: true }); });
      assert.equal(page.isClosed(), false); await expect(page.getByLabel('Project title', { exact: true })).toHaveValue('TEST ONLY unsaved forward');
      await dialog(page, true, () => page.getByRole('button', { name: 'Cancel', exact: true }).click());
    });
    await test('CMS network failure preserves entered values and reports actual failure', async () => {
      await route(page, '/admin/skills'); await page.getByRole('button', { name: 'Add skill', exact: true }).click(); await page.getByLabel('Skill name', { exact: true }).fill('TEST ONLY interrupted save');
      await page.route('**/api/v1/cms/skills', routeValue => routeValue.request().method() === 'POST' ? routeValue.abort('failed') : routeValue.continue());
      await page.getByRole('button', { name: 'Save draft', exact: true }).click(); await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.getByLabel('Skill name', { exact: true })).toHaveValue('TEST ONLY interrupted save');
      assert.equal(await f.db.skill.count({ where: { name: 'TEST ONLY interrupted save' } }), 0);
      await page.unroute('**/api/v1/cms/skills'); await dialog(page, true, () => page.getByRole('button', { name: 'Cancel', exact: true }).click());
    });
    await test('Media actual upload, approval, attachment, private/public guards and safe deletion', async () => {
      await restartApi();
      if (focus) await login(page, 'ADMIN');
      await route(page, '/admin/media');
      const sharp = (await import('sharp')).default;
      const image = await sharp({ create: { width: 100, height: 100, channels: 3, background: '#3385aa' } }).png().toBuffer();
      await page.getByLabel('Choose a file', { exact: true }).setInputFiles({ name: 'phase08-browser.png', mimeType: 'image/png', buffer: image });
      await page.getByLabel('Image description', { exact: true }).fill('TEST ONLY generated blue square');
      await page.getByRole('button', { name: 'Upload file', exact: true }).click(); await expect(page.getByRole('status').filter({ hasText: 'File uploaded privately' })).toBeVisible();
      const row = page.locator('.cms-media-grid li').filter({ hasText: 'phase08-browser.png' });
      let media = await f.db.mediaAsset.findFirst({ where: { fileName: 'phase08-browser.png' } });
      assert.equal((await request(page, '/media/' + media.id)).status, 404); assert.equal((await request(page, '/cms-media/' + media.id + '/file')).status, 200);
      await page.getByLabel('Choose a file', { exact: true }).setInputFiles({ name: 'phase08-second.png', mimeType: 'image/png', buffer: image });
      await page.getByLabel('Image description', { exact: true }).fill('TEST ONLY second blue square');
      const secondResponse = page.waitForResponse(response => response.url().includes('/api/v1/cms-media?') && response.request().method() === 'POST');
      await page.getByRole('button', { name: 'Upload file', exact: true }).click();
      assert.equal((await secondResponse).status(), 201, 'Second upload must succeed');
      const second = page.locator('.cms-media-grid li').filter({ hasText: 'phase08-second.png' });
      await expect(second).toBeVisible();
      await row.getByRole('button', { name: 'Edit / attach', exact: true }).click();
      const editor = page.locator('.dash-panel').filter({ has: page.getByRole('button', { name: 'Save media details', exact: true }) });
      await editor.getByLabel('Image description', { exact: true }).fill('TEST ONLY unsaved first description');
      await dialog(page, false, () => second.getByRole('button', { name: 'Edit / attach', exact: true }).click());
      await expect(editor.getByLabel('Image description', { exact: true })).toHaveValue('TEST ONLY unsaved first description');
      await dialog(page, true, () => second.getByRole('button', { name: 'Edit / attach', exact: true }).click());
      await expect(editor.getByLabel('Image description', { exact: true })).toHaveValue('TEST ONLY second blue square');
      await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
      await row.getByRole('button', { name: 'Edit / attach', exact: true }).click();
      await page.locator('select[name="projectId"]').selectOption(f.project.id); await page.getByRole('button', { name: 'Save media details', exact: true }).click();
      await row.getByRole('button', { name: 'Approve public use', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).click(); await expect(page.getByRole('dialog')).toHaveCount(0);
      assert.equal((await request(page, '/media/' + media.id)).status, 200);
      await row.getByRole('button', { name: 'Remove', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).click(); await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible(); await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
      await row.getByRole('button', { name: 'Edit / attach', exact: true }).click(); await page.locator('select[name="projectId"]').selectOption(''); await page.getByRole('button', { name: 'Save media details', exact: true }).click();
      await row.getByRole('button', { name: 'Remove', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).click(); await expect(row).toHaveCount(0);
      assert.equal((await request(page, '/media/' + media.id)).status, 404);
    });
    await test('Messages read/unread/archive/removal, focus and settings actual update', async () => {
      await restartApi();
      await route(page, '/admin/messages'); const row = page.locator('.dash-record-list li').filter({ hasText: 'TEST ONLY browser message' });
      await row.getByRole('button', { name: 'View message', exact: true }).click(); await expect(page.locator('.cms-preview h2')).toBeFocused(); await expect(row.locator('.dash-badge')).toHaveText('read');
      await row.getByRole('button', { name: 'Mark as unread', exact: true }).click(); await expect(row.locator('.dash-badge')).toHaveText('new');
      await row.getByRole('button', { name: 'Archive', exact: true }).click(); await expect(row.locator('.dash-badge')).toHaveText('archived');
      await axe(page, 'admin-messages');
      await row.getByRole('button', { name: 'Remove', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).click(); await expect(row).toHaveCount(0);
      await route(page, '/admin/settings'); await page.locator('textarea[name="description"]').fill('TEST ONLY browser updated metadata.'); await page.getByRole('button', { name: 'Save settings', exact: true }).click(); await expect(page.getByRole('status').filter({ hasText: 'Settings saved' })).toBeVisible();
      assert.equal((await f.db.siteSettings.findUnique({ where: { id: 'site' } })).description, 'TEST ONLY browser updated metadata.');
      await page.getByRole('button', { name: 'Sign out', exact: true }).click(); await expect(page).toHaveURL(base + '/login'); assert.equal((await request(page, '/auth/me')).status, 401);
    });
    await restartApi();
    await test('SUPER_ADMIN actual Operations, status, accounts, audit, keyboard and axe', async () => {
      await login(page, 'SUPER_ADMIN'); await expect(page.locator('.workspace.operations')).toBeVisible(); await axe(page, 'super-admin-overview'); await screenshot(page, 'chromium-operations-overview');
      for (const width of [320,375,390,768,1024,1440,1920]) { await page.setViewportSize({ width, height: 900 }); await overflow(page); await viewportScreenshots(page, 'chromium-operations-' + width); }
      await reflow(page, 'chromium-operations');
      await page.setViewportSize({ width: 1440, height: 1000 });
      await route(page, '/super-admin/status'); await expect(page.locator('.dash-content')).toContainText(/database/i); assert.equal((await request(page, '/dashboard/status')).status, 200);
      await route(page, '/super-admin/security'); await expect(page.locator('.dash-content')).toContainText(/login succeeded|content |media /); await axe(page, 'super-admin-security');
      await route(page, '/super-admin/users'); await expect(page.locator('.dash-content')).toContainText('TEST ONLY ADMIN'); await axe(page, 'super-admin-accounts');
    });
    await restartApi();
    await test('SUPER_ADMIN account creation, temporary-password gate, activation, recovery and session revocation', async () => {
      await route(page, '/super-admin/users');
      const temporary = randomBytes(24).toString('base64url');
      const permanent = randomBytes(24).toString('base64url');
      const recovered = randomBytes(24).toString('base64url');
      disposableSecrets.push(temporary, permanent, recovered);
      const email = 'phase08-created@example.invalid';
      const create = page.locator('form').filter({ has: page.getByRole('button', { name: 'Create ADMIN account', exact: true }) });
      await create.getByLabel('Display name', { exact: true }).fill('TEST ONLY browser created account');
      await create.getByLabel('Administrator email', { exact: true }).fill(email);
      await create.getByLabel('Temporary passphrase', { exact: true }).fill(temporary);
      await create.getByLabel('Your current password', { exact: true }).fill(f.password);
      await create.getByRole('button', { name: 'Create ADMIN account', exact: true }).click();
      const row = page.locator('.dash-record-list li').filter({ hasText: 'TEST ONLY browser created account' });
      await expect(row).toBeVisible();
      const created = await f.db.user.findUnique({ where: { email } });
      assert.equal(created.role, 'ADMIN'); assert.equal(created.mustChangePassword, true);
      const other = await browser.newContext(); const p = await other.newPage();
      try {
        await p.goto(base + '/login'); await p.getByLabel('Email address', { exact: true }).fill(email); await p.getByLabel('Password', { exact: true }).fill(temporary); await p.getByRole('button', { name: /Sign in/ }).click();
        await expect(p).toHaveURL(base + '/admin/account');
        assert.equal((await request(p, '/dashboard/summary')).status, 403);
        await p.getByLabel('Current password', { exact: true }).fill(temporary); await p.getByLabel('New password', { exact: true }).fill(permanent); await p.getByLabel('Repeat new password', { exact: true }).fill(recovered);
        await p.getByRole('button', { name: 'Change password & sign out', exact: true }).click(); await expect(p.getByRole('alert')).toContainText('do not match');
        await p.getByLabel('Repeat new password', { exact: true }).fill(permanent); await p.getByRole('button', { name: 'Change password & sign out', exact: true }).click(); await expect(p).toHaveURL(base + '/login');
        await p.getByLabel('Email address', { exact: true }).fill(email); await p.getByLabel('Password', { exact: true }).fill(permanent); await p.getByRole('button', { name: /Sign in/ }).click(); await expect(p).toHaveURL(base + '/admin');
        for (const [action, expected] of [['Deactivate', false], ['Activate', true]]) {
          await row.getByRole('button', { name: action, exact: true }).click(); const modal = page.getByRole('dialog'); await modal.getByLabel('Your current password', { exact: true }).fill(f.password); await modal.getByRole('button', { name: 'Confirm', exact: true }).click(); await expect(modal).toHaveCount(0);
          assert.equal((await f.db.user.findUnique({ where: { email } })).isActive, expected);
          if (!expected) assert.equal((await request(p, '/auth/me')).status, 401);
        }
        await row.getByRole('button', { name: 'Start recovery', exact: true }).click(); const modal = page.getByRole('dialog'); await modal.getByLabel('Your current password', { exact: true }).fill(f.password); await modal.getByLabel(/Temporary passphrase/).fill(recovered); await modal.getByRole('button', { name: 'Confirm', exact: true }).click(); await expect(modal).toHaveCount(0);
        assert.equal((await f.db.user.findUnique({ where: { email } })).mustChangePassword, true);
        await row.getByRole('button', { name: 'Revoke sessions', exact: true }).click(); await page.getByRole('dialog').getByLabel('Your current password', { exact: true }).fill(f.password); await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).click(); await expect(page.getByRole('dialog')).toHaveCount(0);
        assert.equal(await f.db.authSession.count({ where: { userId: created.id, revokedAt: null } }), 0);
      } finally { await other.close(); }
      await route(page, '/super-admin/account'); await expect(page.getByRole('heading', { name: 'Your active sessions', exact: true })).toBeVisible(); await axe(page, 'super-admin-account');
      await page.getByRole('button', { name: 'Sign out', exact: true }).click(); await expect(page).toHaveURL(base + '/login');
      await expect(page.getByLabel('Email address', { exact: true })).toBeVisible();
      assert.deepEqual(consoleErrors, []);
    });
    if (!focus) await build();
    await context.close(); await browser.close(); browser = null;
    for (const [name, type, options] of [['Firefox', firefox, {}], ['WebKit', webkit, {}], ['Chrome', chromium, { channel: 'chrome' }], ['Edge', chromium, { channel: 'msedge' }]]) {
      if (focus && !name.toLowerCase().includes(focus)) { report.notRun.push(name + ' compatibility (not selected)'); continue; }
      await restartApi();
      try { browser = await type.launch({ headless: true, ...options }); report.engines.push({ name, version: browser.version(), launch: 'PASSED' }); }
      catch (error) { report.engines.push({ name, launch: 'BLOCKED', error: safe(error) }); continue; }
      await test(name + ' real browser public hydration, mobile menu, ADMIN and SUPER_ADMIN login', async () => {
        const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
        try {
          const p = await c.newPage(); const engineErrors = []; let phase = 'public';
          p.on('pageerror', error => engineErrors.push({ phase, error: safe(error) }));
          await p.goto(base); await p.waitForFunction(() => !document.querySelector('.public-contact-form button')?.disabled); await expect(p.locator('#hero-title')).toBeVisible(); await overflow(p);
          await p.locator('.mobile-menu summary').click();
          const about = p.locator('.mobile-nav').getByRole('link', { name: 'About', exact: true });
          await expect(about).toBeVisible();
          const bounds = await about.boundingBox(); assert.ok(bounds);
          // Send a real mouse click and assert the same-document result explicitly.
          // Firefox's locator post-click navigation wait can stall after the disclosure closes.
          await p.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
          await expect(p).toHaveURL(/#about$/);
          await expect(p.locator('.mobile-menu')).not.toHaveAttribute('open', '');
          await expect(p.locator('#about')).toBeFocused();
          await screenshot(p, name.toLowerCase() + '-public-390');
          phase = 'ADMIN login/menu';
          await login(p, 'ADMIN'); await p.getByRole('button', { name: /^Menu/ }).click(); await expect(p.locator('.dash-sidebar nav a').first()).toBeFocused(); await p.keyboard.press('Escape'); await expect(p.getByRole('button', { name: /^Menu/ })).toBeFocused();
          phase = 'ADMIN logout';
          await p.getByRole('button', { name: /^Menu/ }).click(); await p.getByRole('button', { name: 'Sign out', exact: true }).click(); await expect(p).toHaveURL(base + '/login');
          phase = 'SUPER_ADMIN login';
          await login(p, 'SUPER_ADMIN'); await expect(p.locator('.workspace.operations')).toBeVisible(); await overflow(p); assert.deepEqual(engineErrors, []);
        } finally { await c.close(); }
      });
      await browser.close(); browser = null;
    }
  } catch (error) { report.tests.push({ name: 'Harness prerequisite/runtime', status: 'FAILED', error: safe(error) }); errors.push(error); console.log('FAIL harness: ' + safe(error)); }
  finally {
    try {
      for (const [name, stop] of [
        ['Browser shutdown', () => browser ? bounded(browser.close(), 10000, 'Owned browser') : undefined],
        ['Preview shutdown', () => stopPreview(previewServer)],
        ['API shutdown', () => stopChild(apiChild)],
      ]) {
        try { await stop(); }
        catch (error) { errors.push(error); report.tests.push({ name, status: 'FAILED', error: safe(error) }); }
      }
    } finally {
      try { await f.cleanup(); report.cleanup = 'PASSED: all 13 isolated application tables empty'; }
      catch (error) { report.cleanup = 'FAILED'; errors.push(error); report.tests.push({ name: 'Fixture cleanup', status: 'FAILED', error: safe(error) }); }
      finally {
        report.finishedAt = new Date().toISOString();
        report.totals = { passed: report.tests.filter(test => test.status === 'PASSED').length, failed: report.tests.filter(test => test.status === 'FAILED').length, blockedEngines: report.engines.filter(engine => engine.launch === 'BLOCKED').length };
        await writeFile(resolve(reportDirectory, 'results.json'), JSON.stringify(report, null, 2));
        console.log(JSON.stringify({ totals: report.totals, cleanup: report.cleanup, report: '.cache/phase08-browser/results.json' }));
        process.exitCode = errors.length || report.engines.some(engine => engine.launch === 'BLOCKED') ? 1 : 0;
      }
    }
  }
}
