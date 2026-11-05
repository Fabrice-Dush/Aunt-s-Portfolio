import { config } from 'dotenv';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
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
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run(['../node_modules/prisma/build/index.js', 'migrate', 'deploy']);
run(['--import', 'tsx', '--test', 'test/integration/database.test.mjs']);
run(['--import', 'tsx', '--test', 'test/integration/auth.test.mjs']);
