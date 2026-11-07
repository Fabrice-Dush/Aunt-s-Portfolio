import { config } from 'dotenv';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { mkdirSync, openSync, closeSync, unlinkSync } from 'node:fs';
config({ path: new URL('../.env', import.meta.url), quiet: true });
const cwd = fileURLToPath(new URL('..', import.meta.url));
const value = process.env.TEST_DATABASE_URL;
let url;
try { url = new URL(value ?? 'mysql://invalid'); } catch { throw new Error('Invalid test database configuration'); }
if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.pathname !== '/seraphine_portfolio_test'
  || decodeURIComponent(url.username) !== 'seraphine_test' || value === process.env.DATABASE_URL) {
  throw new Error('Refusing tests: require separate local seraphine_portfolio_test and seraphine_test account.');
}
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
  run(['../node_modules/prisma/build/index.js', 'migrate', 'deploy']);
  run(['--import', 'tsx', '--test', 'test/integration/database.test.mjs']);
  run(['--import', 'tsx', '--test', 'test/integration/auth.test.mjs']);
  run(['--import', 'tsx', '--test', 'test/integration/cms.test.mjs']);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (lock !== undefined) { closeSync(lock); unlinkSync(lockPath); }
}
