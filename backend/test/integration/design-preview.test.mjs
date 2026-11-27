import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import { localDatabaseTarget, assertLocalDatabaseIdentity } from '../../../scripts/local-database-targets.mjs';
import { app } from '../../src/app.ts';
import { getDatabase, disconnectDatabase } from '../../src/config/database.ts';
import { hashPassword } from '../../src/services/password.service.ts';
import { publicSnapshot } from '../../src/services/public-site.service.ts';

const target=localDatabaseTarget(process.env.DATABASE_URL,'test');
assert.equal(process.env.NODE_ENV,'test');
const db=getDatabase();
test('isolated private design preview authorization, public exclusion and read-only behavior',async t=>{
  const [instance]=await db.$queryRaw`SELECT @@port port, @@innodb_force_recovery mode, @@datadir directory, VERSION() version, DATABASE() schemaName, CURRENT_USER() account`;
  assertLocalDatabaseIdentity(instance,target);
  const models=['profile','experience','education','skill','project','achievement','certificate','mediaAsset','contactMessage','siteSettings','authSession','auditLog','user'];
  for(const model of models)assert.equal(await db[model].count(),0,'Refusing nonempty fixture schema');
  const ids=Object.fromEntries(models.map(model=>[model,new Set()]));
  const capture=async()=>{for(const model of models)for(const row of await db[model].findMany({select:{id:true}}))ids[model].add(row.id);};
  t.after(async()=>{await capture();for(const model of ['achievement','certificate','profile','mediaAsset','experience','education','skill','project','contactMessage','siteSettings','auditLog','authSession','user'])await db[model].deleteMany({where:{id:{in:[...ids[model]]}}});await disconnectDatabase();});
  const server=app.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;
  const origin=process.env.FRONTEND_ORIGIN;
  const password=randomBytes(28).toString('base64url');
  const request=async(path,token)=>{const r=await fetch(base+path,{headers:token?{Cookie:'sp_access='+token}:{}});return {status:r.status,headers:r.headers,body:await r.json()};};
  await t.test('guests and forged sessions receive no sample payload',async()=>{
    for(const token of [undefined,'forged']){const r=await request('/api/v1/cms/design-preview',token);assert.equal(r.status,401);assert.doesNotMatch(JSON.stringify(r.body),/Sample Project|demo-review-notebook/);}
  });
  await db.profile.create({data:{id:'owner',fullName:'TEST ONLY profile',professionalTitle:'TEST ONLY title',status:'PUBLISHED'}});
  await db.skill.create({data:{name:'TEST ONLY broad area',isVerified:true,status:'PUBLISHED'}});
  await capture();
  for(const role of ['ADMIN','SUPER_ADMIN','TEMPORARY']){
    await t.test(role+' obeys normal authentication and publication boundaries',async()=>{
      const user=await db.user.create({data:{email:role.toLowerCase()+'@preview-test.invalid',displayName:'TEST ONLY',passwordHash:await hashPassword(password),role:role==='SUPER_ADMIN'?'SUPER_ADMIN':'ADMIN',mustChangePassword:role==='TEMPORARY'}});
      ids.user.add(user.id);
      const login=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{Origin:origin,'X-Portfolio-Request':'1','Content-Type':'application/json'},body:JSON.stringify({email:user.email,password})});assert.equal(login.status,200);
      const token=login.headers.getSetCookie().find(c=>c.startsWith('sp_access=')).split(';')[0].slice(10);await login.text();await capture();
      if(role==='TEMPORARY'){const r=await request('/api/v1/cms/design-preview',token);assert.equal(r.body.error.code,'PASSWORD_CHANGE_REQUIRED');return;}
      const before=await publicSnapshot();
      const rows=await Promise.all(models.map(model=>db[model].findMany({orderBy:{id:'asc'}})));
      const preview=await request('/api/v1/cms/design-preview',token);assert.equal(preview.status,200);assert.equal(preview.headers.get('cache-control'),'no-store');assert.match(preview.headers.get('x-robots-tag'),/noindex/);
      assert.equal(preview.body.data.projects.length,3);assert.match(preview.body.data.projects[0].title,/Sample Project/);assert.equal(preview.body.data.settings.allowIndexing,false);
      assert.deepEqual(await Promise.all(models.map(model=>db[model].findMany({orderBy:{id:'asc'}}))),rows,'Preview reads cannot persist or publish anything');
      assert.deepEqual(await publicSnapshot(),before);
      for(const path of ['/api/v1/public-content','/api/v1/projects','/api/v1/experience','/api/v1/education','/api/v1/certifications','/api/v1/achievements'])assert.doesNotMatch(JSON.stringify((await request(path)).body),/demo-review-notebook|Fictional demonstration institution|Sample Project/);
      assert.equal((await request('/api/v1/cms/design-preview?publish=true',token)).status,400);
    });
  }
});
