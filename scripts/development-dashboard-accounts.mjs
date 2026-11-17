// Explicitly authorized synthetic local development accounts; no auth/config changes.
import assert from 'node:assert/strict';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { readFile, writeFile, open, unlink, rename, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { parse } from 'dotenv';
import mariadb from 'mariadb';
import { localDatabaseTarget, assertLocalDatabaseIdentity } from './local-database-targets.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = resolve(root, '.cache/development-dashboard-private');
const statePath = resolve(directory, 'state.json');
const credentialPath = resolve(directory, 'credentials.json');
const lockPath = resolve(root, '.cache/phase08-testdb.lock');
const lockOwner = randomUUID();
const origin = 'http://localhost:5173';
const contentModels = ['achievement', 'certificate', 'profile', 'mediaAsset', 'experience', 'education', 'skill', 'project', 'contactMessage', 'siteSettings'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
let stage = 'configuration', db, disconnect, lock;
const exists = path => access(path).then(() => true, error => { if (error.code === 'ENOENT') return false; throw error; });
async function save(path, value) {
  await writeFile(path + '.next', JSON.stringify(value, null, 2), { mode: 0o600 });
  for (let attempt = 0; ; attempt++) {
    try { await rename(path + '.next', path); break; }
    catch (error) {
      if (!['EPERM', 'EACCES', 'EBUSY'].includes(error.code) || attempt >= 9) throw error;
      await new Promise(done => setTimeout(done, 100));
    }
  }
}
function checkDirectory() {
  const script = "$ErrorActionPreference='Stop'; $a=Get-Acl -LiteralPath '" + directory.replaceAll("'", "''")
    + "'; $s=[System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value; if(-not $a.AreAccessRulesProtected){exit 2}; foreach($r in $a.Access){$v=$r.IdentityReference.Translate([System.Security.Principal.SecurityIdentifier]).Value; if($v -ne $s -and $v -ne 'S-1-5-18'){exit 3}}";
  execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(script, 'utf16le').toString('base64')], { stdio: 'ignore', windowsHide: true });
  execFileSync('git', ['check-ignore', '--quiet', credentialPath], { cwd: root, stdio: 'ignore', windowsHide: true });
}
async function fingerprint(target) {
  const connection = await mariadb.createConnection({ host: target.url.hostname, port: target.port, user: target.user,
    password: decodeURIComponent(target.url.password), database: target.database, dateStrings: true, autoJsonMap: false, connectTimeout: 5000 });
  try {
    const result = {};
    await connection.beginTransaction();
    for (const model of [...contentModels, '_prisma_migrations']) {
      const rows = await connection.query('SELECT * FROM `' + model + '`');
      const canonical = rows.map(row => JSON.stringify(Object.fromEntries(Object.entries(row).sort(([a], [b]) => a.localeCompare(b))),
        (_key, value) => typeof value === 'bigint' ? { bigint: String(value) } : value)).sort();
      result[model] = { count: rows.length, hash: hash(JSON.stringify(canonical)) };
    }
    await connection.commit();
    return result;
  } finally { await connection.end(); }
}
async function main() {
  const operation = process.argv[2];
  assert.ok(['prepare', 'status', 'cleanup'].includes(operation), 'Choose prepare, status or cleanup');
  checkDirectory();
  // Do not overlap the historical manual fixture or integration suites.
  assert.equal(await exists(lockPath), false, 'Finish the isolated test fixture with its documented cleanup first');
  lock = await open(lockPath, 'wx');
  await lock.writeFile(lockOwner);
  const bytes = await readFile(resolve(root, 'backend/.env'));
  const config = parse(bytes);
  const target = localDatabaseTarget(config.DATABASE_URL, 'development');
  assert.equal(target.profile, 'xampp3306');
  assert.equal(config.FRONTEND_ORIGIN ?? origin, origin);
  assert.equal(config.PORT ?? '4000', '4000');
  assert.equal(config.NODE_ENV ?? 'development', 'development');
  assert.match(config.JWT_SECRET, /^[a-f0-9]{128}$/i);
  // Match npm run dev: load the actual unchanged environment, with no test overrides.
  for (const [key, value] of Object.entries(config)) {
    assert.ok(process.env[key] === undefined || process.env[key] === value, 'Refusing process configuration override');
    process.env[key] = value;
  }
  assert.notEqual(process.env.NODE_ENV, 'test');
  const database = await import('../backend/src/config/database.ts');
  disconnect = database.disconnectDatabase; db = database.getDatabase();
  const [identity] = await db.$queryRaw`SELECT @@port port, @@innodb_force_recovery mode, @@datadir directory, VERSION() version, DATABASE() schemaName, CURRENT_USER() account`;
  assertLocalDatabaseIdentity(identity, target);
  if (operation !== 'prepare') {
    const state = JSON.parse(await readFile(statePath, 'utf8'));
    assert.equal(state.database, target.database);
    assert.equal(state.origin, origin);
    assert.equal(state.environmentHash, hash(bytes));
    const expectedUsers = Object.entries(state.accounts).filter(([, account]) => account.id);
    for (const [role, account] of expectedUsers) {
      const user = await db.user.findUniqueOrThrow({ where: { id: account.id } });
      assert.equal(user.email, account.email); assert.equal(user.role, role);
      assert.equal(user.createdAt.toISOString(), account.createdAt);
    }
    if (operation === 'status') {
      assert.equal(expectedUsers.length, 2);
      const users = await db.user.findMany({ where: { id: { in: expectedUsers.map(([, account]) => account.id) } }, select: { role: true, email: true, isActive: true, mustChangePassword: true } });
      assert.ok(users.every(user => user.isActive && !user.mustChangePassword));
      assert.deepEqual(await fingerprint(target), state.preserved);
      console.log(JSON.stringify({ database: target.database, origin, users, preservedContentAndMigrationsUnchanged: true, environmentUnchanged: true }));
      return;
    }
    stage = 'captured account removal';
    const before = await fingerprint(target);
    await db.$transaction(async tx => {
      for (const [, account] of expectedUsers) {
        await tx.$queryRaw`SELECT id FROM User WHERE id = ${account.id} FOR UPDATE`;
        const user = await tx.user.findUniqueOrThrow({ where: { id: account.id } });
        assert.equal(user.email, account.email);
        assert.equal(user.createdAt.toISOString(), account.createdAt);
        assert.equal(user.role, Object.keys(state.accounts).find(role => state.accounts[role].id === account.id));
        await tx.authSession.deleteMany({ where: { userId: account.id } });
        await tx.user.delete({ where: { id: account.id } });
        await tx.auditLog.create({ data: { action: 'LOCAL_TEMPORARY_ACCOUNT_REMOVED', entity: 'User', entityId: account.id } });
      }
      // Retain audit history; the schema sets removed actors to null.
    });
    assert.deepEqual(await fingerprint(target), before);
    for (const path of [credentialPath, statePath]) await unlink(path).catch(error => { if (error.code !== 'ENOENT') throw error; });
    console.log('Removed only the captured temporary accounts and their sessions. Content, messages, migrations and audit history preserved.');
    return;
  }
  stage = 'initial development preservation checks';
  assert.equal(await exists(statePath), false, 'Existing state must be reviewed, never overwritten');
  assert.equal(await exists(credentialPath), false);
  assert.equal(await db.user.count(), 0, 'Refusing existing development users');
  assert.equal(await db.authSession.count(), 0);
  const preserved = await fingerprint(target);
  assert.equal(Object.entries(preserved).filter(([name]) => name !== '_prisma_migrations').reduce((sum, [, item]) => sum + item.count, 0), 17);
  assert.equal(preserved.contactMessage.count, 1);
  assert.equal(preserved._prisma_migrations.count, 2);
  const { password: passwordSchema, createAdminInput } = await import('../backend/src/validators/auth.ts');
  const credentials = { note: 'TEMPORARY LOCAL DEVELOPMENT ONLY. Remove using the documented captured-ID cleanup.', origin, database: target.database,
    ADMIN: { email: 'dev-test-studio@example.invalid', password: passwordSchema.parse(randomBytes(32).toString('base64url')), url: origin + '/admin' },
    SUPER_ADMIN: { email: 'dev-test-operations@example.invalid', password: passwordSchema.parse(randomBytes(32).toString('base64url')), url: origin + '/super-admin' } };
  const state = { origin, database: target.database, environmentHash: hash(bytes), preserved, status: 'preparing', accounts: {} };
  await save(statePath, state);
  await writeFile(credentialPath, JSON.stringify(credentials, null, 2), { flag: 'wx', mode: 0o600 });
  stage = 'existing audited local bootstrap';
  const { accountsService } = await import('../backend/src/services/accounts.service.ts');
  const user = await accountsService().bootstrap({ email: credentials.SUPER_ADMIN.email, displayName: 'TEMPORARY TEST System Operations', password: credentials.SUPER_ADMIN.password });
  state.accounts.SUPER_ADMIN = { id: user.id, email: user.email, createdAt: user.createdAt.toISOString() }; await save(statePath, state);
  const { request } = await import('@playwright/test');
  const client = await request.newContext({ baseURL: origin, extraHTTPHeaders: { Origin: origin, 'X-Portfolio-Request': '1' } });
  try {
    stage = 'normal backend login and authenticated ADMIN creation';
    const login = await client.post('/api/v1/auth/login', { data: { email: credentials.SUPER_ADMIN.email, password: credentials.SUPER_ADMIN.password } });
    assert.equal(login.status(), 200);
    const temporaryPassword = passwordSchema.parse(randomBytes(32).toString('base64url'));
    const input = createAdminInput.parse({ email: credentials.ADMIN.email, displayName: 'TEMPORARY TEST Portfolio Studio', temporaryPassword, currentPassword: credentials.SUPER_ADMIN.password });
    const created = await client.post('/api/v1/administrators', { data: input }); assert.equal(created.status(), 201);
    const admin = (await created.json()).data;
    state.accounts.ADMIN = { id: admin.id, email: admin.email, createdAt: new Date(admin.createdAt).toISOString() }; await save(statePath, state);
    assert.equal((await client.post('/api/v1/auth/logout', { data: {} })).status(), 204);
    assert.equal((await client.post('/api/v1/auth/login', { data: { email: credentials.ADMIN.email, password: temporaryPassword } })).status(), 200);
    assert.equal((await client.get('/api/v1/dashboard/summary')).status(), 403);
    stage = 'mandatory password replacement and session invalidation';
    assert.equal((await client.post('/api/v1/auth/change-password', { data: { currentPassword: temporaryPassword, newPassword: credentials.ADMIN.password } })).status(), 204);
    assert.equal((await client.get('/api/v1/auth/me')).status(), 401);
  } finally { await client.dispose(); }
  assert.deepEqual(await fingerprint(target), preserved);
  assert.equal(hash(await readFile(resolve(root, 'backend/.env'))), state.environmentHash);
  state.status = 'ready'; await save(statePath, state);
  console.log('READY: two temporary development accounts; 17 original content/message rows, full migration ledger and environment unchanged. Credentials stored privately.');
}
main().catch(() => {
  console.error('Temporary development account operation stopped at: ' + stage + '. Sensitive diagnostics suppressed; preserve private state for review.');
  process.exitCode = 1;
}).finally(async () => {
  await disconnect?.();
  if (lock) {
    await lock.close();
    assert.equal(await readFile(lockPath, 'utf8'), lockOwner, 'Preserve mismatched shared lock');
    await unlink(lockPath);
  }
});
