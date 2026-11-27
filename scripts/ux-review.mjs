// Read-only development + compiled review. Login/logout append normal auth audits;
// no CMS save, publication, contact POST or fixture insert touches development.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';

const compiled = process.argv.includes('--compiled');
const privateOnly = process.argv.includes('--private-only');
const publicOnly = process.argv.includes('--public-only');
assert.ok(!(privateOnly && publicOnly));
const out = `.cache/ux-improvements/${compiled ? 'after-compiled' : 'after-dev'}${privateOnly ? '-private' : publicOnly ? '-public' : ''}`;
const base = compiled ? 'http://127.0.0.1:4496' : 'http://localhost:5173';
await mkdir(out, { recursive: true });
let server, browser;
const report = { passed: false, screenshots: [], scans: [], checks: [], errors: [] };
report.selection = privateOnly ? 'private-only' : publicOnly ? 'public-only' : 'all';
async function capture(page, name, selector) {
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  const path = `${out}/${name}.png`;
  if (selector) {
    const rect = await page.locator(selector).evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }; });
    const full = await page.screenshot({ fullPage: true, animations: 'disabled' });
    await sharp(full).extract({ left: Math.round(rect.x), top: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) }).toFile(path);
  } else await page.screenshot({ path, fullPage: true, animations: 'disabled' });
  report.screenshots.push(path);
}
async function loadImages(page) {
  for (const img of await page.locator('img').all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate(n=>Promise.race([n.decode(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Image decode deadline')),15000))]));
  }
}
async function axe(page, name) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  report.scans.push({ name, violations: result.violations, incomplete: result.incomplete });
  assert.equal(result.violations.length, 0, `axe: ${name}`);
}
async function nativeExpandedState(page, selector) {
  // Playwright's JS ARIA snapshot omits native DisclosureTriangle semantics.
  // Inspect Chromium's actual accessibility tree instead of adding redundant ARIA.
  const client=await page.context().newCDPSession(page);
  try {
    const {root}=await client.send('DOM.getDocument');
    const {nodeId}=await client.send('DOM.querySelector',{nodeId:root.nodeId,selector});
    const {node}=await client.send('DOM.describeNode',{nodeId});
    const {nodes}=await client.send('Accessibility.getPartialAXTree',{backendNodeId:node.backendNodeId,fetchRelatives:false});
    const disclosure=nodes.find(n=>/^DisclosureTriangle(?:Grouped)?$/.test(n.role?.value??''));
    assert.ok(disclosure,'Native disclosure role');
    return disclosure.properties.find(p=>p.name==='expanded')?.value.value;
  } finally {await client.detach();}
}
async function reflow(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal page overflow');
  const cards = await page.locator('.expertise-option').evaluateAll(nodes => nodes.map(n => { const r=n.getBoundingClientRect();return { x:r.x,y:r.y,right:r.right,bottom:r.bottom }; }));
  for (let i=0;i<cards.length;i++) for (let j=i+1;j<cards.length;j++) {
    const a=cards[i], b=cards[j]; assert.ok(a.right <= b.x+1 || b.right <= a.x+1 || a.bottom <= b.y+1 || b.bottom <= a.y+1, 'Cards never overlap');
  }
  if (await page.evaluate(() => innerWidth > 1100)) {
    const sculpture = await page.locator('.expertise-sculpture').boundingBox();
    for (const card of cards) assert.ok(card.right <= sculpture.x+1 || card.x >= sculpture.x+sculpture.width-1, 'Reserved sculpture column');
  }
}
async function accordion(page, width, theme) {
  await expect(page.locator('.expertise-option[open]')).toHaveCount(0);
  await capture(page, `${theme}-${width}-expertise-collapsed`, '#expertise');
  const cards = page.locator('.expertise-card');
  for (let i=0;i<await cards.count();i++) {
    await cards.nth(i).focus();
    await page.keyboard.press(i%2 ? 'Space' : 'Enter');
    await expect(page.locator('.expertise-option[open]')).toHaveCount(1);
    await expect(page.locator('.expertise-option').nth(i)).toHaveAttribute('open','');
    await expect(page.locator('.expertise-option').nth(i).locator('.expertise-inline-detail')).toBeVisible();
    assert.ok(await cards.nth(i).evaluate(el=>el===document.activeElement), 'Focus stays on the selected trigger');
    await reflow(page);
    await expect(cards.nth(i)).toBeInViewport({ratio:0.1});
    if (i===0 || i===await cards.count()-1) await capture(page, `${theme}-${width}-expertise-${i===0?'expanded':'switched'}`, '#expertise');
    if (i===0) {assert.equal(await nativeExpandedState(page,'.expertise-card'),true,'Native expanded state is exposed');await axe(page,`expertise-open-${theme}-${width}`);}
  }
  await cards.last().click();
  await expect(page.locator('.expertise-option[open]')).toHaveCount(0);
}
try {
  if (compiled && !privateOnly) {
    let ready=false;
    server=spawn(process.execPath,['scripts/phase08-performance-server.mjs'],{env:{...process.env,NODE_ENV:'production',PORT:'4496'},stdio:['ignore','pipe','pipe'],windowsHide:true});
    server.stdout.on('data',b=>{if(String(b).includes('Portfolio API available'))ready=true;}); server.stderr.on('data',()=>{});
    for(let i=0;i<300&&!ready&&server.exitCode===null;i++)await delay(100);
    assert.ok(ready,'Compiled server readiness');
  }
  browser=await chromium.launch(); report.browser=browser.version();
  if (!privateOnly) {
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage(); page.setDefaultTimeout(15000); page.setDefaultNavigationTimeout(30000);
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(base);
  const publicResponse=await page.request.get(base+'/api/v1/public-content');
  const dto=await publicResponse.json(); const serialized=JSON.stringify(dto);
  assert.doesNotMatch(serialized,/demo-review-notebook|Fictional demonstration institution|Sample Project/);
  assert.equal(dto.data.profile.experienceDescription,null);
  for(const section of ['experience','education','projects','achievements','certifications'])assert.equal(dto.data[section].length,0);
  assert.equal((await page.request.get(base+'/api/v1/cms/design-preview')).status(),401);
  for(const theme of ['light','dark']) {
    await page.evaluate(t=>{document.documentElement.dataset.theme=t;localStorage.setItem('seraphine-appearance-public',t)},theme);
    for(const width of [320,375,390,768,1024,1440,1920]) {
      await page.setViewportSize({width,height:1000}); await reflow(page);
      if([390,1440].includes(width)) {
        await accordion(page,width,theme);
        await page.locator('#contact').scrollIntoViewIfNeeded();
        await loadImages(page);
        await capture(page,`${theme}-${width}-public-full`);
        for(const selector of ['.hero','#water-science','#contact'])await capture(page,`${theme}-${width}-${selector.replace(/[.#]/g,'')}`,selector);
        await axe(page,`public-${theme}-${width}`);
      }
      assert.doesNotMatch(await page.locator('body').innerText(),/PRIVATE DESIGN REVIEW|PORTRAIT CONCEPT \/ OWNER APPROVAL PENDING|Explore the evidence|WHO: water safety planning|CDC: how water treatment works/);
    }
  }
  // An authored CMS response must replace educational fallback inline. This
  // response fixture writes no content and is never used for design screenshots.
  const authored=structuredClone(dto); authored.revision='ux-test-authored'; authored.data.skills[0].description='TEST ONLY authored explanation. Additional approved context.';
  await page.route('**/api/v1/public-content',r=>r.fulfill({json:authored}));
  await page.waitForLoadState('networkidle');
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(page.locator('.expertise-inline-detail').first()).toContainText('Additional approved context.', {timeout:15000});
  authored.revision='ux-test-long-description'; authored.data.skills[0].description='TEST ONLY long CMS explanation. '+('UnbrokenLongTechnicalTerm'.repeat(12)+' ').repeat(20);
  await page.route('**/api/v1/public-content',r=>r.fulfill({json:authored}));
  await page.waitForLoadState('networkidle'); await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(page.locator('.expertise-inline-detail').first()).toContainText('UnbrokenLongTechnicalTerm',{timeout:15000});
  for(const width of [320,768,1024,1440,1920]) {
    await page.setViewportSize({width,height:1000});
    if(!await page.locator('.expertise-option').first().evaluate(n=>n.open))await page.locator('.expertise-card').first().click();
    await reflow(page);
  }
  // Native activation may reflow the page, but must never invoke scripted
  // scrolling, navigation or focus replacement.
  await page.evaluate(()=>{window.__uxScrollCalls=0;for(const key of ['scrollTo','scrollBy'])window[key]=()=>{window.__uxScrollCalls++};Element.prototype.scrollIntoView=function(){window.__uxScrollCalls++};});
  await page.locator('.expertise-card').last().click();await expect(page.locator('.expertise-option[open]')).toHaveCount(1);
  assert.equal(await page.evaluate(()=>window.__uxScrollCalls),0,'No scripted selection scrolling');
  await page.route('**/api/v1/public-content',r=>r.fulfill({status:503,json:{error:'TEST ONLY'}}));
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('heading',{name:'Portfolio temporarily unavailable'})).toBeVisible();
  await page.unroute('**/api/v1/public-content');
  await page.evaluate(()=>window.dispatchEvent(new Event('focus'))); await expect(page.locator('#expertise')).toBeVisible();
  report.checks.push('Public isolation, both themes, seven widths, native accordion, focus, authored content and failure recovery');
  const touch=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
  try {
    const p=await touch.newPage();p.setDefaultTimeout(15000);await p.goto(base);
    for(const theme of ['light','dark']) {
      await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);
      for(const card of await p.locator('.expertise-card').all()) {await card.tap();await expect(p.locator('.expertise-option[open]')).toHaveCount(1);}
      await p.locator('.expertise-card').last().tap();await expect(p.locator('.expertise-option[open]')).toHaveCount(0);
    }
    report.checks.push('Simulated phone touch activates every native specialization in both themes');
  } finally {await touch.close();}
  if(compiled) {
    const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
    try{const p=await nojs.newPage();p.setDefaultTimeout(15000);await p.goto(base);await p.locator('.expertise-card').first().click();await expect(p.locator('.expertise-option').first().locator('.expertise-inline-detail')).toBeVisible();await p.locator('.expertise-card').last().click();await expect(p.locator('.expertise-option[open]')).toHaveCount(1);await capture(p,'nojs-390-expertise','#expertise');await p.locator('.expertise-card').last().click();await expect(p.locator('.expertise-option[open]')).toHaveCount(0);await p.locator('.science-stage summary').last().click();await expect(p.locator('.science-stage').last()).toHaveAttribute('open','');await expect(p.locator('.public-contact-form button')).toBeDisabled();report.checks.push('Compiled no-JavaScript accordion, science, content and disabled message form');}finally{await nojs.close();}
  }
  await context.close();
  }
  // Real normal development credentials are read only in memory and never logged.
  if (!publicOnly) {
  const credentials=JSON.parse(await readFile('.cache/development-dashboard-private/credentials.json','utf8'));
  const privateBase=credentials.origin; assert.equal(privateBase,'http://localhost:5173');
  for(const role of ['ADMIN','SUPER_ADMIN']) {
    const c=await browser.newContext({viewport:{width:1440,height:1000}});
    try {
      const p=await c.newPage();p.setDefaultTimeout(15000);p.setDefaultNavigationTimeout(30000);p.on('pageerror',e=>report.errors.push(e.message));
      const home=role==='ADMIN'?'/admin':'/super-admin';
      await p.goto(privateBase+home+'/design-preview');await expect(p).toHaveURL(privateBase+'/login');
      assert.doesNotMatch(await p.content(),/demo-review-notebook|Sample Project/);
      await p.getByLabel('Email address',{exact:true}).fill(credentials[role].email);await p.getByLabel('Password',{exact:true}).fill(credentials[role].password);await p.getByRole('button',{name:/Sign in/}).click();await expect(p).toHaveURL(privateBase+home);
      await p.getByRole('link',{name:'Complete portfolio demo',exact:true}).click();
      await expect(p.locator('#projects')).toBeVisible();
      const response=await c.request.get(privateBase+'/api/v1/cms/design-preview');assert.equal(response.status(),200);assert.equal(response.headers()['cache-control'],'no-store');assert.match(response.headers()['x-robots-tag'],/noindex/);
      const payload=(await response.json()).data;assert.equal(payload.projects.length,3);assert.match(payload.projects[0].title,/Sample Project/);assert.equal(payload.settings.allowIndexing,false);
      if(role==='ADMIN') {
        for(const theme of ['light','dark']) {
          const current=await p.locator('html').getAttribute('data-theme');if(current!==theme)await p.getByRole('switch').click();
          for(const width of [320,375,390,768,1024,1440,1920]) {
            await p.setViewportSize({width,height:1000});await reflow(p);
            if([390,1440].includes(width)) {
              await p.locator('#contact').scrollIntoViewIfNeeded();
              await loadImages(p);
              await capture(p,`${theme}-${width}-private-full`);
              for(const id of ['experience','projects','competencies','education','training','achievements','outlook']){await expect(p.locator('#'+id)).toBeVisible();await capture(p,`${theme}-${width}-private-${id}`,'#'+id);}
              await axe(p,`private-${theme}-${width}`);
            }
          }
        }
        await p.locator('.project-detail summary').first().click();await expect(p.locator('.project-detail').first()).toHaveAttribute('open','');
        await p.locator('.competency-item summary').first().click();await expect(p.locator('.competency-item').first()).toHaveAttribute('open','');
        await axe(p,'private-open-project-and-competency');
        await expect(p.locator('.public-contact-form button')).toBeDisabled();
        await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await p.locator('.expertise-card').first().evaluate(n=>getComputedStyle(n).transitionDuration),'0s');
        await p.locator('.mobile-menu summary').click();await expect(p.locator('.mobile-nav')).toBeVisible();
        for(const link of await p.locator('.mobile-nav a').all()){const id=(await link.getAttribute('href')).slice(1);await expect(p.locator('[id="'+id+'"]').first()).toHaveCount(1);}
        await p.keyboard.press('Escape');await expect(p.locator('.mobile-menu')).not.toHaveAttribute('open','');
      }
      // A normal logout in another tab/request must withdraw this open preview.
      const ended=await c.request.post(privateBase+'/api/v1/auth/logout',{headers:{Origin:privateBase,'X-Portfolio-Request':'1'},data:{}});assert.ok(ended.ok());
      await p.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(p).toHaveURL(privateBase+'/login');await expect(p.locator('#projects')).toHaveCount(0);
      assert.equal((await c.request.get(privateBase+'/api/v1/cms/design-preview')).status(),401);
      report.checks.push(`${role}: protected direct route, normal login, preview, cache/index headers, session withdrawal`);
    } finally {await c.close();}
  }
  }
  const denied=await fetch('http://localhost:5173/@fs/'+resolve('backend/src/services/design-preview.service.ts').replaceAll('\\','/'));assert.equal(denied.status,403,'Development source serving must deny server-only sample module');
  report.checks.push('Backend source denied by development file server');
  assert.equal(report.errors.length,0,'No browser page errors');report.passed=true;
} catch(error) {report.failure=String(error);throw error;}
finally {
  await writeFile(`${out}/results.json`,JSON.stringify(report,null,2));
  await browser?.close();if(server?.exitCode===null){const ended=once(server,'exit');server.kill();await ended;}
  console.log(JSON.stringify({passed:report.passed,screenshots:report.screenshots.length,scans:report.scans.length,checks:report.checks,errors:report.errors.length}));
}
