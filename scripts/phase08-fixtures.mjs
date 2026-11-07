import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdir, open, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const reportDirectory = resolve(root, '.cache/phase08-browser');
function testUrl(value) {
  try {
    const target = new URL(value ?? 'mysql://invalid');
    if (target.protocol !== 'mysql:' || !['localhost', '127.0.0.1'].includes(target.hostname)
      || target.port !== '13312' || target.pathname !== '/seraphine_portfolio_test'
      || decodeURIComponent(target.username) !== 'seraphine_test' || !target.password || target.search || target.hash) throw new Error();
    return target.href;
  } catch { throw new Error('Refusing fixtures: require the exact isolated local test database and scoped account.'); }
}
export function assertFixtureEnvironment(environment = process.env) {
  if (environment.NODE_ENV !== 'test' || environment.PORTFOLIO_BUILD_TEST !== '1'
    || environment.SHADOW_DATABASE_URL || testUrl(environment.DATABASE_URL) !== testUrl(environment.MIGRATION_DATABASE_URL)
    || testUrl(environment.DATABASE_URL) !== testUrl(environment.TEST_DATABASE_URL)) {
    throw new Error('Refusing fixtures: isolated test runtime, migration and build targets are required.');
  }
}
export function assertFixtureIdentity(identity) {
  if (!identity || Number(identity.port) !== 13312 || Number(identity.mode) !== 0 || !/^10\.4\.32-MariaDB/.test(identity.version)
    || identity.schemaName !== 'seraphine_portfolio_test' || identity.account?.split('@')[0] !== 'seraphine_test'
    || identity.directory?.replaceAll('\\', '/').toLowerCase().replace(/\/?$/, '/') !== 'c:/users/hp/documents/seraphine-database-recovery/2026-11-05-rehearsal-02/data/') {
    throw new Error('Refusing fixtures: the isolated database instance identity failed.');
  }
}
export function isolatedEnvironment() {
  config({ path: resolve(root, 'backend/.env'), quiet: true });
  testUrl(process.env.TEST_DATABASE_URL);
  if (process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Refusing browser fixtures against the application database configuration');
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.MIGRATION_DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.SHADOW_DATABASE_URL = '';
  process.env.NODE_ENV = 'test';
  process.env.PORTFOLIO_BUILD_TEST = '1';
  process.env.JWT_SECRET = randomBytes(64).toString('hex');
}

export async function fixture() {
  // Recheck at the write-owning entry point; callers cannot bypass isolation by omitting setup.
  assertFixtureEnvironment();
  const { getDatabase, disconnectDatabase } = await import('../backend/src/config/database.ts');
  const { hashPassword } = await import('../backend/src/services/password.service.ts');
  const { mediaRoot } = await import('../backend/src/services/media.service.ts');
  if (resolve(mediaRoot) !== resolve(root, 'backend/.cache/test-media')) throw new Error('Refusing fixtures: isolated test media storage is required.');
  const db = getDatabase();
  const models = ['profile','experience','education','skill','project','achievement','certificate','mediaAsset','contactMessage','siteSettings','authSession','auditLog','user'];
  await mkdir(reportDirectory, { recursive: true });
  const lockPath = resolve(root, '.cache/phase08-testdb.lock');
  const lock = await open(lockPath, 'wx');
  const ids = Object.fromEntries(models.map(model => [model, new Set()]));
  const mediaKeys = new Set();
  let owns = false;
  let cleanupPromise;
  async function capture() {
    if (!owns) return;
    for (const model of models) for (const row of await db[model].findMany({ select: { id: true } })) ids[model].add(row.id);
    for (const row of await db.mediaAsset.findMany({ select: { storageKey: true } })) mediaKeys.add(row.storageKey);
  }
  function cleanup() {
    return cleanupPromise ??= (async () => {
      let failed = false;
      try {
        if (owns) {
          await capture();
          for (const model of ['achievement','certificate','profile','mediaAsset','experience','education','skill','project','contactMessage','siteSettings','auditLog','authSession','user']) {
            await db[model].deleteMany({ where: { id: { in: [...ids[model]] } } });
          }
          for (const key of mediaKeys) {
            if (!/^[0-9a-f-]{36}\.(?:webp|pdf)$/.test(key)) throw new Error('Unexpected isolated media key');
            for (const suffix of ['', '.small', '.original']) await unlink(resolve(mediaRoot, key + suffix)).catch(error => { if (error.code !== 'ENOENT') throw error; });
          }
          for (const model of models) assert.equal(await db[model].count(), 0, 'Fixture cleanup: ' + model);
        }
      } catch { failed = true; }
      finally {
        for (const release of [disconnectDatabase, () => lock.close()]) {
          try { await release(); } catch { failed = true; }
        }
        if (!failed) { try { await unlink(lockPath); } catch { failed = true; } }
      }
      if (failed) throw new Error('Isolated fixture cleanup failed. Preserve the lock/evidence and inspect the exact test database before retrying.');
    })();
  }
  try {
    const [identity] = await db.$queryRaw`SELECT @@port port, @@innodb_force_recovery mode, @@datadir directory, VERSION() version, DATABASE() schemaName, CURRENT_USER() account`;
    assertFixtureIdentity(identity);
    for (const model of models) assert.equal(await db[model].count(), 0, 'Refusing a nonempty test database: ' + model);
    owns = true;
    const password = randomBytes(32).toString('base64url');
    const passwordHash = await hashPassword(password);
    const users = {};
    for (const role of ['ADMIN', 'SUPER_ADMIN']) {
      users[role] = await db.user.create({ data: { email: 'phase08-' + role.toLowerCase() + '@example.invalid', displayName: 'TEST ONLY ' + role, role, passwordHash } });
    }
    const published = { status: 'PUBLISHED', isVerified: true };
    await db.profile.create({ data: { id: 'owner', fullName: 'Nyirarukundo Seraphine', professionalTitle: 'Water Treatment Plant Engineer', summary: 'TEST ONLY published browser fixture introduction.', biography: 'TEST ONLY portfolio for isolated acceptance. This is synthetic test content.', motto: 'Water is life', location: 'Kigali, Rwanda', city: 'Kigali', country: 'Rwanda', experienceDescription: 'TEST ONLY experience', email: 'PRIVATE_PHASE08_CONTACT@example.invalid', phone: 'PRIVATE_PHASE08_PHONE', status: 'PUBLISHED' } });
    await db.experience.create({ data: { ...published, jobTitle: 'TEST ONLY laboratory engineer', organization: 'TEST ONLY organization', description: 'Synthetic browser work record.', startYear: 2020, endYear: 2021 } });
    await db.education.create({ data: { ...published, qualification: 'TEST ONLY laboratory qualification', institution: 'TEST ONLY institution', yearCompleted: 2019, notes: 'Synthetic browser education.' } });
    await db.skill.create({ data: { ...published, name: 'TEST ONLY water quality', category: 'TEST ONLY laboratory', description: 'Synthetic browser skill.' } });
    const project = await db.project.create({ data: { ...published, title: 'TEST ONLY published project', slug: 'phase08-test-project', summary: 'Synthetic browser project.', body: 'TEST ONLY project detail.', role: 'TEST ONLY contributor', year: 2021, result: 'TEST ONLY outcome' } });
    await db.achievement.create({ data: { ...published, title: 'TEST ONLY published achievement', description: 'Synthetic browser achievement.', year: 2021, projectId: project.id } });
    await db.certificate.create({ data: { ...published, title: 'TEST ONLY published training', issuer: 'TEST ONLY issuer', year: 2021, credentialDetails: 'Synthetic browser training.' } });
    await db.skill.create({ data: { name: 'PRIVATE_PHASE08_DRAFT', description: 'PRIVATE_PHASE08_DRAFT_BODY' } });
    await db.siteSettings.create({ data: { id: 'site', siteTitle: 'TEST ONLY | Nyirarukundo Seraphine', description: 'TEST ONLY isolated Phase 8 browser acceptance.', allowIndexing: false } });
    await capture();
    return { db, users, password, project, capture, cleanup, id: () => 'p08' + randomUUID().replaceAll('-', '') };
  } catch {
    await cleanup();
    throw new Error('Isolated browser fixture preparation failed. Verify the guarded test instance and empty application tables.');
  }
}
