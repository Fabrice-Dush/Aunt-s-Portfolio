// Verify disposable server identity and grant-table health before a normal shutdown.
import assert from 'node:assert/strict';
import { connect, save } from './rehearse-database.mjs';
const label=process.argv[2];assert.match(label??'',/^[a-z0-9-]+$/);
let c;
try{
 c=await connect();
 const checks=await c.query('CHECK TABLE mysql.db, mysql.global_priv');
 await save('checkpoint-'+label+'.json',{checks,shutdownRequested:true});
 await c.query('SHUTDOWN');
 assert.equal(checks.length,2);
 assert.ok(checks.every(r=>r.Msg_type==='status'&&r.Msg_text==='OK'));
 console.log('Privilege tables CHECK OK; normal shutdown requested at '+label);
}catch(e){console.error(JSON.stringify({checkpointFailed:true,code:e.code??'ASSERTION',errno:e.errno??null}));process.exitCode=1;}finally{if(c)await c.end();}
