// Read-only application smoke test against recovered rehearsal dev content.
import assert from 'node:assert/strict';
import { once } from 'node:events';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { parse } from 'dotenv';
import { childEnv, connect, readJson, exportsRoot, save } from './rehearse-database.mjs';
const configured=process.argv.includes('--configured');
if(configured){
 const actual=parse(await readFile(new URL('../backend/.env',import.meta.url)));
 const expected=await childEnv();
 for(const key of ['DATABASE_URL','MIGRATION_DATABASE_URL','TEST_DATABASE_URL','SHADOW_DATABASE_URL'])assert.equal(actual[key],expected[key]);
 Object.assign(process.env,actual);
}else Object.assign(process.env,await childEnv());
const identity=await connect();await identity.end();
const {app}=await import('../backend/src/app.ts');
const {disconnectDatabase}=await import('../backend/src/config/database.ts');
const {dashboardSummary,dashboardContent}=await import('../backend/src/services/dashboard.service.ts');
const rows=table=>readJson(path.join(exportsRoot,'seraphine_portfolio_dev',table+'.rows.json'));
const server=app.listen(0,'127.0.0.1');await once(server,'listening');
const result={publicRoutes:[],dashboardContentServices:[],realAccountsCreated:0,developmentMutations:0};
try{
 const base='http://127.0.0.1:'+server.address().port+'/api/v1';
 const response=await fetch(base+'/profile');assert.equal(response.status,200);const profile=(await response.json()).data;
 const original=(await rows('profile'))[0];
 for(const key of ['fullName','professionalTitle','location','city','country','motto','summary','biography','experienceDescription'])assert.equal(profile[key],original[key]);
 assert.equal(profile.contact,null);assert.equal(profile.portrait,null);result.publicRoutes.push('profile');
 for(const [route,table] of [['experience','experience'],['education','education'],['skills','skill'],['projects','project'],['achievements','achievement'],['certifications','certificate']]){
  const r=await fetch(base+'/'+route);assert.equal(r.status,200);const body=await r.json();
  const expected=(await rows(table)).filter(r=>r.status==='PUBLISHED'&&r.isVerified);
  assert.deepEqual(body.data.map(r=>r.id).sort(),expected.map(r=>r.id).sort());
  assert.doesNotMatch(JSON.stringify(body),/passwordHash|refreshHash|storageKey|contactApprovedAt/);result.publicRoutes.push(route);
 }
 const summary=await dashboardSummary(true);
 assert.equal(summary.profile.fullName,original.fullName);
 for(const [key,table] of [['experience','experience'],['education','education'],['skills','skill'],['certifications','certificate']])assert.equal(summary[key],(await rows(table)).length);
 assert.equal(summary.activeAdmins,0);assert.equal(summary.messages,0);
 for(const [section,table] of [['profile','profile'],['experience','experience'],['education','education'],['skills','skill'],['projects','project'],['achievements','achievement'],['certifications','certificate'],['messages','contactmessage']]){
  const actual=await dashboardContent(section,1),expected=await rows(table);
  assert.equal(actual.length,expected.length);
  for(const row of actual){const saved=expected.find(r=>r.id===row.id);assert.ok(saved);for(const [key,value] of Object.entries(row)){const expectedValue=typeof value==='boolean'?Boolean(saved[key]):saved[key];assert.equal(value,expectedValue);}}
  result.dashboardContentServices.push(section);
 }
 const guest=await fetch(base+'/dashboard/summary');assert.equal(guest.status,401);
 await save(configured?'recovered-application-cutover.json':'recovered-application.json',result);
 console.log('Recovered-content application PASS: seven public routes, publication filtering, eight dashboard read services, guest denial; zero dev writes/accounts.');
}finally{await new Promise(resolve=>server.close(resolve));await disconnectDatabase();}
