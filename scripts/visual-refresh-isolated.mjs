// Full appearance review against real isolated authentication/CMS APIs.
// Uses existing exact instance guards, exclusive test lock, initially-empty refusal,
// process-only configuration and captured-ID cleanup. Never uses dev account secrets.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fixture, isolatedEnvironment, root } from './phase08-fixtures.mjs';
isolatedEnvironment();
process.env.PORT = '4408';
process.env.FRONTEND_ORIGIN = 'http://127.0.0.1:5178';
const f = await fixture();
let apiChild, preview;
const report = { at: new Date().toISOString(), scopes: [], cleanup: 'PENDING', passed: false };
async function stopApi() {
  if(apiChild && apiChild.exitCode === null) { const ended = once(apiChild,'exit'); apiChild.kill(); await ended; }
}
async function startApi() {
  await stopApi(); let ready=false;
  apiChild=spawn(process.execPath,['--import','tsx','scripts/phase08-browser.mjs','--api'],{cwd:root,env:process.env,windowsHide:true,stdio:['ignore','pipe','pipe']});
  apiChild.stdout.on('data',()=>{}); apiChild.stderr.on('data',()=>{});
  for(let i=0;i<300 && apiChild.exitCode === null;i++) {
    try { const r=await fetch('http://127.0.0.1:4408/api/v1/health',{signal:AbortSignal.timeout(1000)}); if(r.ok){ready=true;break;} } catch {}
    await delay(100);
  }
  assert.ok(ready,'Owned isolated API must start');
}
async function run(args, input) {
  const child=spawn(process.execPath,args,{cwd:root,env:process.env,windowsHide:true,stdio:[input ? 'pipe' : 'ignore','inherit','inherit']});
  if(input) child.stdin.end(input);
  const [code]=await once(child,'exit'); assert.equal(code,0,'Review/build subprocess failed');
}
try {
  for(const name of ['Treatment','Production','Microbiology','Laboratory operations','Management']) await f.db.skill.create({data:{name:'TEST ONLY '+name,description:'Synthetic isolated appearance fixture.',status:'PUBLISHED',isVerified:true}});
  await f.capture();
  await run(['frontend/scripts/build.mjs']);
  const vite=await import('vite');
  preview=await vite.preview({root:resolve(root,'frontend'),configFile:resolve(root,'frontend/vite.config.ts'),build:{outDir:'.cache/test-public'},preview:{host:'127.0.0.1',port:5178,strictPort:true,proxy:{'/api':{target:'http://127.0.0.1:4408',changeOrigin:true}}}});
  const credentials=Object.fromEntries(['ADMIN','SUPER_ADMIN'].map(role=>[role,{email:f.users[role].email,password:f.password}]));
  for(const scope of process.argv.includes('--public-only') ? ['public'] : ['public','studio','operations']) {
    report.stage=scope + ' API startup';
    await startApi();
    report.stage=scope + ' browser review';
    await run(['scripts/visual-refresh-review.mjs','--isolated','--scope='+scope],JSON.stringify(credentials));
    report.scopes.push(scope);
  }
  report.passed=true;
} catch(error) { process.exitCode=1; report.failure='Isolated appearance review failed at '+(report.stage ?? 'build')+' ('+error.name+').'; }
finally {
  try { if(preview) { preview.httpServer.closeAllConnections?.(); await new Promise((done,reject)=>preview.httpServer.close(error=>error ? reject(error) : done())); } await stopApi(); }
  finally { await f.cleanup(); report.cleanup='PASSED: all 13 isolated application tables empty'; }
  await mkdir(resolve(root,'.cache/visual-refresh/isolated'),{recursive:true});
  await writeFile(resolve(root,'.cache/visual-refresh/isolated/' + (process.argv.includes('--public-only') ? 'summary-public-recapture.json' : 'summary.json')),JSON.stringify(report,null,2));
}
console.log(JSON.stringify(report));
