// Fixed-workstation consistency check. Read-only except Prisma replay in the guarded disposable shadow.
// Do not run while browser/integration fixtures own the isolated test database.
import { readFile, writeFile, mkdir, lstat, realpath, open, unlink } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { parse } from 'dotenv';
import mariadb from 'mariadb';

const root = fileURLToPath(new URL('../', import.meta.url));
const backend = resolve(root, 'backend');
const environmentPath = resolve(backend, '.env');
const backup = 'C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-pre-cutover-01';
const expectedDataDirectory = 'c:/users/hp/documents/seraphine-database-recovery/2026-11-05-rehearsal-02/data/';
const expectedManifestHash = '65b830893f0bb242745937993a8b6aff8fde3a6c782b1ea16ec6fa01f1289ef1';
const applicationTables = ['achievement', 'auditlog', 'authsession', 'certificate', 'contactmessage', 'education', 'experience', 'mediaasset', 'profile', 'project', 'sitesettings', 'skill', 'user'];
const migrationNames = ['20261103183624_phase05_foundation', '20261104090000_phase06_sessions'];
const expectedRelations = {
  Profile_portraitId_fkey: 'RESTRICT', Achievement_projectId_fkey: 'RESTRICT', Certificate_mediaId_fkey: 'RESTRICT',
  MediaAsset_projectId_fkey: 'RESTRICT', AuditLog_actorId_fkey: 'SET NULL', AuthSession_userId_fkey: 'CASCADE',
};
const domainChecks = [
  ['profile', 'Profile_owner_only', "id = 'owner'"],
  ['sitesettings', 'SiteSettings_site_only', "id = 'site'"],
  ['experience', 'Experience_period', '(startYear IS NULL OR endYear IS NULL OR endYear >= startYear) AND (NOT isCurrent OR endYear IS NULL)'],
  ['project', 'Project_period', 'startYear IS NULL OR endYear IS NULL OR endYear >= startYear'],
  ['mediaasset', 'MediaAsset_positive_bytes', 'bytes > 0'],
];
const sha = value => createHash('sha256').update(value).digest('hex');
const normalizePath = value => value.replaceAll('\\', '/').toLowerCase().replace(/\/?$/, '/');
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
class SafeFailure extends Error {}
function guard(condition, code) { if (!condition) throw new SafeFailure(code); }
let check = 'configuration';
let testLock;
const testLockPath = resolve(root, '.cache/phase08-testdb.lock');
const report = { passed: false, checks: [], schemas: [], backup: null, applicationDataUnchanged: false, environmentAndSchemaUnchanged: false, shadowReplay: false };

function configuredUrl(config, key, user, database) {
  const url = new URL(config[key]);
  guard(url.protocol === 'mysql:' && ['127.0.0.1', 'localhost'].includes(url.hostname) && url.port === '13312'
    && decodeURIComponent(url.username) === user && Boolean(url.password) && url.pathname === '/' + database
    && !url.search && !url.hash, 'CONFIGURATION_GUARD_FAILED');
  return url;
}
async function connectionFor(url) {
  const connection = await mariadb.createConnection({ host: url.hostname, port: Number(url.port), user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password), database: url.pathname.slice(1), dateStrings: true, autoJsonMap: false,
    connectTimeout: 5000, socketTimeout: 10000 });
  try {
    const [identity] = await connection.query('SELECT @@port port, @@innodb_force_recovery mode, @@datadir directory, VERSION() version, DATABASE() schemaName, CURRENT_USER() account');
    guard(Number(identity.port) === 13312 && Number(identity.mode) === 0 && /^10\.4\.32-MariaDB/.test(identity.version)
      && normalizePath(identity.directory) === expectedDataDirectory && identity.schemaName === url.pathname.slice(1)
      && identity.account.split('@')[0] === decodeURIComponent(url.username), 'INSTANCE_GUARD_FAILED');
    return connection;
  } catch (error) { await connection.end(); throw error; }
}
function prisma(label, arguments_, environment) {
  check = label;
  const result = spawnSync(process.execPath, [resolve(root, 'node_modules/prisma/build/index.js'), ...arguments_], {
    cwd: backend, env: environment, windowsHide: true, encoding: 'utf8', maxBuffer: 1024 * 1024, timeout: 60000,
  });
  // Driver/CLI output can contain connection details; never print or persist it.
  guard(!result.error && result.status === 0, 'PRISMA_CHECK_FAILED');
  report.checks.push({ check: label, exitCode: 0 });
  console.log(JSON.stringify({ check: label, passed: true, exitCode: 0 }));
}
async function verifyBackup() {
  check = 'preserved-offline-backup';
  const manifestBytes = await readFile(resolve(backup, 'snapshot-manifest.json'));
  guard(sha(manifestBytes) === expectedManifestHash, 'BACKUP_MANIFEST_CHANGED');
  const manifest = JSON.parse(manifestBytes.toString('utf8').replace(/^\uFEFF/, ''));
  guard(manifest.completeOfflineSnapshot === true && manifest.files.length === 229
    && manifest.files.reduce((total, file) => total + file.bytes, 0) === 187752520, 'BACKUP_MANIFEST_INVALID');
  const realBackup = await realpath(backup);
  for (const file of manifest.files) {
    const target = resolve(backup, file.path);
    const within = relative(realBackup, await realpath(target));
    guard(within && !within.startsWith('..') && !isAbsolute(within), 'BACKUP_PATH_GUARD_FAILED');
    const info = await lstat(target);
    guard(info.isFile() && !info.isSymbolicLink() && info.size === file.bytes, 'BACKUP_FILE_INVALID');
    guard(sha(await readFile(target)) === file.sha256.toLowerCase(), 'BACKUP_FILE_HASH_CHANGED');
  }
  guard(sha(await readFile(resolve(backup, 'backend.env.private'))) === manifest.originalEnvSHA256.toLowerCase(), 'BACKUP_ENVIRONMENT_HASH_CHANGED');
  report.backup = { verified: true, files: 229, bytes: 187752520, originalEnvironmentVerified: true, newBackupCreated: false,
    scope: 'Preserved pre-cutover snapshot integrity; not a fresh Phase 8 backup or restore rehearsal' };
}
const canonical = rows => JSON.stringify(rows.map(row => JSON.stringify(Object.fromEntries(Object.entries(row).sort(([a], [b]) => a.localeCompare(b))),
  (_key, value) => typeof value === 'bigint' ? { bigint: String(value) } : value)).sort());
