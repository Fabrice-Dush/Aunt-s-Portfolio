// Verify restored records privately; prints only aggregate results.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { connect, readJson, save, exportsRoot, repo, id } from './rehearse-database.mjs';

const phase=process.argv[2];assert.ok(['imported','after-shadow','final','restarted','cutover-before','cutover-after','cutover-restarted','cutover-final'].includes(phase));
const canonical=x=>JSON.stringify(x,(_,v)=>typeof v==='bigint'?{$bigint:String(v)}:v);
const rowsKey=rows=>rows.map(row=>canonical(Object.fromEntries(Object.entries(row).sort(([a],[b])=>a.localeCompare(b))))).sort();
const hash=b=>createHash('sha256').update(b).digest('hex');
const report={phase,schemas:[],originalFreshnessGuaranteed:false,recoveredSessionsRestored:0};
let c;
try{
 c=await connect();
 for(const schema of ['seraphine_portfolio_dev','seraphine_portfolio_test','seraphine_portfolio_shadow']){
  const shadow=schema.endsWith('_shadow');
  const reference=shadow?'seraphine_portfolio_test':schema;
  const metadata=await readJson(path.join(exportsRoot,reference,'structure-metadata.json'));
  const tables=await c.query('SELECT TABLE_NAME name FROM information_schema.TABLES WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME',[schema]);
  const expected=(await readJson(path.join(exportsRoot,reference,'validation.json'))).tables.map(t=>t.table).filter(t=>t!=='_prisma_migrations');
  assert.deepEqual(tables.map(t=>t.name).filter(t=>t!=='_prisma_migrations').sort(),expected.sort());
  const result={schema,tables:[],foreignKeys:[],checks:[],uniqueKeys:[],migrations:[]};
  for(const {name} of tables){
   const target=id(schema)+'.'+id(name);
   const rows=await c.query('SELECT * FROM '+target+' ORDER BY id');
   if(name!=='_prisma_migrations'){
    const original=shadow?[]:await readJson(path.join(exportsRoot,schema,name+'.rows.json'));
    assert.deepEqual(rowsKey(rows),rowsKey(original),'Restored values differ for '+schema+'.'+name);
   }else{
    const original=await readJson(path.join(exportsRoot,reference,'_prisma_migrations.rows.json'));
    assert.deepEqual(rows.map(r=>r.migration_name).sort(),original.map(r=>r.migration_name).sort());
    for(const row of rows){assert.ok(row.finished_at&&!row.rolled_back_at);assert.equal(Number(row.applied_steps_count),1);
     assert.match(row.migration_name,/^\d{14}_[a-z0-9_]+$/);
     assert.equal(row.checksum,hash(await fs.readFile(path.join(repo,'backend/prisma/migrations',row.migration_name,'migration.sql'))));
     result.migrations.push({name:row.migration_name,checksumMatches:true,completed:true});
    }
   }
   const checked=await c.query('CHECK TABLE '+target);
   assert.ok(checked.some(r=>r.Msg_type==='status'&&r.Msg_text==='OK'));
   assert.ok(!checked.some(r=>['error','warning'].includes(r.Msg_type)));
   result.tables.push({table:name,rows:rows.length,allRecoveredValuesMatch:name!=='_prisma_migrations',checkTable:'OK'});
  }
  const keys=await c.query('SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=? AND REFERENCED_TABLE_NAME IS NOT NULL ORDER BY CONSTRAINT_NAME,ORDINAL_POSITION',[schema]);
  const groups=new Map();for(const k of keys){const key=k.TABLE_NAME+':'+k.CONSTRAINT_NAME;groups.set(key,[...(groups.get(key)??[]),k]);}
  assert.equal(groups.size,6);
  for(const [name,cols] of groups){
   const child=id(schema)+'.'+id(cols[0].TABLE_NAME),parent=id(schema)+'.'+id(cols[0].REFERENCED_TABLE_NAME);
   const [r]=await c.query(`SELECT COUNT(*) n FROM ${child} c WHERE ${cols.map(k=>'c.'+id(k.COLUMN_NAME)+' IS NOT NULL').join(' AND ')} AND NOT EXISTS (SELECT 1 FROM ${parent} p WHERE ${cols.map(k=>'p.'+id(k.REFERENCED_COLUMN_NAME)+'=c.'+id(k.COLUMN_NAME)).join(' AND ')})`);
   assert.equal(Number(r.n),0);result.foreignKeys.push({name,orphans:0});
  }
  const checks=await c.query('SELECT CONSTRAINT_NAME name FROM information_schema.CHECK_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=?',[schema]);
  for(const [table,name,expr] of [['profile','Profile_owner_only',"id='owner'"],['sitesettings','SiteSettings_site_only',"id='site'"],['experience','Experience_period','(startYear IS NULL OR endYear IS NULL OR endYear>=startYear) AND (NOT isCurrent OR endYear IS NULL)'],['project','Project_period','startYear IS NULL OR endYear IS NULL OR endYear>=startYear'],['mediaasset','MediaAsset_positive_bytes','bytes>0']]){
   assert.ok(checks.some(k=>k.name===name));const [r]=await c.query(`SELECT COUNT(*) n FROM ${id(schema)}.${id(table)} WHERE NOT (${expr})`);assert.equal(Number(r.n),0);result.checks.push({name,violations:0});
  }
  const indexes=await c.query('SELECT TABLE_NAME,INDEX_NAME,COLUMN_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=? AND NON_UNIQUE=0 ORDER BY TABLE_NAME,INDEX_NAME,SEQ_IN_INDEX',[schema]);
  const uniques=new Map();for(const k of indexes){const key=k.TABLE_NAME+':'+k.INDEX_NAME;uniques.set(key,[...(uniques.get(key)??[]),k]);}
  for(const [name,cols] of uniques){const names=cols.map(k=>id(k.COLUMN_NAME));const [r]=await c.query(`SELECT COUNT(*) n FROM (SELECT ${names.join(',')} FROM ${id(schema)}.${id(cols[0].TABLE_NAME)} WHERE ${names.map(k=>k+' IS NOT NULL').join(' AND ')} GROUP BY ${names.join(',')} HAVING COUNT(*)>1) d`);assert.equal(Number(r.n),0);result.uniqueKeys.push({name,duplicateGroups:0});}
  if(!shadow){
   const cols=await c.query('SELECT TABLE_NAME,COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE,COLLATION_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME,ORDINAL_POSITION',[schema]);
   const relevant=x=>x.filter(r=>r.TABLE_NAME!=='_prisma_migrations').map(r=>({TABLE_NAME:r.TABLE_NAME,COLUMN_NAME:r.COLUMN_NAME,COLUMN_TYPE:r.COLUMN_TYPE,IS_NULLABLE:r.IS_NULLABLE,COLLATION_NAME:r.COLLATION_NAME}));
   assert.deepEqual(relevant(cols),relevant(metadata.columns));
  }
  report.schemas.push(result);
 }
 await save('validation-'+phase+'.json',report);
 console.log(JSON.stringify({phase,allChecksPassed:true,schemas:report.schemas.map(s=>({schema:s.schema,tables:s.tables.length,records:s.tables.filter(t=>t.table!=='_prisma_migrations').reduce((n,t)=>n+t.rows,0),foreignKeys:s.foreignKeys.length,domainChecks:s.checks.length,uniqueKeys:s.uniqueKeys.length,migrations:s.migrations.length}))}));
}catch(e){console.error(JSON.stringify({validationFailed:true,code:e.code??'ASSERTION_OR_GUARD',errno:e.errno??null}));process.exitCode=1;}finally{if(c)await c.end();}
