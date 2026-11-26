// Browser-only design review. --fixture never contacts or mutates a database.
// Without it, uses authorized existing development accounts without recording secrets.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const fixture = process.argv.includes('--fixture');
const isolated = process.argv.includes('--isolated');
const selectedScope = process.argv.find(arg => arg.startsWith('--scope='))?.slice(8);
const completion = process.argv.includes('--completion');
const overviewOnly = process.argv.includes('--overview-only');
const base = isolated ? 'http://127.0.0.1:5178' : 'http://localhost:5173';
const output = completion ? resolve('.cache/final-completion/dashboards') : resolve('.cache/visual-refresh', fixture ? 'fixture' : isolated ? 'isolated' : 'live');
await mkdir(output, { recursive: true });
const report = { at: new Date().toISOString(), mode: fixture ? 'BROWSER-ONLY FIXTURES; NO FUNCTIONAL OR LIVE-DATABASE ACCEPTANCE' : isolated ? 'Real isolated APIs with synthetic fixtures; no development writes' : 'Existing development accounts; read-only content review', screenshots: [], checks: [], accessibility: [], errors: [], passed: false };
const snapshot = fixture ? JSON.parse(await readFile('frontend/.cache/public-content.json', 'utf8')) : null;
let credentials;
try {
  if(isolated) { let input=''; for await(const chunk of process.stdin) input+=chunk; credentials=JSON.parse(input); }
  else credentials = fixture ? null : JSON.parse(await readFile('.cache/development-dashboard-private/credentials.json', 'utf8'));
} catch { throw new Error('Private review credentials are unavailable; sensitive diagnostics suppressed.'); }
const browser = await chromium.launch({ headless: true });
report.browser = browser.version();
let stage = 'start';
async function capture(page, name, fullPage = false) {
  if (fullPage) {
    // Full-page screenshots do not scroll through native lazy-loading thresholds.
    // Visit each visible image before capture so the sculpture is actually reviewed.
    for (const asset of await page.locator('img').all()) {
      if (await asset.isVisible()) {
        await asset.scrollIntoViewIfNeeded();
        await asset.evaluate(image => image.decode());
        assert.ok(await asset.evaluate(image => image.naturalWidth > 0), 'Visible review image must load');
      }
    }
  }
  await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
  const portraitContainer = page.locator('.hero-media');
  if (await portraitContainer.count()) {
    await portraitContainer.evaluate(async node => {
      await Promise.all(node.getAnimations().map(animation => animation.finished.catch(() => {})));
      if (getComputedStyle(node).transform !== 'none') throw new Error('Portrait animation must release its stacking context so the approval caption stays above decorative water.');
    });
  }
  const portrait=page.locator('.hero-photo-frame img');
  if(await portrait.count()) await portrait.evaluate(image => image.decode());
  if (fixture) await page.evaluate(() => {
    if (document.getElementById('fixture-label')) return;
    const label = document.createElement('div'); label.id = 'fixture-label'; label.textContent = 'BROWSER FIXTURE / DESIGN REVIEW ONLY';
    label.setAttribute('style','position:fixed;bottom:0;right:0;z-index:1000;background:#102e49;color:#fff;padding:6px 12px;font:11px Arial'); document.body.append(label);
  });
  await page.screenshot({ path: resolve(output,name + '.png'), fullPage, animations: 'disabled' });
  report.screenshots.push(name + '.png');
}
async function overflow(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Horizontal overflow at ' + await page.evaluate(() => innerWidth));
}
async function axe(page, name) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  report.accessibility.push({ name, violations: r.violations, incomplete: r.incomplete });
}
async function mocked(context, role) {
  const now = '2026-11-23T08:00:00.000Z';
  const profile = { ...snapshot.data.profile, id: 'visual-profile', updatedAt: now, status: 'PUBLISHED', verified: true };
  const collections = Object.fromEntries(['experience','education','skills','projects','achievements','certifications'].map(area => [area, snapshot.data[area].map(row => ({ ...row, status: 'PUBLISHED', verified: true, updatedAt: now }))]));
  const contentStates = Object.entries({ profile: [profile], ...collections }).map(([area, rows]) => ({ area: ({skills:'skill',projects:'project',achievements:'achievement',certifications:'certificate'})[area] ?? area, states: rows.length ? [{status:'PUBLISHED',_count:{_all: rows.length}}] : [] }));
  const user = { id: 'visual-account', displayName: 'Synthetic visual reviewer', email: 'visual-review@example.invalid', role, isActive: true, mustChangePassword: false, createdAt: now };
  await context.route('**/api/v1/**', async route => {
    assert.equal(route.request().method(), 'GET', 'Visual fixture refuses mutations');
    const path = new URL(route.request().url()).pathname.replace('/api/v1','');
    let data = [];
    if (path === '/public-content') return route.fulfill({ json: snapshot });
    if (path === '/auth/me') data = user;
    else if (path === '/dashboard/summary') data = { experience:0,education:0,skills:6,certifications:0,publishedProjects:0,draftProjects:0,messages:0,activeAdmins:0,contentStates,profile,media:{_count:{id:0},_sum:{bytes:0}},recentPublications:[] };
    else if (path === '/cms/profile') data = [profile];
    else if (path.startsWith('/cms/')) data = collections[path.slice(5)] ?? [];
    else if (path === '/cms-sync') data = { current:false, revision:snapshot.revision, builtRevision:null, indexed:false };
    else if (path === '/cms-settings') data = {siteTitle:'Synthetic visual review',description:'Browser fixture only',allowIndexing:false,updatedAt:now};
    else if (path === '/dashboard/status') data = { api:'Browser fixture only',database:'NOT CHECKED',checkedAt:now,contentEditing:'NOT CHECKED',analytics:'Not configured' };
    return route.fulfill({ json: { data, pagination: {page:1,hasMore:false} } });
  });
}
try {
  for (const scope of ['public','studio','operations'].filter(scope => !selectedScope || scope === selectedScope)) {
    const role = scope === 'operations' ? 'SUPER_ADMIN' : 'ADMIN';
    const context = await browser.newContext({viewport:{width:1440,height:1000}});
    if (fixture) await mocked(context, role);
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(30000);
    await page.addInitScript(() => { window.__appearanceFirstFrame = new Promise(done => requestAnimationFrame(() => done(document.documentElement.dataset.theme))); });
    page.on('pageerror', e => report.errors.push({scope,message: String(e.message).slice(0,400)}));
    const home = scope === 'public' ? '/' : scope === 'studio' ? '/admin' : '/super-admin';
    stage = scope + ' open';
    if (!fixture && scope !== 'public') {
      await page.goto(base + '/login');
      await page.getByLabel('Email address',{exact:true}).fill(credentials[role].email);
      await page.getByLabel('Password',{exact:true}).fill(credentials[role].password);
      await page.getByRole('button',{name:/Sign in/}).click();
      await expect(page).toHaveURL(base + home,{timeout:15000});
    } else await page.goto(base + home);
    await expect(page.locator(scope === 'public' ? '#hero-title' : '.workspace')).toBeVisible();
    if (scope !== 'public') await expect(page.locator('.dash-loading')).toHaveCount(0);
    assert.equal(await page.locator('html').getAttribute('data-theme'),scope === 'operations' ? 'dark' : 'light');
    for (const theme of ['light','dark']) {
      stage = scope + ' ' + theme;
      const control = page.getByRole('switch',{name:'Dark appearance'});
      if ((await control.getAttribute('aria-checked') === 'true') !== (theme === 'dark')) await control.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
      await page.reload();
      await expect(page.locator(scope === 'public' ? '#hero-title' : '.workspace')).toBeVisible();
      if(scope !== 'public') await expect(page.locator('.dash-loading')).toHaveCount(0);
      await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
      assert.equal(await page.evaluate(() => window.__appearanceFirstFrame), theme, 'Stored appearance is applied before first animation frame');
      for (const width of [320,375,390,768,1024,1440,1920]) {
        await page.setViewportSize({width,height:1000}); await overflow(page);
        if ([390,1440].includes(width)) {
          await capture(page,scope+'-'+theme+'-'+width);
          await capture(page,scope+'-'+theme+'-'+width+'-full',true);
        }
      }
      await page.setViewportSize({width:1440,height:1000});
      await axe(page,scope+'-'+theme);
      if(scope === 'public') {
        await page.locator('.expertise-card').last().focus(); await page.keyboard.press('Space');
        await expect(page.locator('.expertise-card').last()).toHaveAttribute('aria-pressed','true');
        await capture(page,'expertise-'+theme,true);
      }
      report.checks.push({scope,theme,persistence:'PASS',beforeFirstFrame:'PASS',responsive:'PASS'});
    }
    if(scope !== 'public' && !overviewOnly) {
      for(const area of !isolated && !fixture ? ['profile'] : scope === 'studio' ? ['profile','experience','education','skills','projects','achievements','certifications','media','messages','settings','account'] : ['users','security','status','profile','experience','education','skills','projects','achievements','certifications','media','messages','settings','account']) {
        stage = scope + ' ' + area;
        await page.goto(base+home+'/'+area); await expect(page.locator('.workspace')).toBeVisible();
        await expect(page.locator('.dash-loading')).toHaveCount(0);
        if(area === 'profile') { await page.getByRole('button',{name:'Edit',exact:true}).first().click(); await expect(page.locator('#cms-summary')).toBeVisible(); }
        for(const theme of ['light','dark']) {
          stage = scope + ' ' + area + ' ' + theme;
          const control=page.getByRole('switch',{name:'Dark appearance'});
          if((await control.getAttribute('aria-checked')==='true') !== (theme==='dark')) await control.click();
          for(const width of [1440,390]) {
            await page.setViewportSize({width,height:1000}); await overflow(page); await capture(page,scope+'-'+area+'-'+theme+'-'+width,true);
          }
          if(['profile','media','messages','account','users','security','settings'].includes(area)) await axe(page,scope+'-'+area+'-'+theme);
        }
      }
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.ok(await page.evaluate(() => [...document.getAnimations()].every(a => a.playState !== 'running')), 'Reduced motion disables animations');
    if(!fixture && scope !== 'public') { await page.setViewportSize({width:1440,height:1000}); await page.getByRole('button',{name:'Sign out',exact:true}).click(); await expect(page).toHaveURL(base + '/login'); }
    await context.close();
  }
  assert.deepEqual(report.errors,[]);
  assert.equal(report.accessibility.reduce((n,r)=>n+r.violations.length,0),0,'Axe violations require correction');
  report.passed=true;
} catch(error) { report.failedStage=stage; report.failure=String(error.stack).slice(0,2000); if(credentials) for(const account of [credentials.ADMIN,credentials.SUPER_ADMIN]) for(const secret of [account?.password,account?.email]) if(secret) report.failure=report.failure.replaceAll(secret,'[redacted]'); process.exitCode=1; }
finally { await browser.close(); await writeFile(resolve(output,'results' + (selectedScope ? '-' + selectedScope : '') + '.json'),JSON.stringify(report,null,2)); }
console.log(JSON.stringify({passed:report.passed,stage:report.failedStage,screenshots:report.screenshots.length,axeViolations:report.accessibility.reduce((n,r)=>n+r.violations.length,0),report:resolve(output,'results' + (selectedScope ? '-' + selectedScope : '') + '.json')}));
