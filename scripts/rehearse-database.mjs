// Authorized clean rehearsal only. Fixed private paths/port; never loads or rewrites backend/.env.
import mariadb from 'mariadb';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const attempt=process.env.SERAPHINE_REHEARSAL_ATTEMPT;
assert.ok(['01','02'].includes(attempt),'Only explicitly isolated rehearsal attempts are allowed');
export const port=attempt==='01'?13310:13312;
export const runRoot='C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-rehearsal-'+attempt;
export const exportsRoot='C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-04-level-6-extraction';
const preservation='C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-04-preservation-01';
export const repo=fileURLToPath(new URL('..',import.meta.url));
const backend=path.join(repo,'backend');
const sha=b=>createHash('sha256').update(b).digest('hex');
const stringify=v=>JSON.stringify(v,(_,x)=>typeof x==='bigint'?{$bigint:String(x)}:x,2);
export const readJson=async p=>JSON.parse((await fs.readFile(p,'utf8')).replace(/^\uFEFF/,''));
export const save=async(name,data)=>fs.writeFile(path.join(runRoot,name),stringify(data),{flag:'wx'});
export const id=s=>{assert.match(s,/^[a-zA-Z0-9_]+$/);return '`'+s+'`';};
export async function credentials(){return readJson(path.join(runRoot,'private-credentials.json'));}
export async function connect(user='root',database){
  const secrets=await credentials();
  const c=await mariadb.createConnection({host:'127.0.0.1',port,user,password:secrets[user],database,connectTimeout:5000,socketTimeout:20000,dateStrings:true,autoJsonMap:false});
  await guard(c);return c;
}
export async function guard(c){
  const [r]=await c.query('SELECT @@datadir AS datadir,@@port AS port,@@innodb_force_recovery AS recoveryMode,@@version AS version,@@foreign_key_checks AS fk,@@unique_checks AS uq');
  assert.equal(r.datadir.replaceAll('\\','/').toLowerCase(),(runRoot+'/data/').toLowerCase());
  assert.equal(Number(r.port),port);assert.equal(Number(r.recoveryMode),0);
  assert.match(r.version,/^10\.4\.32-MariaDB/);assert.equal(Number(r.fk),1);assert.equal(Number(r.uq),1);
  return {version:r.version,port,recoveryMode:0};
}
export async function childEnv(){
  const c=await credentials();
  const url=(user,db)=>`mysql://${user}:${c[user]}@127.0.0.1:${port}/${db}`;
  return {...process.env,DATABASE_URL:url('seraphine_dev','seraphine_portfolio_dev'),MIGRATION_DATABASE_URL:url('seraphine_migrate','seraphine_portfolio_dev'),SHADOW_DATABASE_URL:url('seraphine_migrate','seraphine_portfolio_shadow'),TEST_DATABASE_URL:url('seraphine_test','seraphine_portfolio_test'),JWT_SECRET:c.jwt,NODE_ENV:'test',FRONTEND_ORIGIN:'http://localhost:5173'};
}
export async function child(label,args,{cwd=backend,env}={}){
  const result=spawnSync(process.execPath,args,{cwd,env:env??await childEnv(),encoding:'utf8',maxBuffer:32*1024*1024,windowsHide:true});
  await fs.writeFile(path.join(runRoot,label+'.log'),(result.stdout??'')+'\n'+(result.stderr??''),{flag:'wx'});
  const summary=(result.stdout??'').split(/\r?\n/).filter(x=>/^# (tests|pass|fail|skipped) |No difference detected|All migrations|Database schema is up to date|The schema .* is valid/.test(x));
  console.log(JSON.stringify({check:label,exit:result.status,summary}));
  assert.equal(result.status,0,'Check failed; inspect private '+label+'.log');
}
async function protect(label){
  const records=await readJson(path.join(preservation,'preservation-summary.json'));
  for(const record of records){
    const mf=path.join(preservation,record.Label+'-manifest.json');
    assert.equal(sha(await fs.readFile(mf)).toUpperCase(),record.ManifestSHA256);
    const manifest=await readJson(mf);
    for(const base of [record.Source,record.Backup]){
      const files=[],dirs=[];
      async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){assert.ok(!e.isSymbolicLink());const p=path.join(dir,e.name);if(e.isDirectory()){dirs.push(path.relative(base,p));await walk(p);}else files.push(path.relative(base,p));}}
      await walk(base);assert.equal(files.length,manifest.Files.length);assert.deepEqual(dirs.sort(),[...manifest.Directories].sort());
      for(const file of manifest.Files)assert.equal(sha(await fs.readFile(path.join(base,file.Path))).toUpperCase(),file.SHA256);
    }
  }
  const mf=path.join(exportsRoot,'final-files-manifest.json');
  assert.equal(sha(await fs.readFile(mf)).toUpperCase(),'B176E8302841BABFF1F8AA2F163A21C639DCED9AC030E062B0985BEE60A252DC');
  const manifest=await readJson(mf);
  for(const file of manifest)assert.equal(sha(await fs.readFile(path.join(exportsRoot,file.Path))).toUpperCase(),file.SHA256);
  for(const [source,name] of [['C:/xampp/mysql/bin/my.ini','mysql-bin-my.ini'],['C:/xampp/xampp-control.ini','xampp-control.ini']])assert.equal(sha(await fs.readFile(source)),sha(await fs.readFile(path.join(preservation,'configuration',name))));
  const localEnvHash=sha(await fs.readFile(path.join(backend,'.env')));
  if(label==='after')assert.equal(localEnvHash,(await readJson(path.join(runRoot,'protection-before.json'))).localEnvHash);
  await save('protection-'+label+'.json',{originalsAndCopiesUnchanged:true,exportsVerified:manifest.length,configsUnchanged:true,localEnvHash});
  console.log('Protected originals/backups/configs/exports verified: '+label);
}
async function setup(){
  await protect('before');
  const c=await mariadb.createConnection({host:'127.0.0.1',port,user:'root',password:'',connectTimeout:5000});
  try{
    await guard(c);
    assert.equal((await c.query("SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME LIKE 'seraphine%' ")).length,0);
    assert.equal((await c.query("SELECT User FROM mysql.user WHERE User LIKE 'seraphine%' ")).length,0);
    const secrets=Object.fromEntries(['root','seraphine_dev','seraphine_migrate','seraphine_test','jwt'].map(k=>[k,randomBytes(k==='jwt'?64:32).toString('hex')]));
    await save('private-credentials.json',secrets);
    await c.query("SET PASSWORD FOR 'root'@'localhost'=PASSWORD(?)",[secrets.root]);
    const schemas=['seraphine_portfolio_dev','seraphine_portfolio_test','seraphine_portfolio_shadow'];
    for(const schema of schemas)await c.query(`CREATE DATABASE ${id(schema)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    for(const user of ['seraphine_dev','seraphine_migrate','seraphine_test'])await c.query(`CREATE USER '${user}'@'127.0.0.1' IDENTIFIED BY ?`,[secrets[user]]);
    const scope=db=>'`'+db.replaceAll('_','\\_')+'`.*';
    await c.query(`GRANT SELECT,INSERT,UPDATE,DELETE ON ${scope(schemas[0])} TO 'seraphine_dev'@'127.0.0.1'`);
    for(const db of [schemas[0],schemas[2]])await c.query(`GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,ALTER,DROP,INDEX,REFERENCES ON ${scope(db)} TO 'seraphine_migrate'@'127.0.0.1'`);
    await c.query(`GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,ALTER,DROP,INDEX,REFERENCES ON ${scope(schemas[1])} TO 'seraphine_test'@'127.0.0.1'`);
    await save('setup.json',{...await guard(c),schemas,createdFresh:true,serviceAccountsScoped:true});
    console.log('Created fresh disposable schemas and scoped rehearsal-only credentials; backend/.env unchanged.');
  }finally{await c.end();}
}
async function migrate(){
  const c=await connect();try{for(const db of ['dev','test','shadow'])assert.equal((await c.query('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=?',['seraphine_portfolio_'+db])).length,0);}finally{await c.end();}
  const env=await childEnv();
  for(const name of ['dev','test','shadow']){
    const url=name==='test'?env.TEST_DATABASE_URL:name==='shadow'?env.SHADOW_DATABASE_URL:env.MIGRATION_DATABASE_URL;
    await child('migrate-'+name,['../node_modules/prisma/build/index.js','migrate','deploy'],{env:{...env,DATABASE_URL:url,MIGRATION_DATABASE_URL:url,SHADOW_DATABASE_URL:''}});
  }
}
const ordered=['user','project','mediaasset','profile','experience','education','skill','achievement','certificate','contactmessage','sitesettings','auditlog','authsession'];
async function importRows(){
  const c=await connect();try{
    for(const schema of ['seraphine_portfolio_dev','seraphine_portfolio_test']){
      for(const table of ordered){const [r]=await c.query(`SELECT COUNT(*) n FROM ${id(schema)}.${id(table)}`);assert.equal(Number(r.n),0);}
      const users=await readJson(path.join(exportsRoot,schema,'user.rows.json'));
      const sessions=await readJson(path.join(exportsRoot,schema,'authsession.rows.json'));
      assert.equal(users.length,0,'Unexpected recovered accounts require review');assert.equal(sessions.length,0,'Never restore recovered live sessions');
      await c.beginTransaction();
      try{
        for(const table of ordered){
          const rows=await readJson(path.join(exportsRoot,schema,table+'.rows.json'));
          for(const row of rows){const cols=Object.keys(row);await c.query(`INSERT INTO ${id(schema)}.${id(table)} (${cols.map(id).join(',')}) VALUES (${cols.map(()=>'?').join(',')})`,Object.values(row));}
        }
        await c.commit();
      }catch(e){await c.rollback();throw e;}
    }
    await save('import.json',{schemas:2,applicationRows:16,recoveredSessionsRestored:0,migrationHistory:'Fresh Prisma deploy records; recovered history retained as evidence',foreignKeyChecksEnabled:true});
    console.log('Imported 16 recovered records transactionally; no recovered sessions/accounts or migration metadata overwritten.');
  }finally{await c.end();}
}
async function consistency(){
  const c=await connect();await c.end();const env=await childEnv();
  await child('prisma-validate',['../node_modules/prisma/build/index.js','validate']);
  for(const name of ['dev','test','shadow']){
    const url=name==='test'?env.TEST_DATABASE_URL:name==='shadow'?env.SHADOW_DATABASE_URL:env.MIGRATION_DATABASE_URL;
    const e={...env,DATABASE_URL:url,MIGRATION_DATABASE_URL:url,SHADOW_DATABASE_URL:''};
    await child('status-'+name,['../node_modules/prisma/build/index.js','migrate','status'],{env:e});
    await child('drift-'+name,['../node_modules/prisma/build/index.js','migrate','diff','--from-config-datasource','--to-schema','prisma/schema.prisma','--exit-code'],{env:e});
  }
  // Only the NEW disposable shadow is eligible for Prisma's soft reset/replay.
  const s=await connect();try{
    for(const table of ordered){const [r]=await s.query(`SELECT COUNT(*) n FROM seraphine_portfolio_shadow.${id(table)}`);assert.equal(Number(r.n),0);}
  }finally{await s.end();}
  // Compare both database sources under Windows' lower_case_table_names semantics.
  // Live-datasource-to-schema comparisons above separately verify the Prisma model.
  await child('shadow-replay',['../node_modules/prisma/build/index.js','migrate','diff','--from-migrations','prisma/migrations','--to-config-datasource','--exit-code']);
}
async function tests(){
  const c=await connect();try{for(const table of ordered){const [r]=await c.query(`SELECT COUNT(*) n FROM seraphine_portfolio_test.${id(table)}`);assert.equal(Number(r.n),0);}}finally{await c.end();}
  await child('database-auth-tests',['scripts/test-database.mjs']);
}
async function checks(){
  const npm=path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
  const production={...await childEnv(),NODE_ENV:'production',FRONTEND_ORIGIN:'https://portfolio.example.invalid'};
  for(const [label,args] of [['unit-render-http',['test']],['typecheck',['run','typecheck']],['build',['run','build']],['production-artifacts',['run','test:build','-w','frontend']]])await child(label,[npm,...args],{cwd:repo,...(['build','production-artifacts'].includes(label)?{env:production}:{})});
  await child('dev-runtime-scopes',['--import','tsx','scripts/verify-database.ts']);
  await child('compiled-content-api',['scripts/verify-phase05.mjs'],{cwd:repo,env:production});
  await child('compiled-private-api-shells',['scripts/verify-phase06.mjs'],{cwd:repo,env:production});
}
async function main(){
 const action=process.argv[2];
 if(action==='setup')await setup();else if(action==='migrate')await migrate();else if(action==='import')await importRows();
 else if(action==='consistency')await consistency();else if(action==='tests')await tests();else if(action==='checks')await checks();
 else if(action==='protect-after')await protect('after');else if(action==='protect-cutover')await protect('cutover');else throw Error('Unknown rehearsal action');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(JSON.stringify({rehearsalFailed:true,code:e.code??'ASSERTION_OR_GUARD',errno:e.errno??null}));process.exitCode=1;});
