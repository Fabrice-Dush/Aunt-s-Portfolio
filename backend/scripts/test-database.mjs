import { config } from 'dotenv';
import { localDatabaseTarget, assertLocalDatabaseIdentity } from '../../scripts/local-database-targets.mjs';
import mariadb from 'mariadb';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { mkdirSync, openSync, closeSync, unlinkSync } from 'node:fs';
config({ path: new URL('../.env', import.meta.url), quiet: true });
const cwd = fileURLToPath(new URL('..', import.meta.url));
const value = process.env.TEST_DATABASE_URL;
const target = localDatabaseTarget(value, 'test');
if (value === process.env.DATABASE_URL) throw new Error('Refusing tests against the development configuration.');
const env = { ...process.env, DATABASE_URL: value, MIGRATION_DATABASE_URL: value, SHADOW_DATABASE_URL: '', NODE_ENV: 'test', JWT_SECRET: randomBytes(64).toString('hex') };
function run(args) {
  const result = spawnSync(process.execPath, args, { cwd, env, stdio: 'inherit' });
  if (result.status !== 0) throw new Error('Isolated database check failed; see the test result above.');
}
const cache = new URL('../../.cache/', import.meta.url);
const lockPath = new URL('phase08-testdb.lock', cache);
mkdirSync(cache, { recursive: true });
let lock;
try {
  try { lock = openSync(lockPath, 'wx'); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error('The isolated database is in use. Wait for its active tests to finish.');
    throw new Error('The isolated database test lock could not be created.');
  }
  // Confirm the physical instance and empty fixture schema before even migration DDL.
  let connection;
  try {
    connection = await mariadb.createConnection({ host: target.url.hostname, port: target.port, user: target.user,
      password: decodeURIComponent(target.url.password), database: target.database, connectTimeout: 5000, socketTimeout: 10000 });
    const [identity] = await connection.query('SELECT @@port port, @@innodb_force_recovery mode, @@datadir directory, VERSION() version, DATABASE() schemaName, CURRENT_USER() account');
    assertLocalDatabaseIdentity(identity, target);
    const tables = await connection.query('SELECT TABLE_NAME name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE()');
    const allowed = ['achievement', 'auditlog', 'authsession', 'certificate', 'contactmessage', 'education', 'experience', 'mediaasset', 'profile', 'project', 'sitesettings', 'skill', 'user', '_prisma_migrations'];
    if (tables.some(table => !allowed.includes(table.name.toLowerCase()))) throw new Error();
    for (const { name } of tables) {
      if (name === '_prisma_migrations') continue;
      const [row] = await connection.query('SELECT COUNT(*) count FROM `' + name + '`');
      if (Number(row.count) !== 0) throw new Error();
    }
  } catch { throw new Error('Refusing tests: approved instance identity and initially empty application tables are required.'); }
  finally { if (connection) await connection.end(); }
  run(['../node_modules/prisma/build/index.js', 'migrate', 'deploy']);
  run(['--import', 'tsx', '--test', 'test/integration/database.test.mjs']);
  run(['--import', 'tsx', '--test', 'test/integration/auth.test.mjs']);
  run(['--import', 'tsx', '--test', 'test/integration/cms.test.mjs']);
  run(['--import', 'tsx', '--test', 'test/integration/design-preview.test.mjs']);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (lock !== undefined) { closeSync(lock); unlinkSync(lockPath); }
}