async function inspectSchema(kind, url, migrationHashes) {
  check = 'inspect-' + kind;
  const connection = await connectionFor(url);
  try {
    const tables = await connection.query('SELECT TABLE_NAME name, TABLE_TYPE kind FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() ORDER BY TABLE_NAME');
    const names = tables.map(table => table.name.toLowerCase()).sort();
    const expected = [...applicationTables, ...(kind === 'shadow' ? [] : ['_prisma_migrations'])].sort();
    guard(equal(names, expected) && tables.every(table => table.kind === 'BASE TABLE'), 'SCHEMA_TABLE_GUARD_FAILED');
    const fingerprints = {};
    let rows = 0;
    for (const table of applicationTables) {
      const records = await connection.query('SELECT * FROM `' + table + '` ORDER BY id');
      if (kind !== 'development') guard(records.length === 0, 'REFUSE_NONEMPTY_TEST_OR_SHADOW');
      fingerprints[table] = sha(canonical(records));
      rows += records.length;
    }
    if (kind === 'development') guard(rows === 16, 'DEVELOPMENT_RECORD_COUNT_CHANGED');
    if (kind !== 'shadow') {
      const migrations = await connection.query('SELECT migration_name name, checksum, finished_at finished, rolled_back_at rolledBack FROM _prisma_migrations ORDER BY migration_name');
      guard(equal(migrations.map(migration => migration.name), migrationNames), 'MIGRATION_HISTORY_CHANGED');
      for (const migration of migrations) guard(migration.finished && !migration.rolledBack && migration.checksum === migrationHashes[migration.name], 'MIGRATION_CHECKSUM_CHANGED');
    }
    const relations = await connection.query('SELECT CONSTRAINT_NAME name, DELETE_RULE deletion, UPDATE_RULE updating FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE()');
    guard(equal(relations.map(relation => relation.name).sort(), Object.keys(expectedRelations).sort())
      && relations.every(relation => relation.deletion === expectedRelations[relation.name] && relation.updating === 'CASCADE'), 'RELATIONSHIP_CHECK_FAILED');
    const constraints = await connection.query("SELECT CONSTRAINT_NAME name FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND CONSTRAINT_TYPE='CHECK'");
    for (const [table, name, expression] of domainChecks) {
      guard(constraints.some(constraint => constraint.name === name), 'DOMAIN_CONSTRAINT_MISSING');
      const [violations] = await connection.query('SELECT COUNT(*) count FROM `' + table + '` WHERE NOT (' + expression + ')');
      guard(Number(violations.count) === 0, 'DOMAIN_CONSTRAINT_VIOLATION');
    }
    const indexColumns = await connection.query('SELECT TABLE_NAME tableName, INDEX_NAME indexName, COLUMN_NAME columnName FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND NON_UNIQUE=0 ORDER BY TABLE_NAME,INDEX_NAME,SEQ_IN_INDEX');
    const indexes = new Map();
    for (const column of indexColumns.filter(column => applicationTables.includes(column.tableName.toLowerCase()))) {
      const key = column.tableName.toLowerCase() + ':' + column.indexName;
      indexes.set(key, [...(indexes.get(key) ?? []), column.columnName]);
    }
    const expectedIndexes = new Map(applicationTables.map(table => [table + ':PRIMARY', ['id']]));
    for (const [key, columns] of [['user:User_email_key', ['email']], ['user:User_bootstrapSlot_key', ['bootstrapSlot']], ['project:Project_slug_key', ['slug']], ['mediaasset:MediaAsset_storageKey_key', ['storageKey']]]) expectedIndexes.set(key, columns);
    guard(equal([...indexes.keys()].sort(), [...expectedIndexes.keys()].sort())
      && [...indexes].every(([key, columns]) => equal(columns, expectedIndexes.get(key))), 'UNIQUE_INDEX_CHECK_FAILED');
    return { summary: { kind, applicationTables: applicationTables.length, applicationRows: rows, foreignKeys: relations.length,
      domainChecks: domainChecks.length, uniqueIndexes: indexes.size, migrations: kind === 'shadow' ? 0 : migrationNames.length }, fingerprints };
  } finally { await connection.end(); }
}

