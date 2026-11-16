// Temporary, local-only manual fixtures. Never changes backend/.env or development data.
import assert from 'node:assert/strict';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { readFile, writeFile, open, unlink, lstat, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { parse } from 'dotenv';
import mariadb from 'mariadb';
import { localDatabaseTarget, assertLocalDatabaseIdentity } from './local-database-targets.mjs';
import { assertFixtureEnvironment } from './phase08-fixtures.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const privateDir = resolve(root, '.cache/manual-dashboard-private');
const statePath = resolve(privateDir, 'state.json');
const credentialsPath = resolve(privateDir, 'credentials.json');
const requestPath = resolve(privateDir, 'cleanup.request');
const lockPath = resolve(root, '.cache/phase08-testdb.lock');
const origin = 'http://127.0.0.1:5186';
const models = ['achievement','certificate','profile','mediaAsset','experience','education','skill','project','contactMessage','siteSettings','auditLog','authSession','user'];
const hash = value => createHash('sha256').update(value).digest('hex');
const canonical = rows => JSON.stringify(rows.map(row => JSON.stringify(Object.fromEntries(Object.entries(row).sort(([a], [b]) => a.localeCompare(b))),
  (_key, value) => typeof value === 'bigint' ? { bigint: String(value) } : value)).sort());
let phase = 'configuration';
function protectedDirectory() {
  // Require an existing owner-only folder; do not create a password file then fix permissions.
  const check = "$ErrorActionPreference='Stop'; $a=Get-Acl -LiteralPath '" + privateDir.replaceAll("'", "''")
    + "'; $s=[System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value; if(-not $a.AreAccessRulesProtected){exit 2}; foreach($r in $a.Access){$v=$r.IdentityReference.Translate([System.Security.Principal.SecurityIdentifier]).Value; if($v -ne $s -and $v -ne 'S-1-5-18'){exit 3}}";
  execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(check, 'utf16le').toString('base64')], { stdio: 'ignore', windowsHide: true });
}
async function readState() { return JSON.parse(await readFile(statePath, 'utf8')); }
async function environment() {
  const bytes = await readFile(resolve(root, 'backend/.env'));
  const config = parse(bytes);
  const target = localDatabaseTarget(config.TEST_DATABASE_URL, 'test');
  assert.equal(target.profile, 'xampp3306');
  assert.notEqual(config.DATABASE_URL, config.TEST_DATABASE_URL);
  Object.assign(process.env, config, { DATABASE_URL: config.TEST_DATABASE_URL, TEST_DATABASE_URL: config.TEST_DATABASE_URL,
    MIGRATION_DATABASE_URL: config.TEST_DATABASE_URL, SHADOW_DATABASE_URL: '', NODE_ENV: 'test', PORTFOLIO_BUILD_TEST: '1',
    PORT: '4416', FRONTEND_ORIGIN: origin, JWT_SECRET: randomBytes(64).toString('hex') });
  assertFixtureEnvironment();
  return { config, target, environmentHash: hash(bytes) };
}
async function developmentFingerprint(config) {
  // Read-only connection using the existing development DML identity. No app instance uses it.
  const target = localDatabaseTarget(config.DATABASE_URL, 'development');
  const connection = await mariadb.createConnection({ host: target.url.hostname, port: target.port,
    user: target.user, password: decodeURIComponent(target.url.password), database: target.database,
    dateStrings: true, autoJsonMap: false, connectTimeout: 5000 });
  try {
    const [identity] = await connection.query('SELECT @@port port, @@innodb_force_recovery mode, @@datadir directory, VERSION() version, DATABASE() schemaName, CURRENT_USER() account');
    assertLocalDatabaseIdentity(identity, target);
    const result = {}; let count = 0;
    for (const model of [...models, '_prisma_migrations']) {
      const rows = await connection.query('SELECT * FROM `' + model + '`');
      result[model] = hash(canonical(rows));
      if (model !== '_prisma_migrations') count += rows.length;
    }
    assert.ok(count >= 16, 'Expected at least the preserved 16 development records');
    return result;
  } finally { await connection.end(); }
}
async function identity(db, target) {
  const [actual] = await db.$queryRaw`SELECT @@port port, @@innodb_force_recovery mode, @@datadir directory, VERSION() version, DATABASE() schemaName, CURRENT_USER() account`;
  assertLocalDatabaseIdentity(actual, target);
}
async function removeOwned(state, db, target) {
  await identity(db, target);
  // Offline cleanup refuses any row not captured by the exclusive fixture owner.
  for (const model of models) for (const row of await db[model].findMany({ select: { id: true } })) {
    assert.ok(state.ids[model].includes(row.id), 'Uncaptured test row; preserve lock for review');
  }
  await db.$transaction(async tx => {
    for (const model of models) await tx[model].deleteMany({ where: { id: { in: state.ids[model] } } });
  });
  for (const model of models) assert.equal(await db[model].count(), 0);
  for (const key of state.mediaKeys) {
    assert.match(key, /^[0-9a-f-]{36}\.(?:webp|pdf)$/);
    for (const suffix of ['', '.small', '.original']) await unlink(resolve(root, 'backend/.cache/test-media', key + suffix)).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
}
async function releaseFiles() {
  for (const path of [credentialsPath, statePath, requestPath]) await unlink(path).catch(error => { if (error.code !== 'ENOENT') throw error; });
  await unlink(lockPath);
}
async function main() {
  const operation = process.argv[2] ?? 'start';
  assert.ok(['start', 'cleanup', 'status'].includes(operation));
  protectedDirectory();
  if (operation === 'status') {
    const state = await readState();
    const { config, target, environmentHash } = await environment();
    assert.equal(environmentHash, state.environmentHash);
    assert.deepEqual(await developmentFingerprint(config), state.developmentFingerprint);
    assert.equal(await readFile(lockPath, 'utf8'), state.runId);
    const { getDatabase, disconnectDatabase } = await import('../backend/src/config/database.ts');
    try {
      const db = getDatabase(); await identity(db, target);
      const users = await db.user.findMany({ select: { id: true, role: true, mustChangePassword: true } });
      assert.equal(users.length, 2);
      assert.deepEqual(users.map(user => user.role).sort(), ['ADMIN', 'SUPER_ADMIN']);
      assert.ok(users.every(user => state.ids.user.includes(user.id) && !user.mustChangePassword));
      console.log(JSON.stringify({ pid: state.pid, startedAt: state.startedAt, origin, database: state.database, status: state.status,
        users: users.map(({ role, mustChangePassword }) => ({ role, mustChangePassword })),
        activeSessions: await db.authSession.count({ where: { revokedAt: null, expiresAt: { gt: new Date() } } }),
        developmentUnchanged: true, environmentUnchanged: true, credentialsFile: credentialsPath }));
    } finally { await disconnectDatabase(); }
    return;
  }
  if (operation === 'cleanup') {
    const state = await readState();
    assert.equal((await readFile(lockPath, 'utf8')), state.runId);
    let alive = true;
    try { process.kill(state.pid, 0); } catch (error) { if (error.code === 'ESRCH') alive = false; else throw error; }
    if (alive) {
      await writeFile(requestPath, state.runId, { flag: 'wx' });
      for (let attempt = 0; attempt < 150; attempt++) {
        try { await lstat(lockPath); } catch (error) { if (error.code === 'ENOENT') { console.log('Temporary fixture cleanup completed; test tables empty and lock released.'); return; } throw error; }
        await new Promise(resolveWait => setTimeout(resolveWait, 100));
      }
      throw new Error('Cleanup pending; preserve lock and inspect the running fixture');
    }
    const { config, target, environmentHash } = await environment();
    assert.equal(environmentHash, state.environmentHash);
    assert.deepEqual(await developmentFingerprint(config), state.developmentFingerprint);
    const { getDatabase, disconnectDatabase } = await import('../backend/src/config/database.ts');
    try { await removeOwned(state, getDatabase(), target); await releaseFiles(); }
    finally { await disconnectDatabase(); }
    console.log('Offline captured-ID cleanup complete; test tables empty.');
    return;
  }
  const { config, target, environmentHash } = await environment();
  // No credentials exist until the shared exclusive lock, identity and empty checks pass.
  const lock = await open(lockPath, 'wx');
  const runId = randomUUID(); await lock.writeFile(runId);
  let db, apiServer, viteServer, timer, state, cleaning = false;
  let queue = Promise.resolve();
  const { getDatabase, disconnectDatabase } = await import('../backend/src/config/database.ts');
  async function capture() {
    if (!state) return;
    for (const model of models) for (const row of await db[model].findMany({ select: { id: true } })) {
      if (!state.ids[model].includes(row.id)) state.ids[model].push(row.id);
    }
    for (const row of await db.mediaAsset.findMany({ select: { storageKey: true } })) if (!state.mediaKeys.includes(row.storageKey)) state.mediaKeys.push(row.storageKey);
    const serialized = JSON.stringify(state, null, 2);
    if (serialized !== capture.lastSaved) {
      await writeFile(statePath + '.next', serialized);
      for (let attempt = 0; ; attempt++) {
        try { await rename(statePath + '.next', statePath); break; }
        catch (error) {
          if (!['EPERM', 'EACCES', 'EBUSY'].includes(error.code) || attempt >= 9) throw error;
          await new Promise(resolveWait => setTimeout(resolveWait, 100));
        }
      }
      capture.lastSaved = serialized;
    }
  }
  async function finish() {
    if (cleaning) return; cleaning = true; clearInterval(timer);
    try {
      await viteServer?.close();
      if (apiServer) await new Promise((done, reject) => apiServer.close(error => error ? reject(error) : done()));
      await queue; await capture();
      if (state) {
        assert.equal(hash(await readFile(resolve(root, 'backend/.env'))), state.environmentHash);
        assert.deepEqual(await developmentFingerprint(config), state.developmentFingerprint);
        await removeOwned(state, db, target);
      }
      await disconnectDatabase(); await lock.close();
      if (state) await releaseFiles(); else await unlink(lockPath);
      console.log('CLEAN: captured test rows removed; development unchanged; credentials and lock removed.');
    } catch { console.error('Cleanup failed; preserve lock/private state for inspection. No driver details logged.'); process.exitCode = 1; }
    finally { await disconnectDatabase(); }
  }
  try {
    phase = 'test database identity and initially-empty checks';
    db = getDatabase(); await identity(db, target);
    for (const model of models) assert.equal(await db[model].count(), 0, 'Refusing nonempty test schema');
    assert.equal(await db.$queryRaw`SELECT COUNT(*) count FROM _prisma_migrations`.then(rows => Number(rows[0].count)), 2);
    state = { runId, pid: process.pid, startedAt: new Date().toISOString(), database: target.database, environmentHash,
      developmentFingerprint: await developmentFingerprint(config), ids: Object.fromEntries(models.map(model => [model, []])), mediaKeys: [], status: 'preparing' };
    await capture();
    const { accountsService } = await import('../backend/src/services/accounts.service.ts');
    const { password: passwordSchema, createAdminInput } = await import('../backend/src/validators/auth.ts');
    const { app } = await import('../backend/src/app.ts');
    phase = 'loopback API startup';
    apiServer = await new Promise((done, reject) => {
      const server = app.listen(4416, '127.0.0.1', () => done(server)); server.once('error', reject);
    });
    const credentials = {
      note: 'TEMPORARY ISOLATED TEST ONLY. Do not share, commit, or use on development/production. Delete with the cleanup command.',
      origin, database: target.database,
      ADMIN: { email: 'manual-studio@example.invalid', password: passwordSchema.parse(randomBytes(32).toString('base64url')), url: origin + '/admin' },
      SUPER_ADMIN: { email: 'manual-operations@example.invalid', password: passwordSchema.parse(randomBytes(32).toString('base64url')), url: origin + '/super-admin' },
    };
    phase = 'existing audited maintainer bootstrap service';
    // Same bootstrap implementation as the trusted-local hidden-input provision.ts CLI.
    await accountsService().bootstrap({ email: credentials.SUPER_ADMIN.email, displayName: 'TEST ONLY System Operations', password: credentials.SUPER_ADMIN.password });
    await capture();
    const { request } = await import('@playwright/test');
    const client = await request.newContext({ baseURL: 'http://127.0.0.1:4416', extraHTTPHeaders: { Origin: origin, 'X-Portfolio-Request': '1' } });
    try {
      phase = 'authenticated ADMIN creation with maintainer password';
      assert.equal((await client.post('/api/v1/auth/login', { data: { email: credentials.SUPER_ADMIN.email, password: credentials.SUPER_ADMIN.password } })).status(), 200);
      const temporaryPassword = passwordSchema.parse(randomBytes(32).toString('base64url'));
      const input = createAdminInput.parse({ email: credentials.ADMIN.email, displayName: 'TEST ONLY Portfolio Studio', temporaryPassword, currentPassword: credentials.SUPER_ADMIN.password });
      assert.equal((await client.post('/api/v1/administrators', { data: input })).status(), 201);
      await capture();
      assert.equal((await client.post('/api/v1/auth/logout', { data: {} })).status(), 204);
      assert.equal((await client.post('/api/v1/auth/login', { data: { email: credentials.ADMIN.email, password: temporaryPassword } })).status(), 200);
      assert.equal((await client.get('/api/v1/dashboard/summary')).status(), 403);
      phase = 'required ADMIN password replacement and session revocation';
      assert.equal((await client.post('/api/v1/auth/change-password', { data: { currentPassword: temporaryPassword, newPassword: credentials.ADMIN.password } })).status(), 204);
      assert.equal((await client.get('/api/v1/auth/me')).status(), 401);
    } finally { await client.dispose(); await capture(); }
    await writeFile(credentialsPath, JSON.stringify(credentials, null, 2), { flag: 'wx' });
    phase = 'isolated frontend startup';
    const { createServer } = await import('vite');
    viteServer = await createServer({ root: resolve(root, 'frontend'), configFile: resolve(root, 'frontend/vite.config.ts'), cacheDir: resolve(root, 'frontend/node_modules/.vite-manual-dashboard-test'),
      server: { host: '127.0.0.1', port: 5186, strictPort: true, fs: { deny: ['**/.cache/**', '**/.env*', '**/.git/**', '**/.private-media/**', '**/handoff-private/**'] },
        headers: { 'X-Portfolio-Environment': 'isolated-test-x3306', 'Cache-Control': 'no-store' },
        proxy: { '/api': { target: 'http://127.0.0.1:4416', changeOrigin: true } } },
      plugins: [{ name: 'manual-test-environment', configureServer(server) {
        server.middlewares.use('/__manual-test-environment', (_req, res) => {
          res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Portfolio-Environment', 'isolated-test-x3306');
          res.end(JSON.stringify({ environment: 'isolated-test', database: target.database, port: target.port, apiPort: 4416, frontendOrigin: origin }));
        });
      } }],
    });
    await viteServer.listen();
    state.status = 'ready'; await capture();
    timer = setInterval(() => {
      queue = queue.then(async () => {
        await capture();
        try { if (await readFile(requestPath, 'utf8') === runId) { setImmediate(() => void finish()); } }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
      }).catch(error => {
        console.error('Fixture tracking stopped: ' + error.name + ' ' + (error.code ?? '') + ' '
          + (error.stack?.split('\n').find(line => line.includes('manual-dashboard-test.mjs:')) ?? ''));
        setImmediate(() => void finish());
      });
    }, 1000);
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => void finish());
    console.log('READY: isolated test dashboards at ' + origin + '/login');
    console.log('Credentials are owner-restricted in ' + credentialsPath + '. No passwords logged.');
    console.log('Shared test lock held. Stop and remove fixtures: node --import tsx scripts/manual-dashboard-test.mjs cleanup');
  } catch (error) { await finish(); throw error; }
}
main().catch(error => {
  if (error.name === 'AssertionError') console.error('Guard assertion: ' + error.message.split('\n')[0]);
  if (error.stack) console.error('Location: ' + (error.stack.split('\n').find(line => line.includes('manual-dashboard-test.mjs:')) ?? 'configuration'));
  console.error('Manual dashboard setup stopped at: ' + phase + '. No credentials or raw driver errors logged. Preserve any retained lock for review.'); process.exitCode = 1;
});
