// Read-only production review. Owns only its loopback server and browser processes.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdir, writeFile} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium, expect} from '@playwright/test';

const label=process.argv[2];
const completion=process.argv.includes('--completion');
const selectedOnly=process.argv.includes('--selected-only');
assert.ok(['before','after'].includes(label));
const output=completion ? `.cache/final-completion/${label}` : `.cache/performance-review/${label}`;
await mkdir(output,{recursive:true});
const server=spawn(process.execPath,['scripts/phase08-performance-server.mjs'],{env:{...process.env,NODE_ENV:'production',PORT:'4496'},stdio:['ignore','pipe','pipe'],windowsHide:true});
let ready=false, browser;
server.stdout.on('data',bytes=>{if(String(bytes).includes('Portfolio API available')) ready=true;});
server.stderr.on('data',()=>{});
try {
 for(let n=0;n<100&&!ready&&server.exitCode===null;n++) await delay(100);
 assert.ok(ready,'Owned production server required');
 const review=spawn(process.execPath,['scripts/public-story-review.mjs','--base=http://127.0.0.1:4496',completion ? `--completion=${label}` : `--performance=${label}`,...(selectedOnly?['--selected-only']:[])],{stdio:'inherit',windowsHide:true});
 const [code]=await once(review,'exit');
 assert.equal(code,0,'Production visual review must pass');
 if(!selectedOnly) {
 browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:412,height:823},deviceScaleFactor:1.75,isMobile:true});
 page.setDefaultTimeout(15000);
 await page.addInitScript(()=>{
  window.__observerCount=0;
  const Native=window.IntersectionObserver;
  window.IntersectionObserver=class extends Native {constructor(...args){super(...args);window.__observerCount++;}};
 });
 const client=await page.context().newCDPSession(page);
 const events=[];
 client.on('Tracing.dataCollected',data=>events.push(...data.value));
 await client.send('Tracing.start',{categories:'devtools.timeline,blink.user_timing,loading',transferMode:'ReportEvents'});
 await page.goto('http://127.0.0.1:4496/');
 await page.waitForFunction(()=>!document.querySelector('.expertise-card')?.disabled);
 await page.waitForLoadState('networkidle');
 const initial=await page.evaluate(()=>window.__observerCount);
 const refresh=[];
 for(let n=0;n<3;n++) {
  const response=page.waitForResponse(r=>r.url().endsWith('/api/v1/public-content'));
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await response;
  await page.waitForLoadState('networkidle');
  refresh.push(await page.evaluate(()=>window.__observerCount));
 }
 if(label==='after') {
  assert.deepEqual(refresh,[initial,initial,initial],'Unchanged revisions must not recreate section observers');
  // Response fixtures exercise withdrawal/recovery without touching stored content.
  const original=await (await page.request.get('http://127.0.0.1:4496/api/v1/public-content')).json();
  const changed=structuredClone(original);
  changed.revision='TEST-ONLY-published-description';
  changed.data.skills[0].description='TEST ONLY CMS description supplied by a browser response fixture.';
  await page.route('**/api/v1/public-content',route=>route.fulfill({json:changed}));
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(page.locator('#expertise-mobile-detail')).toContainText('TEST ONLY CMS description');
  await expect(page.locator('#expertise-mobile-detail')).toContainText('Published specialization');
  await page.route('**/api/v1/public-content',route=>route.fulfill({status:503,json:{error:'TEST ONLY unavailable'}}));
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('heading',{name:'Portfolio temporarily unavailable'})).toBeVisible();
  await expect(page.locator('#expertise')).toHaveCount(0);
  await page.unroute('**/api/v1/public-content');
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(page.locator('#expertise')).toBeVisible();
  await expect(page.locator('#expertise-mobile-detail')).toContainText('General field context');
 }
 const ended=new Promise(resolve=>client.once('Tracing.tracingComplete',resolve));
 await client.send('Tracing.end'); await ended;
 await writeFile(`${output}/refresh.trace.json`,JSON.stringify({traceEvents:events}));
 await writeFile(`${output}/refresh.json`,JSON.stringify({browser:browser.version(),initialObserverCount:initial,observerCountAfterIdenticalRefresh:refresh,scope:'Diagnostic observer instrumentation only; not Lighthouse scoring'},null,2));
 console.log(JSON.stringify({label,initialObserverCount:initial,observerCountAfterIdenticalRefresh:refresh}));
 }
} finally {
 await browser?.close();
 if(server.exitCode===null){const ended=once(server,'exit');server.kill();await ended;}
}