try {
  await mkdir(resolve(root, '.cache'), { recursive: true });
  check = 'exclusive-test-database';
  try { testLock = await open(testLockPath, 'wx'); }
  catch { throw new SafeFailure('TEST_DATABASE_IN_USE_OR_LOCK_UNAVAILABLE'); }
  const originalEnvironment = await readFile(environmentPath);
  const config = parse(originalEnvironment);
  const runtime = configuredUrl(config, 'DATABASE_URL', 'seraphine_dev', 'seraphine_portfolio_dev');
  const migration = configuredUrl(config, 'MIGRATION_DATABASE_URL', 'seraphine_migrate', 'seraphine_portfolio_dev');
  const test = configuredUrl(config, 'TEST_DATABASE_URL', 'seraphine_test', 'seraphine_portfolio_test');
  const shadow = configuredUrl(config, 'SHADOW_DATABASE_URL', 'seraphine_migrate', 'seraphine_portfolio_shadow');
  const migrationHashes = Object.fromEntries(await Promise.all(migrationNames.map(async name => [name, sha(await readFile(resolve(backend, 'prisma/migrations', name, 'migration.sql')))])));
  const schemaHash = sha(await readFile(resolve(backend, 'prisma/schema.prisma')));
  await verifyBackup();
  check = 'runtime-account-instance';
  await (await connectionFor(runtime)).end();
  const before = {};
  for (const [kind, url] of [['development', migration], ['test', test], ['shadow', shadow]]) before[kind] = await inspectSchema(kind, url, migrationHashes);
  const environment = { ...process.env, ...config, NODE_ENV: 'test' };
  const scoped = url => ({ ...environment, DATABASE_URL: url.href, MIGRATION_DATABASE_URL: url.href, SHADOW_DATABASE_URL: '' });
  prisma('prisma-validate', ['validate'], scoped(migration));
  for (const [kind, url] of [['development', migration], ['test', test]]) {
    prisma('migration-status-' + kind, ['migrate', 'status'], scoped(url));
    prisma('model-diff-' + kind, ['migrate', 'diff', '--from-config-datasource', '--to-schema', 'prisma/schema.prisma', '--exit-code'], scoped(url));
  }
  // Only this known, empty thirteen-table shadow is disposable. The datasource remains development:
  // Prisma replays source migrations into the configured shadow and compares it to development.
  await inspectSchema('shadow', shadow, migrationHashes);
  prisma('guarded-shadow-replay', ['migrate', 'diff', '--from-migrations', 'prisma/migrations', '--to-config-datasource', '--exit-code'], {
    ...environment, DATABASE_URL: runtime.href, MIGRATION_DATABASE_URL: migration.href, SHADOW_DATABASE_URL: shadow.href,
  });
  report.shadowReplay = true;
  for (const [kind, url] of [['development', migration], ['test', test], ['shadow', shadow]]) {
    const after = await inspectSchema(kind, url, migrationHashes);
    guard(equal(before[kind].fingerprints, after.fingerprints), 'APPLICATION_DATA_CHANGED');
    report.schemas.push(after.summary);
  }
  report.applicationDataUnchanged = true;
  check = 'preserved-source-and-environment';
  guard(sha(await readFile(environmentPath)) === sha(originalEnvironment)
    && sha(await readFile(resolve(backend, 'prisma/schema.prisma'))) === schemaHash, 'ENVIRONMENT_OR_SCHEMA_CHANGED');
  for (const name of migrationNames) guard(sha(await readFile(resolve(backend, 'prisma/migrations', name, 'migration.sql'))) === migrationHashes[name], 'SOURCE_MIGRATION_CHANGED');
  guard(sha(await readFile(resolve(backup, 'snapshot-manifest.json'))) === expectedManifestHash, 'BACKUP_MANIFEST_CHANGED');
  report.environmentAndSchemaUnchanged = true;
  report.passed = true;
  check = 'report';
  await mkdir(resolve(root, '.cache'), { recursive: true });
  await writeFile(resolve(root, '.cache/phase08-database.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} catch (error) {
  console.error(JSON.stringify({ passed: false, check, code: error instanceof SafeFailure ? error.message : 'DATABASE_CHECK_FAILED' }));
  process.exitCode = 1;
} finally {
  if (testLock) { await testLock.close(); await unlink(testLockPath); }
}
