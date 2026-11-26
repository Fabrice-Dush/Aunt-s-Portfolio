// Public read-only browser review. Never submits the real development contact form.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';

const before = process.argv.includes('--before');
const selectedOnly = process.argv.includes('--selected-only');
const base = process.argv.find(arg => arg.startsWith('--base='))?.slice(7) ?? 'http://localhost:5173';
assert.ok(['http://localhost:5173', 'http://127.0.0.1:4496'].includes(base), 'Only documented local review servers');
const performanceLabel = process.argv.find(arg => arg.startsWith('--performance='))?.slice(14);
assert.ok(!performanceLabel || ['before', 'after'].includes(performanceLabel));
const output = performanceLabel ? `.cache/performance-review/${performanceLabel}${selectedOnly ? '-selected-corrected' : ''}` : `.cache/public-story/${before ? 'before' : 'after'}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const report = { browser: browser.version(), screenshots: [], scans: [], errors: [], passed: false };
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.setDefaultTimeout(15000);
page.setDefaultNavigationTimeout(30000);
page.on('pageerror', error => report.errors.push(error.message));
async function capture(name, locator) {
  const path = `${output}/${name}.png`;
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  if (locator) {
    // Crop the actual full-page capture at scroll origin; element screenshots can
    // move Chromium's sticky header into the middle of a tall section.
    // Full-page pixels use document coordinates, even if keyboard focus has
    // caused native scrolling between the scroll reset and the screenshot.
    const bounds = await locator.evaluate(node => {
      const rect = node.getBoundingClientRect();
      return { x: rect.left + scrollX, y: rect.top + scrollY, width: rect.width, height: rect.height };
    });
    const buffer = await page.screenshot({ fullPage: true, animations: 'disabled' });
    await sharp(buffer).extract({ left: Math.round(bounds.x), top: Math.round(bounds.y), width: Math.round(bounds.width), height: Math.round(bounds.height) }).toFile(path);
  }
  else {
    for (const img of await page.locator('img').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(i => i.decode());
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path, fullPage: true, animations: 'disabled' });
  }
  report.screenshots.push(path);
}
try {
  await page.goto(base + '/');
  await expect(page.locator('#expertise')).toBeVisible();
  const publicContent = await (await page.request.get(base + '/api/v1/public-content')).json();
  await writeFile(`${output}/public-content.json`, JSON.stringify(publicContent));
  for (const theme of ['light', 'dark']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme) await page.getByRole('switch').click();
    await page.locator('.expertise-card').first().click();
    if (!before) {
      for (const stage of await page.locator('.science-stage').all()) if (await stage.evaluate(el => el.open)) { await stage.locator('summary').focus(); await page.keyboard.press('Enter'); }
      await page.locator('.science-stage summary').first().focus(); await page.keyboard.press('Enter');
    }
    for (const width of selectedOnly ? [] : [320, 375, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow ${theme} ${width}`);
      if ([390, 1440].includes(width)) {
        await capture(`${theme}-${width}-full`);
        for (const id of before ? ['about', 'expertise', 'contact'] : ['about', 'expertise', 'water-science', 'contact']) await capture(`${theme}-${width}-${id}`, page.locator(`#${id}`));
        if (!before) {
          const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
          report.scans.push({ theme, width, violations: axe.violations, incomplete: axe.incomplete });
          assert.equal(axe.violations.length, 0, `Axe ${theme} ${width}`);
        }
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('.expertise-card').last().focus();
    await page.keyboard.press('Space');
    await expect(page.locator('.expertise-card').last()).toHaveAttribute('aria-pressed', 'true');
    await capture(`${theme}-expertise-selected`, page.locator('#expertise'));
    if (!before) {
      await expect(page.locator('#expertise-detail')).toContainText('General field context');
      if (await page.locator('.science-stage').last().evaluate(el => el.open)) { await page.locator('.science-stage summary').last().focus(); await page.keyboard.press('Enter'); }
      await page.locator('.science-stage summary').last().focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('.science-stage').last()).toHaveAttribute('open', '');
      await expect(page.locator('.science-stage').last()).toContainText('corrective action');
      await capture(`${theme}-science-selected`, page.locator('#water-science'));
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('.expertise-card').last().click();
      await expect(page.locator('#expertise-mobile-detail')).toBeVisible();
      await expect(page.locator('#expertise-mobile-detail')).toContainText('coordinated decisions');
      await capture(`${theme}-390-expertise-selected`, page.locator('#expertise'));
      for (const href of await page.locator('a[href^="#"]').evaluateAll(links => links.map(a => a.getAttribute('href')))) assert.ok(await page.locator(href).count(), `Dead anchor ${href}`);
    }
  }
  if (!before && !selectedOnly) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.ok(await page.evaluate(() => document.getAnimations().every(a => a.playState !== 'running')));
    const nojs = await browser.newContext({ javaScriptEnabled: false });
    const fallback = await nojs.newPage();
    await fallback.goto(base + '/');
    if (base.endsWith(':4496')) {
      await expect(fallback.locator('#hero-title')).toBeVisible();
      await expect(fallback.locator('.expertise-card').first()).toBeDisabled();
      await expect(fallback.locator('.expertise-fallback details')).toHaveCount(publicContent.data.skills.length);
      await fallback.locator('.science-stage summary').last().click();
      await expect(fallback.locator('.science-stage').last()).toHaveAttribute('open', '');
      await expect(fallback.locator('.public-contact-form button')).toBeDisabled();
      report.noJavaScript = 'PASSED compiled public HTML, native disclosures, skill fallbacks and disabled contact submission';
    } else report.noJavaScript = 'Verified by production artifact tests, not the Vite development shell';
    await nojs.close();
    // Browser-response fixtures test conditional layouts only. No CMS/database writes.
    const synthetic = structuredClone(publicContent);
    synthetic.revision = 'TEST-ONLY-browser-layout-fixture';
    synthetic.data.profile.summary = 'TEST ONLY browser layout fixtures. These are not client records.';
    synthetic.data.experience = [0, 1, 2].map(i => ({ id: `test-role-${i}`, jobTitle: `TEST ONLY role ${i}`, organization: 'TEST ONLY organization', startYear: null, endYear: null, isCurrent: false, description: 'TEST ONLY published description.', responsibilities: 'TEST ONLY responsibility. A long paragraph verifies wrapping and keyboard disclosure.' }));
    synthetic.data.education = [{ id: 'test-education', qualification: 'TEST ONLY qualification', institution: 'TEST ONLY institution', country: null, yearCompleted: null, notes: 'TEST ONLY supporting information.' }];
    synthetic.data.projects = [{ id: 'test-project', slug: 'test-layout', title: 'TEST ONLY contribution', summary: 'TEST ONLY summary.', body: 'TEST ONLY supporting detail.', role: 'TEST ONLY role', result: 'TEST ONLY outcome', year: null, organization: null, startYear: null, endYear: null, featured: false, media: [] }];
    synthetic.data.certifications = [{ id: 'test-certificate', title: 'TEST ONLY training', issuer: null, year: null, credentialDetails: 'TEST ONLY training detail.', media: null }];
    await context.route('**/api/v1/public-content', route => route.fulfill({ json: synthetic }));
    await page.goto(base + '/');
    await expect(page.locator('#experience')).toBeVisible();
    for (const theme of ['light', 'dark']) {
      if (await page.locator('html').getAttribute('data-theme') !== theme) await page.getByRole('switch').click();
      for (const width of [320, 390, 768, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1000 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Fixture overflow ${theme} ${width}`);
        if ([390, 1440].includes(width)) {
          await capture(`TEST-ONLY-${theme}-${width}-collections`);
          const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
          report.scans.push({ mode: 'BROWSER RESPONSE FIXTURE ONLY', theme, width, violations: axe.violations, incomplete: axe.incomplete });
          assert.equal(axe.violations.length, 0);
        }
      }
    }
    await page.locator('.project-detail summary').focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.project-detail')).toHaveAttribute('open', '');
    await expect(page.locator('.project-detail')).toContainText('TEST ONLY supporting detail');
    report.conditionalLayouts = 'PASSED browser-response fixtures; no database/publication acceptance implied';
  }
  assert.deepEqual(report.errors, []);
  report.passed = true;
} catch (error) { report.failure = String(error.stack); process.exitCode = 1; }
finally { await browser.close(); await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2)); }
console.log(JSON.stringify({ passed: report.passed, failure: report.failure, screenshots: report.screenshots.length, scans: report.scans.length, output }));
