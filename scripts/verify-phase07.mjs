// Read-only development preservation and compiled-serving verification. No account/data writes.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';
import mariadb from 'mariadb';

const root=fileURLToPath(new URL('../',import.meta.url));
const originalEnv=await readFile(new URL('../backend/.env',import.meta.url));
const config=parse(originalEnv);
const sha=value=>createHash('sha256').update(value).digest('hex');
const canonical=rows=>JSON.stringify(rows.map(row=>JSON.stringify(Object.fromEntries(Object.entries(row).sort(([a],[b])=>a.localeCompare(b))),(_,v)=>typeof v==='bigint'?{$bigint:String(v)}:v)).sort());
const tables=['profile','experience','education','skill','project','achievement','certificate','mediaasset','contactmessage','sitesettings','authsession','auditlog','user'];
const report={developmentRows:0,recoveredFieldsMatch:false,testApplicationRows:0,relationshipsAndChecksVerified:false,compiledChecks:0,browserChecks:false};
for(const kind of ['DATABASE_URL','TEST_DATABASE_URL']){
  const url=new URL(config[kind]);
  assert.equal(url.hostname,'127.0.0.1');assert.equal(url.port,'13312');
  const development=kind==='DATABASE_URL';const database=development?'seraphine_portfolio_dev':'seraphine_portfolio_test';
  assert.equal(url.pathname,'/'+database);assert.equal(decodeURIComponent(url.username),development?'seraphine_dev':'seraphine_test');
  const connection=await mariadb.createConnection({host:url.hostname,port:Number(url.port),user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),database,dateStrings:true,autoJsonMap:false,connectTimeout:5000});
  try{
    const [identity]=await connection.query('SELECT @@port port,@@innodb_force_recovery mode,@@datadir directory,VERSION() version');
    assert.equal(Number(identity.port),13312);assert.equal(Number(identity.mode),0);assert.match(identity.version,/^10\.4\.32-MariaDB/);assert.ok(identity.directory.replaceAll('\\','/').endsWith('/2026-11-05-rehearsal-02/data/'));
    for(const table of tables){
      const rows=await connection.query('SELECT * FROM `'+table+'` ORDER BY id');
      if(development){
        const saved=JSON.parse((await readFile('C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-04-level-6-extraction/'+database+'/'+table+'.rows.json','utf8')).replace(/^\uFEFF/,''));
        // Compare only hashes in assertions, so failures cannot print private record contents.
        assert.equal(sha(canonical(rows)),sha(canonical(saved)),'Recovered-field preservation: '+table);report.developmentRows+=rows.length;
      }else{assert.equal(rows.length,0,'Test fixture cleanup: '+table);}
    }
    const migrations=await connection.query('SELECT migration_name,checksum,finished_at,rolled_back_at FROM _prisma_migrations ORDER BY migration_name');assert.equal(migrations.length,2);
    for(const row of migrations){assert.ok(row.finished_at&&!row.rolled_back_at);assert.equal(row.checksum,sha(await readFile(new URL('../backend/prisma/migrations/'+row.migration_name+'/migration.sql',import.meta.url))));}
    const relations=await connection.query('SELECT CONSTRAINT_NAME name, DELETE_RULE deletion, UPDATE_RULE updating FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE()');
    const expectedRelations={Profile_portraitId_fkey:'RESTRICT',Achievement_projectId_fkey:'RESTRICT',Certificate_mediaId_fkey:'RESTRICT',MediaAsset_projectId_fkey:'RESTRICT',AuditLog_actorId_fkey:'SET NULL',AuthSession_userId_fkey:'CASCADE'};
    assert.deepEqual(relations.map(row=>row.name).sort(),Object.keys(expectedRelations).sort());
    for(const relation of relations){assert.equal(relation.deletion,expectedRelations[relation.name]);assert.equal(relation.updating,'CASCADE');}
    const checks=await connection.query("SELECT CONSTRAINT_NAME name FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND CONSTRAINT_TYPE='CHECK'");
    for(const name of ['Profile_owner_only','SiteSettings_site_only','Experience_period','Project_period','MediaAsset_positive_bytes'])assert.ok(checks.some(row=>row.name===name),'Required domain constraint: '+name);
  }finally{await connection.end();}
}
assert.equal(report.developmentRows,16);report.recoveredFieldsMatch=true;report.relationshipsAndChecksVerified=true;
const child=spawn(process.execPath,['backend/dist/server.js'],{cwd:root,env:{...process.env,...config,PORT:'4407',NODE_ENV:'production',FRONTEND_ORIGIN:'https://portfolio.example.invalid'},stdio:['ignore','pipe','pipe'],windowsHide:true});
const ended=once(child,'exit');let ready=false;
child.stdout.on('data',data=>{if(data.toString().includes('Portfolio API available'))ready=true;});child.stderr.on('data',()=>{});
try{
  for(let i=0;i<100&&!ready&&child.exitCode===null;i++)await delay(100);assert.ok(ready,'Compiled server must start on free port 4407');
  const get=async(path,status)=>{const r=await fetch('http://127.0.0.1:4407'+path);assert.equal(r.status,status,path);report.compiledChecks++;return r;};
  const homepage=await get('/',200);assert.equal(homepage.headers.get('cache-control'),'no-store');const html=await homepage.text();assert.match(html,/Water Treatment Plant Engineer/);assert.doesNotMatch(html,/TO VERIFY|id="experience"|id="education"|id="training"|storageKey|private-test/);
  const index=await get('/index.html',200);await index.text();
  const publicData=await get('/api/v1/public-content',200);assert.equal(publicData.headers.get('cache-control'),'no-store');const snapshot=await publicData.json();assert.equal(snapshot.data.skills.length,6);assert.equal(snapshot.data.experience.length,0);
  for(const path of ['/cms/profile','/cms/projects','/cms-media','/cms-messages','/cms-settings','/cms-sync']){const r=await get('/api/v1'+path,401);assert.equal(r.headers.get('cache-control'),'no-store');await r.text();}
  for(const path of ['/login','/admin/media','/admin/settings','/super-admin/projects']){const r=await get(path,200);const shell=await r.text();assert.match(shell,/<div id="root"><\/div>/);assert.doesNotMatch(shell,/<h1|TEST ONLY|senderEmail/);}
  for(const path of ['/.publication.json','/.cache/public-content.json','/.private-media/test.webp','/missing-page','/api/v1/media/missing'])await (await get(path,404)).text();
  const denied=await fetch('http://127.0.0.1:4407/api/v1/contact',{method:'POST',headers:{Origin:'https://foreign.invalid','X-Portfolio-Request':'1','Content-Type':'application/json'},body:'{}'});assert.equal(denied.status,403);await denied.text();report.compiledChecks++;
}finally{child.kill('SIGTERM');let timer;try{await Promise.race([ended,new Promise((_,reject)=>{timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('Owned API shutdown exceeded deadline'));},12000);})]);}finally{clearTimeout(timer);}}
assert.equal(sha(await readFile(new URL('../backend/.env',import.meta.url))),sha(originalEnv));
await mkdir(new URL('../.cache/',import.meta.url),{recursive:true});await writeFile(new URL('../.cache/phase07-runtime.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
