// Explicit local development bootstrap. Never modifies existing databases/accounts.
import mariadb from 'mariadb';
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';

const envPath = fileURLToPath(new URL('../.env', import.meta.url));
const original = readFileSync(envPath, 'utf8');
const existing = parse(original);
if (existing.DATABASE_URL && !existing.DATABASE_URL.includes('CHANGE_ME')) {
  throw new Error('Existing configured environment: inspect manually; refusing overwrite.');
}
const connection = await mariadb.createConnection({
  host: '127.0.0.1', port: 3306, user: 'root',
  password: process.env.LOCAL_DB_ADMIN_PASSWORD ?? '',
});
try {
  const databases = ['seraphine_portfolio_dev', 'seraphine_portfolio_test', 'seraphine_portfolio_shadow'];
  const accounts = ['seraphine_dev', 'seraphine_migrate', 'seraphine_test'];
  const schemas = await connection.query('SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME IN (?,?,?)', databases);
  const users = await connection.query('SELECT User FROM mysql.user WHERE User IN (?,?,?)', accounts);
  if (schemas.length || users.length) throw new Error('Project database/account already exists; inspect manually. No changes made.');
  const passwords = accounts.map(() => randomBytes(32).toString('hex'));
  // Persist recoverable credentials before DDL; errors must never log driver queries.
  const url = (i, db) => `mysql://${accounts[i]}:${passwords[i]}@127.0.0.1:3306/${db}`;
  const values = {
    DATABASE_URL: url(0, databases[0]), MIGRATION_DATABASE_URL: url(1, databases[0]),
    SHADOW_DATABASE_URL: url(1, databases[2]), TEST_DATABASE_URL: url(2, databases[1]),
  };
  let updated = original;
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`;
    updated = new RegExp(`^${key}=.*$`, 'm').test(updated)
      ? updated.replace(new RegExp(`^${key}=.*$`, 'm'), line) : `${updated.trimEnd()}\n${line}\n`;
  }
  writeFileSync(envPath, updated, { mode: 0o600 });
  for (const db of databases) await connection.query(`CREATE DATABASE \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  for (let i = 0; i < accounts.length; i++) {
    await connection.query(`CREATE USER '${accounts[i]}'@'127.0.0.1' IDENTIFIED BY ?`, [passwords[i]]);
  }
  const scope = db => '`' + db.replaceAll('_', '\\_') + '`.*';
  await connection.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ${scope(databases[0])} TO 'seraphine_dev'@'127.0.0.1'`);
  for (const db of [databases[0], databases[2]]) {
    await connection.query(`GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX, REFERENCES ON ${scope(db)} TO 'seraphine_migrate'@'127.0.0.1'`);
  }
  await connection.query(`GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX, REFERENCES ON ${scope(databases[1])} TO 'seraphine_test'@'127.0.0.1'`);
  console.log('Created three isolated local databases and three scoped accounts. Credentials saved only in backend/.env.');
} catch {
  console.error('Local setup failed. Inspect database/account state before retrying; credentials may already be saved.');
  process.exitCode = 1;
} finally { await connection.end(); }
