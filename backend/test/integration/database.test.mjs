import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { getDatabase, disconnectDatabase, databaseOptions } from '../../src/config/database.ts';
import { contentServices } from '../../src/services/content.service.ts';
import { privateServices } from '../../src/services/private.service.ts';
import { seedDevelopment } from '../../src/services/seed.service.ts';
import { app } from '../../src/app.ts';

const options = databaseOptions(process.env.DATABASE_URL);
assert.equal(options.database, 'seraphine_portfolio_test');
assert.equal(options.user, 'seraphine_test');
assert.ok(['127.0.0.1', 'localhost'].includes(options.host));
const db = getDatabase();
const content = contentServices(db);
const privateContent = privateServices(db);

test('real MariaDB integration and public HTTP acceptance', async t => {
  const created = new Map();
  const remember = (model, row) => { const ids = created.get(model) ?? []; ids.push(row.id); created.set(model, ids); return row; };
  t.after(async () => {
    // Only records created by this run; dependency order respects RESTRICT relationships.
    for (const model of ['auditLog', 'contactMessage', 'certificate', 'profile', 'achievement', 'mediaAsset', 'project', 'experience', 'education', 'skill', 'siteSettings', 'user']) {
      const ids = created.get(model) ?? [];
      if (ids.length) await db[model].deleteMany({ where: { id: { in: ids } } });
    }
    await db.$disconnect();
    await disconnectDatabase();
  });
  // Refuse to touch a test DB containing anyone's data. No reset/truncate anywhere.
  for (const model of ['user', 'auditLog', 'profile', 'experience', 'education', 'skill', 'project', 'achievement', 'certificate', 'mediaAsset', 'contactMessage', 'siteSettings']) {
    assert.equal(await db[model].count(), 0, `Test database is not empty: ${model}; inspect manually`);
  }
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  const get = async path => { const response = await fetch(base + path); return { status: response.status, body: await response.json() }; };
  let project, media, skill;

  await t.test('server identity, migration history and runtime account grants', async () => {
    const [identity] = await db.$queryRaw`SELECT VERSION() AS version, DATABASE() AS db, @@port AS port`;
    assert.match(identity.version, /MariaDB/); assert.equal(identity.db, 'seraphine_portfolio_test');
    const migrations = await db.$queryRaw`SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations`;
    assert.ok(migrations.length); assert.ok(migrations.every(m => m.finished_at && !m.rolled_back_at));
    assert.equal((await get('/health')).status, 200);
  });
  await t.test('seed repeats without duplicates or overwriting edits and seeds no fabricated records', async () => {
    await seedDevelopment(db);
    for (const model of ['profile', 'experience', 'education', 'skill', 'certificate', 'siteSettings']) {
      for (const row of await db[model].findMany({ select: { id: true } })) remember(model, row);
    }
    await db.profile.update({ where: { id: 'owner' }, data: { motto: 'Editor change' } });
    await seedDevelopment(db);
    assert.equal((await db.profile.findUnique({ where: { id: 'owner' } })).motto, 'Editor change');
    assert.equal(await db.profile.count(), 1); assert.equal(await db.skill.count(), 6);
    for (const model of ['user', 'project', 'achievement', 'contactMessage', 'mediaAsset']) assert.equal(await db[model].count(), 0);
    assert.equal((await get('/profile')).body.data.fullName, 'Nyirarukundo Seraphine');
    for (const path of ['/experience', '/education', '/certifications', '/projects', '/achievements']) assert.deepEqual((await get(path)).body.data, []);
  });
  await t.test('draft create/read/update/publish/unpublish and partial-update preservation', async () => {
    skill = remember('skill', await content.skill.create({ name: 'TEST ONLY skill', sortOrder: 42 }));
    await assert.rejects(() => content.skill.publish(skill.id), { code: 'UNVERIFIED_CONTENT' });
    await content.skill.update(skill.id, { isVerified: true });
    await content.skill.publish(skill.id);
    assert.ok((await get('/skills')).body.data.some(r => r.id === skill.id));
    const edited = await content.skill.update(skill.id, { description: 'TEST ONLY edit' });
    assert.equal(edited.sortOrder, 42); assert.equal(edited.isVerified, true); assert.equal(edited.status, 'DRAFT');
    assert.ok(!(await get('/skills')).body.data.some(r => r.id === skill.id));
    await content.skill.publish(skill.id); await content.skill.unpublish(skill.id);
    assert.equal((await content.skill.read(skill.id)).status, 'DRAFT');
    await assert.rejects(() => content.skill.update(skill.id, { status: 'PUBLISHED' }));
    await assert.rejects(() => content.skill.read('missing'), { code: 'NOT_FOUND' });
  });
  await t.test('all portfolio collections and unknown dates round-trip through real services/API', async () => {
    for (const [model, route, input] of [
      ['experience', 'experience', { jobTitle: 'TEST ONLY role', organization: 'TEST ONLY organization', isCurrent: true }],
      ['education', 'education', { qualification: 'TEST ONLY qualification', institution: 'TEST ONLY institution' }],
      ['certificate', 'certifications', { title: 'TEST ONLY training' }],
      ['achievement', 'achievements', { title: 'TEST ONLY achievement' }],
    ]) {
      const row = remember(model, await content[model].create({ ...input, isVerified: true }));
      await content[model].publish(row.id);
      const response = await get('/' + route);
      assert.equal(response.status, 200); assert.ok(response.body.data.some(item => item.id === row.id));
      assert.equal('status' in response.body.data[0], false);
    }
    const experience = (await get('/experience')).body.data[0];
    assert.equal(experience.startYear, null); assert.equal(experience.endYear, null);
    await assert.rejects(() => content.experience.create({ jobTitle: 'Test', organization: 'Test', startYear: 2025, endYear: 2020 }));
  });
  await t.test('project uniqueness, publication filtering, slug 404 and stable pagination', async () => {
    project = remember('project', await content.project.create({ title: 'TEST ONLY project', slug: 'test-only-project', isVerified: true }));
    assert.equal((await get('/projects/test-only-project')).status, 404);
    await content.project.publish(project.id);
    assert.equal((await get('/projects/test-only-project')).body.data.title, 'TEST ONLY project');
    await assert.rejects(() => content.project.create({ title: 'Duplicate', slug: 'test-only-project' }), { code: 'P2002' });
    const draft = remember('project', await content.project.create({ title: 'PRIVATE DRAFT SENTINEL', slug: 'private-draft' }));
    assert.equal((await get('/projects/private-draft')).status, 404);
    assert.equal((await get('/projects/missing')).status, 404);
    assert.equal((await get('/projects')).body.data.some(r => r.id === draft.id), false);
    const first = await get('/skills?limit=2&page=1'); const second = await get('/skills?limit=2&page=2');
    assert.equal(first.body.pagination.hasMore, true); assert.equal(first.body.data.length, 2);
    assert.equal(new Set([...first.body.data, ...second.body.data].map(r => r.id)).size, 4);
    const reversed = await get('/skills?sort=desc'); assert.equal(reversed.body.data[0].id, 'seed-skill-5');
  });
  await t.test('media/portrait/credential relationships reveal only explicitly approved assets', async () => {
    media = remember('mediaAsset', await privateContent.createMedia({ fileName: 'private-original.webp', storageKey: 'private/test.webp', mimeType: 'image/webp', bytes: 100, projectId: project.id }));
    await db.profile.update({ where: { id: 'owner' }, data: { portraitId: media.id } });
    const certificate = remember('certificate', await content.certificate.create({ title: 'TEST ONLY document', mediaId: media.id, isVerified: true }));
    await content.certificate.publish(certificate.id);
    assert.equal((await get('/profile')).body.data.portrait, null);
    assert.deepEqual((await get('/projects/test-only-project')).body.data.media, []);
    assert.equal((await get('/certifications')).body.data.find(r => r.id === certificate.id).media, null);
    await privateContent.approveMedia(media.id, 'https://example.invalid/test.webp');
    const response = await get('/projects/test-only-project');
    assert.equal(response.body.data.media.length, 1);
    assert.doesNotMatch(JSON.stringify(response), /storageKey|fileName|private\/|approved/);
    assert.ok((await get('/profile')).body.data.portrait);
    await privateContent.revokeMedia(media.id);
    assert.equal((await get('/profile')).body.data.portrait, null);
    await assert.rejects(() => content.project.remove(project.id), { code: 'P2003' });
    await assert.rejects(() => privateContent.createMedia({ fileName: 'test.webp', storageKey: 'test/missing.webp', mimeType: 'image/webp', bytes: 1, projectId: 'missing' }), { code: 'P2003' });
  });
  await t.test('achievements linked to private projects cannot reveal their titles', async () => {
    const row = remember('achievement', await content.achievement.create({ title: 'TEST ONLY linked achievement', projectId: project.id, isVerified: true }));
    await content.achievement.publish(row.id);
    assert.ok((await get('/achievements')).body.data.some(r => r.id === row.id));
    await content.project.unpublish(project.id);
    assert.equal((await get('/achievements')).body.data.some(r => r.id === row.id), false);
  });
  await t.test('private contact consent is explicit and edits revoke it', async () => {
    await content.profile.update('owner', { email: 'private@example.invalid', phone: 'PRIVATE PHONE' });
    await content.profile.publish('owner');
    assert.equal((await get('/profile')).body.data.contact, null);
    await privateContent.approveContact();
    assert.equal((await get('/profile')).body.data.contact.email, 'private@example.invalid');
    await content.profile.update('owner', { email: 'changed@example.invalid' });
    await content.profile.publish('owner');
    assert.equal((await get('/profile')).body.data.contact, null);
  });
  await t.test('private messages, settings and audit relationships stay inaccessible', async () => {
    const message = remember('contactMessage', await privateContent.createMessage({ senderName: 'TEST ONLY', senderEmail: 'test@example.invalid', content: 'PRIVATE MESSAGE SENTINEL' }));
    assert.ok(message.expiresAt); await privateContent.setMessageStatus(message.id, 'READ');
    assert.equal((await privateContent.listMessages())[0].status, 'READ');
    await privateContent.deleteMessage(message.id);
    assert.equal(await db.contactMessage.count(), 0);
    await privateContent.saveSettings({ siteTitle: 'TEST ONLY site' });
    const actor = remember('user', await db.user.create({ data: { email: 'test-only@example.invalid', displayName: 'TEST ONLY', passwordHash: 'DISABLED-TEST-RECORD-NOT-A-PASSWORD', isActive: false } }));
    const audit = remember('auditLog', await db.auditLog.create({ data: { actorId: actor.id, action: 'TEST_ONLY' } }));
    await db.user.delete({ where: { id: actor.id } });
    assert.equal((await db.auditLog.findUnique({ where: { id: audit.id } })).actorId, null);
    for (const path of ['/users', '/messages', '/contact', '/audit-logs', '/settings', '/media', '/admin/projects']) assert.equal((await get(path)).status, 404);
  });
  await t.test('no unauthenticated mutations, validation rejects unwanted queries', async () => {
    for (const method of ['POST','PUT','PATCH','DELETE']) {
      const response = await fetch(base + '/projects', { method, headers: { 'Content-Type': 'application/json', 'X-Role': 'SUPER_ADMIN' }, body: '{}' });
      assert.equal(response.status, 404); await response.arrayBuffer();
    }
    for (const path of ['/skills?status=DRAFT','/projects?limit=999','/education?page=0','/experience?sort=title','/profile?include=users','/projects/BAD_slug','/skills?page=1&page=2']) {
      const result = await get(path); assert.equal(result.status, 400); assert.equal(result.body.error.code, 'VALIDATION_ERROR');
    }
  });
  await t.test('transactions rollback, reordering is atomic, delete works and DB singleton checks apply', async () => {
    await assert.rejects(() => db.$transaction(async tx => {
      await tx.skill.create({ data: { id: 'test-rollback', name: 'TEST ONLY rollback' } });
      throw new Error('intentional rollback');
    }));
    assert.equal(await db.skill.findUnique({ where: { id: 'test-rollback' } }), null);
    const before = await content.skill.read(skill.id);
    await assert.rejects(() => content.skill.reorder([{ id: skill.id, sortOrder: 1 }, { id: 'missing', sortOrder: 2 }]));
    assert.equal((await content.skill.read(skill.id)).sortOrder, before.sortOrder);
    await content.skill.reorder([{ id: skill.id, sortOrder: 3 }]);
    assert.equal((await content.skill.read(skill.id)).sortOrder, 3);
    await content.skill.remove(skill.id); assert.equal(await db.skill.findUnique({ where: { id: skill.id } }), null);
    await assert.rejects(() => db.profile.create({ data: { id: 'another-owner', fullName: 'TEST ONLY', professionalTitle: 'TEST ONLY' } }));
    await assert.rejects(() => db.siteSettings.create({ data: { id: 'another-site', siteTitle: 'TEST ONLY' } }));
  });
});
