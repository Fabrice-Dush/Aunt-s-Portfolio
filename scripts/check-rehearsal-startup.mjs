// Disposable privilege-table persistence diagnostic; never connects to XAMPP port 3306.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import mariadb from 'mariadb';

const root='C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-startup-canary-01';
const action=process.argv[2];
assert.ok(['setup','verify'].includes(action));
const secretFile=root+'/private-credentials.json';
const secret=action==='setup'?randomBytes(32).toString('hex'):JSON.parse(await fs.readFile(secretFile,'utf8')).root;
let c;
try {
 c=await mariadb.createConnection({host:'127.0.0.1',port:13311,user:'root',password:action==='setup'?'':secret,connectTimeout:5000});
 const [state]=await c.query('SELECT @@datadir d,@@port p,@@innodb_force_recovery r');
 assert.equal(state.d.replaceAll('\\','/').toLowerCase(),(root+'/data/').toLowerCase());
 assert.equal(Number(state.p),13311);assert.equal(Number(state.r),0);
 const checks=[];
 checks.push(await c.query('CHECK TABLE mysql.db'));
 if(action==='setup'){
  assert.equal((await c.query("SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='seraphine_canary'")).length,0);
  await fs.writeFile(secretFile,JSON.stringify({root:secret}),{flag:'wx'});
  await c.query("SET PASSWORD FOR 'root'@'localhost'=PASSWORD(?)",[secret]);
  await c.query('CREATE DATABASE seraphine_canary');
  await c.query("CREATE USER 'seraphine_canary'@'127.0.0.1' IDENTIFIED BY ?",[randomBytes(32).toString('hex')]);
  await c.query("GRANT SELECT,INSERT,UPDATE,DELETE ON `seraphine\\_canary`.* TO 'seraphine_canary'@'127.0.0.1'");
  checks.push(await c.query('CHECK TABLE mysql.db'));
 } else {
  const [r]=await c.query("SELECT COUNT(*) n FROM mysql.db WHERE User='seraphine_canary'");
  assert.equal(Number(r.n),1);
 }
 for(const check of checks)assert.ok(check.every(r=>r.Msg_type==='status'&&r.Msg_text==='OK'));
 await fs.writeFile(root+'/'+action+'.json',JSON.stringify({normalMode:true,checks},null,2),{flag:'wx'});
 await c.query('SHUTDOWN');
 console.log(action+': privilege-table CHECK passed; normal shutdown requested.');
}catch(e){console.error(JSON.stringify({failed:true,code:e.code??'ASSERTION',errno:e.errno??null}));process.exitCode=1;}finally{if(c)await c.end();}
