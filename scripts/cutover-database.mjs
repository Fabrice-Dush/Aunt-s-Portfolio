// Authorized 2026-11-05 cutover. Fixed dedicated instance; never writes shared XAMPP data.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {parse} from 'dotenv';
import mariadb from 'mariadb';

const repo=fileURLToPath(new URL('..',import.meta.url));
const backend=path.join(repo,'backend');
const envFile=path.join(backend,'.env');
const source='C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-rehearsal-02';
const backup='C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-pre-cutover-01';
const reportDir=backup+'/acceptance';
const sha=b=>createHash('sha256').update(b).digest('hex');
const json=async p=>JSON.parse((await fs.readFile(p,'utf8')).replace(/^\uFEFF/,''));
const write=async(name,v)=>fs.writeFile(reportDir+'/'+name,JSON.stringify(v,null,2),{flag:'wx'});
const keys=['DATABASE_URL','MIGRATION_DATABASE_URL','TEST_DATABASE_URL','SHADOW_DATABASE_URL'];
const targets=[['seraphine_dev','seraphine_portfolio_dev'],['seraphine_migrate','seraphine_portfolio_dev'],['seraphine_test','seraphine_portfolio_test'],['seraphine_migrate','seraphine_portfolio_shadow']];
async function inventory(root){
 const files=[],dirs=[];
 async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){assert.ok(!e.isSymbolicLink(),'Refuse reparse/symbolic links');const p=path.join(dir,e.name),rel=path.relative(root,p).replaceAll('\\','/');if(e.isDirectory()){dirs.push(rel);await walk(p);}else{const bytes=await fs.readFile(p);files.push({path:rel,bytes:bytes.length,sha256:sha(bytes)});}}}
 await walk(root);return {dirs:dirs.sort(),files:files.sort((a,b)=>a.path.localeCompare(b.path))};
}
async function publicFiles(){
 const result=[];
 for(const rel of ['frontend/src','frontend/public','design']){const inv=await inventory(path.join(repo,rel));result.push(...inv.files.map(f=>({...f,path:rel+'/'+f.path})));}
 return result;
}
async function verifyBackup(){
 const manifest=await json(backup+'/snapshot-manifest.json');
 for(const f of manifest.files)assert.equal(sha(await fs.readFile(backup+'/'+f.path)),f.sha256,'Offline snapshot hash mismatch');
 assert.equal(sha(await fs.readFile(backup+'/backend.env.private')),manifest.originalEnvSHA256);
 return manifest;
}
async function snapshot(){
 // Caller must establish process absence and a new owner-restricted destination first.
 assert.deepEqual(await fs.readdir(backup),[],'Backup destination must be new and empty');
 const before=await inventory(source);
 const oldEnv=await fs.readFile(envFile);
 for(const e of await fs.readdir(source)){await fs.cp(source+'/'+e,backup+'/'+e,{recursive:true,errorOnExist:true,force:false});}
 const copied=await inventory(backup);assert.deepEqual(copied,before);
 assert.deepEqual(await inventory(source),before,'Source changed during offline copy');
 await fs.writeFile(backup+'/backend.env.private',oldEnv,{flag:'wx'});
 assert.deepEqual(await fs.readFile(backup+'/backend.env.private'),oldEnv);
 const manifest={...before,originalEnvSHA256:sha(oldEnv),publicFiles:await publicFiles(),completeOfflineSnapshot:true};
 await fs.writeFile(backup+'/snapshot-manifest.json',JSON.stringify(manifest,null,2),{flag:'wx'});
 await verifyBackup();await fs.mkdir(reportDir);
 console.log(JSON.stringify({offlineSnapshotVerified:true,files:before.files.length,bytes:before.files.reduce((n,f)=>n+f.bytes,0),envBackupVerified:true}));
}
async function configure(){
 const manifest=await verifyBackup();const before=await fs.readFile(envFile);
 assert.equal(sha(before),manifest.originalEnvSHA256,'Environment changed after backup');
 const secrets=await json(source+'/private-credentials.json');
 let text=before.toString('utf8');const old=parse(text);
 for(let i=0;i<keys.length;i++){
  const [user,db]=targets[i],key=keys[i];
  const expression=new RegExp('^'+key+'=[^\\r\\n]*','gm');
  assert.equal([...text.matchAll(expression)].length,1,'Require exactly one existing URL setting');
  text=text.replace(expression,key+'="mysql://'+user+':'+secrets[user]+'@127.0.0.1:13312/'+db+'"');
 }
 const next=parse(text);assert.deepEqual(Object.keys(next).sort(),Object.keys(old).sort());
 for(const key of Object.keys(old))if(!keys.includes(key))assert.equal(next[key],old[key]);
 const mask=s=>s.replace(/^(DATABASE_URL|MIGRATION_DATABASE_URL|TEST_DATABASE_URL|SHADOW_DATABASE_URL)=[^\r\n]*/gm,'$1=<DATABASE_URL>');
 assert.equal(mask(text),mask(before.toString('utf8')),'Only four URL lines may change');
 await fs.writeFile(envFile,text);assert.equal(sha(await fs.readFile(envFile)),sha(Buffer.from(text)));
 await write('configuration.json',{changedKeys:keys,unrelatedBytesAndJWTUnchanged:true,port:13312,envSHA256:sha(Buffer.from(text))});
 console.log('Only four database URLs updated; all unrelated bytes and JWT settings preserved.');
}
async function actualEnv(){
 const settings=parse(await fs.readFile(envFile));
 for(let i=0;i<keys.length;i++){
  const u=new URL(settings[keys[i]]),[user,db]=targets[i];
  assert.equal(u.protocol,'mysql:');assert.equal(u.hostname,'127.0.0.1');assert.equal(u.port,'13312');assert.equal(u.username,user);assert.equal(u.pathname,'/'+db);
 }
 const original=parse(await fs.readFile(backup+'/backend.env.private'));
 for(const key of Object.keys(original))if(!keys.includes(key))assert.equal(settings[key],original[key]);
 return {...process.env,...settings};
}
async function guard(c){
 const [r]=await c.query('SELECT @@datadir d,@@port p,@@innodb_force_recovery r,@@version v');
 assert.equal(r.d.replaceAll('\\','/').toLowerCase(),(source+'/data/').toLowerCase());assert.equal(Number(r.p),13312);assert.equal(Number(r.r),0);assert.match(r.v,/^10\.4\.32/);
}
async function connections(){
 const env=await actualEnv();
 for(const key of keys){const u=new URL(env[key]);const c=await mariadb.createConnection({host:u.hostname,port:Number(u.port),user:u.username,password:decodeURIComponent(u.password),database:u.pathname.slice(1),connectTimeout:5000});try{await guard(c);await c.query('SELECT 1');}finally{await c.end();}}
 const report=process.argv[3]==='verified'?'connections-verified.json':process.argv[3]==='final'?'connections-final.json':'connections.json';
 await write(report,{configuredConnections:keys,normalMode:true,allPassed:true});console.log('All four actual configured connections passed identity checks.');
}
async function run(label,args,{cwd=backend,env}={}){
 const result=spawnSync(process.execPath,args,{cwd,env:env??await actualEnv(),encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024});
 await fs.writeFile(reportDir+'/'+label+'.log',(result.stdout??'')+'\n'+(result.stderr??''),{flag:'wx'});
 console.log(JSON.stringify({check:label,exit:result.status}));assert.equal(result.status,0,'Acceptance failed; private log '+label);
}
async function consistency(){
 const env=await actualEnv();
 await run('prisma-validate',['../node_modules/prisma/build/index.js','validate']);
 // Shadow is ephemeral replay state without a deployment ledger. Check dev/test status;
 // verify shadow structurally and rebuild only its known empty application tables.
 for(const name of ['dev','test','shadow']){
  const url=name==='dev'?env.MIGRATION_DATABASE_URL:name==='test'?env.TEST_DATABASE_URL:env.SHADOW_DATABASE_URL;
  const scoped={...env,DATABASE_URL:url,MIGRATION_DATABASE_URL:url,SHADOW_DATABASE_URL:''};
  if(name!=='shadow')await run('status-'+name,['../node_modules/prisma/build/index.js','migrate','status'],{env:scoped});
  await run('drift-'+name,['../node_modules/prisma/build/index.js','migrate','diff','--from-config-datasource','--to-schema','prisma/schema.prisma','--exit-code'],{env:scoped});
 }
 const u=new URL(env.SHADOW_DATABASE_URL),c=await mariadb.createConnection({host:u.hostname,port:Number(u.port),user:u.username,password:decodeURIComponent(u.password),database:u.pathname.slice(1)});
 try{await guard(c);const tables=await c.query('SHOW TABLES');for(const row of tables){const name=Object.values(row)[0];assert.match(name,/^[a-z_]+$/);const [n]=await c.query('SELECT COUNT(*) n FROM `'+name+'`');assert.equal(Number(n.n),0,'Refuse nonempty shadow');}}finally{await c.end();}
 await run('shadow-replay',['../node_modules/prisma/build/index.js','migrate','diff','--from-migrations','prisma/migrations','--to-config-datasource','--exit-code']);
}
async function tests(){
 const env=await actualEnv(),u=new URL(env.TEST_DATABASE_URL),c=await mariadb.createConnection({host:u.hostname,port:Number(u.port),user:u.username,password:decodeURIComponent(u.password),database:u.pathname.slice(1)});
 try{await guard(c);for(const row of await c.query('SHOW TABLES')){const name=Object.values(row)[0];assert.match(name,/^[a-z_]+$/);if(name==='_prisma_migrations')continue;const [n]=await c.query('SELECT COUNT(*) n FROM `'+name+'`');assert.equal(Number(n.n),0,'Refuse nonempty test');}}finally{await c.end();}
 await run('database-auth-tests',['scripts/test-database.mjs'],{env});
}
async function checks(){
 const env=await actualEnv(),production={...env,NODE_ENV:'production',FRONTEND_ORIGIN:'https://portfolio.example.invalid'};
 const npm=path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
 for(const [label,args] of [['unit-render-http',['test']],['typecheck',['run','typecheck']],['build',['run','build']],['production-artifacts',['run','test:build','-w','frontend']]])await run(label,[npm,...args],{cwd:repo,env:['build','production-artifacts'].includes(label)?production:{...env,NODE_ENV:'test'}});
 await run('dev-runtime-scopes',['--import','tsx','scripts/verify-database.ts'],{env});
 await run('compiled-content-api',['scripts/verify-phase05.mjs'],{cwd:repo,env:production});
 await run('compiled-private-api-shells',['scripts/verify-phase06.mjs'],{cwd:repo,env:production});
 assert.deepEqual(await publicFiles(),(await json(backup+'/snapshot-manifest.json')).publicFiles);
 await write('public-portfolio.json',{sourceAndAssetsUnchanged:true});console.log('Public portfolio and dashboard source/assets hash-match the pre-cutover baseline.');
}
async function rollback(){
 const manifest=await verifyBackup();const old=await fs.readFile(backup+'/backend.env.private');
 assert.equal(sha(old),manifest.originalEnvSHA256);await fs.writeFile(envFile,old);assert.equal(sha(await fs.readFile(envFile)),manifest.originalEnvSHA256);
 await write('rollback.json',{originalEnvironmentRestored:true});console.log('Rollback restored the exact original environment. Stop only the verified dedicated database process normally.');
}
async function main(){const action=process.argv[2];if(action==='snapshot')await snapshot();else if(action==='configure')await configure();else if(action==='connections')await connections();else if(action==='consistency')await consistency();else if(action==='tests')await tests();else if(action==='checks')await checks();else if(action==='rollback')await rollback();else throw Error('Unknown cutover action');}
main().catch(e=>{console.error(JSON.stringify({cutoverFailed:true,code:e.code??'ASSERTION_OR_GUARD',errno:e.errno??null}));process.exitCode=1;});
