import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import { getDatabase, disconnectDatabase, databaseOptions } from '../../src/config/database.ts';
import { accountsService } from '../../src/services/accounts.service.ts';
import { authService } from '../../src/services/auth.service.ts';
import { issueTokens } from '../../src/services/token.service.ts';
import { hashPassword } from '../../src/services/password.service.ts';
import { app } from '../../src/app.ts';

const options = databaseOptions(process.env.DATABASE_URL);
assert.equal(options.database, 'seraphine_portfolio_test'); assert.equal(options.user, 'seraphine_test');
assert.ok(['127.0.0.1','localhost'].includes(options.host));
const db = getDatabase(), accounts = accountsService(db), auth = authService(db);
const secret = () => randomBytes(24).toString('base64url');

test('real authentication, authorization and session acceptance on isolated MariaDB', async t => {
  const userIds = new Set(), auditIds = new Set(), sessionIds = new Set(), projectIds = new Set(), messageIds = new Set();
  const own = user => { userIds.add(user.id); return user; };
  for (const model of ['user','authSession','auditLog','profile','experience','education','skill','project','achievement','certificate','mediaAsset','contactMessage','siteSettings']) {
    assert.equal(await db[model].count(), 0, `Refusing nonempty test database: ${model}`);
  }
  const capture = async () => {
    for (const row of await db.authSession.findMany({ where: { userId: { in: [...userIds] } }, select: { id: true } })) sessionIds.add(row.id);
    // This suite owns its initially empty, exclusive test DB; capture actual returned IDs.
    for (const row of await db.auditLog.findMany({ select: { id: true } })) auditIds.add(row.id);
  };
  t.after(async () => {
    await capture();
    await db.auditLog.deleteMany({ where: { id: { in: [...auditIds] } } });
    await db.authSession.deleteMany({ where: { id: { in: [...sessionIds] } } });
    await db.project.deleteMany({ where: { id: { in: [...projectIds] } } });
    await db.contactMessage.deleteMany({ where: { id: { in: [...messageIds] } } });
    await db.user.deleteMany({ where: { id: { in: [...userIds] } } });
    await disconnectDatabase();
  });
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  const request = async (path, { method = 'GET', body, token, refresh, origin = 'http://localhost:5173', header = '1' } = {}) => {
    const res = await fetch(base + path, { method, headers: { Origin: origin, 'X-Portfolio-Request': header, ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), Cookie: [token && `sp_access=${token}`, refresh && `sp_refresh=${refresh}`].filter(Boolean).join('; ') }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    const text = await res.text(); const result = { status: res.status, body: text ? JSON.parse(text) : null, cookies: res.headers.getSetCookie(), headers: res.headers };
    await capture(); return result;
  };
  const login = (user, password) => auth.login(user.email, password);
  const identity = async tokens => (await auth.authenticate(tokens.access, true)).identity;
  const maintainerPassword = secret(); let adminPassword = secret(); let maintainer, admin, other, privileged, regular;

  await t.test('one-time bootstrap creates only authorized maintainer and rejects duplicates', async () => {
    maintainer = own(await accounts.bootstrap({ email: 'maintainer-test@example.invalid', displayName: 'TEST ONLY maintainer', password: maintainerPassword }));
    assert.equal(maintainer.role, 'SUPER_ADMIN'); assert.equal('passwordHash' in maintainer, false);
    await assert.rejects(() => accounts.bootstrap({ email: 'duplicate@example.invalid', displayName: 'TEST ONLY', password: secret() }), { code: 'ALREADY_PROVISIONED' });
    privileged = (await login(maintainer, maintainerPassword)).tokens;
  });
  await t.test('guest and forged role headers cannot read protected data or create accounts', async () => {
    for (const path of ['/auth/me','/auth/sessions','/dashboard/summary','/dashboard/content/messages','/dashboard/security','/dashboard/status','/administrators']) assert.equal((await request(path)).status, 401);
    assert.equal((await request('/administrators', { method: 'POST', body: {} })).status, 401);
    assert.equal((await request('/auth/register', { method: 'POST', body: {} })).status, 401);
    const res = await fetch(base + '/dashboard/summary', { headers: { 'X-Role': 'SUPER_ADMIN', Authorization: 'Bearer invented' } }); assert.equal(res.status, 401); await res.text();
  });
  await t.test('trusted origin and preflight header required even for login, logout and refresh', async () => {
    for (const path of ['/auth/login','/auth/logout','/auth/refresh','/auth/change-password','/administrators']) {
      assert.equal((await request(path, { method: 'POST', body: {}, origin: 'https://untrusted.invalid', token: privileged.access })).status, 403);
      assert.equal((await request(path, { method: 'POST', body: {}, origin: '', token: privileged.access })).status, 403);
      assert.equal((await request(path, { method: 'POST', body: {}, header: '', token: privileged.access })).status, 403);
    }
  });
  await t.test('regular ADMIN provisioning is authenticated, reauthenticated, allowlisted and audited', async () => {
    const input = { email: 'owner-test@example.invalid', displayName: 'TEST ONLY owner', temporaryPassword: adminPassword, currentPassword: maintainerPassword };
    assert.equal((await request('/administrators', { method: 'POST', token: privileged.access, body: { ...input, role: 'SUPER_ADMIN' } })).status, 400);
    assert.equal((await request('/administrators', { method: 'POST', token: privileged.access, body: { ...input, currentPassword: 'wrong' } })).status, 401);
    const result = await request('/administrators', { method: 'POST', token: privileged.access, body: input });
    assert.equal(result.status, 201); admin = own(result.body.data); assert.equal(admin.role, 'ADMIN'); assert.equal(admin.mustChangePassword, true);
    assert.equal((await request('/administrators', { method: 'POST', token: privileged.access, body: input })).status, 409);
  });
  await t.test('login validates input, generic credential failures, safe DTO and scoped HttpOnly cookies', async () => {
    const invalid = await request('/auth/login', { method: 'POST', body: { email: admin.email, password: 'wrong' } });
    const unknown = await request('/auth/login', { method: 'POST', body: { email: 'unknown@example.invalid', password: 'wrong' } });
    assert.equal(invalid.status, 401); assert.deepEqual(invalid.body, unknown.body);
    assert.equal((await request('/auth/login', { method: 'POST', body: {} })).status, 400);
    const result = await request('/auth/login', { method: 'POST', body: { email: admin.email, password: adminPassword } });
    assert.equal(result.status, 200); assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.equal(result.cookies.length, 2);
    assert.ok(result.cookies.every(cookie => cookie.includes('HttpOnly') && cookie.includes('SameSite=Strict') && !cookie.includes('Domain=')));
    assert.ok(result.cookies[0].includes('Path=/api/v1;')); assert.ok(result.cookies[1].includes('Path=/api/v1/auth;'));
    assert.doesNotMatch(JSON.stringify(result.body), /passwordHash|refreshHash|bootstrapSlot|tokens/);
    regular = (await login(admin, adminPassword)).tokens;
  });
  await t.test('temporary credentials permit only account/session operations until password replacement', async () => {
    assert.equal((await request('/auth/me', { token: regular.access })).status, 200);
    assert.equal((await request('/dashboard/summary', { token: regular.access })).body.error.code, 'PASSWORD_CHANGE_REQUIRED');
    assert.equal((await request('/auth/change-password', { method: 'POST', token: regular.access, body: { currentPassword: 'wrong', newPassword: secret() } })).status, 401);
    const nextPassword = secret();
    assert.equal((await request('/auth/change-password', { method: 'POST', token: regular.access, body: { currentPassword: adminPassword, newPassword: nextPassword } })).status, 204);
    assert.equal((await request('/auth/me', { token: regular.access })).status, 401);
    await assert.rejects(() => auth.refresh(regular.refresh), { status: 401 });
    adminPassword = nextPassword; regular = (await login(admin, adminPassword)).tokens;
  });
  await t.test('ADMIN reads authorized portfolio areas but all technical endpoints deny access', async () => {
    for (const path of ['/dashboard/summary', ...['profile','experience','education','skills','projects','achievements','certifications','messages'].map(x => '/dashboard/content/' + x)]) assert.equal((await request(path, { token: regular.access })).status, 200);
    for (const path of ['/administrators','/dashboard/security','/dashboard/status']) assert.equal((await request(path, { token: regular.access })).status, 403);
    assert.equal((await request('/administrators/' + maintainer.id, { method: 'PATCH', token: regular.access, body: { isActive: false, currentPassword: adminPassword } })).status, 403);
    assert.equal((await request('/administrators/' + maintainer.id, { method: 'PATCH', token: privileged.access, body: { isActive: false, currentPassword: maintainerPassword } })).status, 404);
    assert.equal((await request('/administrators/' + maintainer.id + '/recovery', { method: 'POST', token: privileged.access, body: { temporaryPassword: secret(), currentPassword: maintainerPassword } })).status, 404);
    const summary = await request('/dashboard/summary', { token: privileged.access }); assert.equal(summary.body.data.activeAdmins, 1); assert.equal(summary.body.data.draftProjects, 0);
    assert.equal((await request('/dashboard/status', { token: privileged.access })).body.data.database, 'Connected');
  });
  await t.test('tampered, expired, wrong-purpose tokens and forged session identity are rejected', async () => {
    const expired = await issueTokens(admin.id, 'absent-session', new Date(Date.now() - 1000));
    const missing = await issueTokens(admin.id, 'absent-session', new Date(Date.now() + 60000));
    const differentUser = await issueTokens(maintainer.id, (await identity(regular)).sessionId, new Date(Date.now() + 60000));
    for (const token of ['invalid', regular.access.slice(0, -8) + 'tampered', regular.refresh, expired.access, missing.access, differentUser.access]) assert.equal((await request('/auth/me', { token })).status, 401);
  });
  await t.test('real draft summaries and private stored messages are available only to authenticated roles', async () => {
    const project = await db.project.create({ data: { title: 'TEST ONLY PRIVATE DRAFT', slug: 'test-only-private-draft' } }); projectIds.add(project.id);
    const message = await db.contactMessage.create({ data: { senderName: 'TEST ONLY sender', senderEmail: 'sender-test@example.invalid', content: 'TEST ONLY PRIVATE MESSAGE' } }); messageIds.add(message.id);
    assert.equal((await request('/dashboard/summary', { token: regular.access })).body.data.draftProjects, 1);
    assert.equal((await request('/dashboard/content/projects', { token: regular.access })).body.data[0].title, project.title);
    assert.equal((await request('/dashboard/content/messages', { token: privileged.access })).body.data[0].content, message.content);
    assert.equal((await request('/dashboard/content/messages')).status, 401);
    assert.equal((await request('/projects/test-only-private-draft')).status, 404);
    assert.equal((await request('/dashboard/content/projects?include=passwordHash', { token: regular.access })).status, 400);
  });
  await t.test('refresh rotates, preserves absolute expiry, and replay revokes the session', async () => {
    const original = (await login(admin, adminPassword)).tokens;
    const rotated = await auth.refresh(original.refresh); assert.notEqual(rotated.refresh, original.refresh); assert.equal(rotated.expiresAt.getTime(), original.expiresAt.getTime());
    assert.equal((await request('/auth/me', { token: rotated.access })).status, 200);
    await assert.rejects(() => auth.refresh(original.refresh), { status: 401 });
    assert.equal((await request('/auth/me', { token: rotated.access })).status, 401);
    await assert.rejects(() => auth.refresh(rotated.refresh), { status: 401 });
    const fresh = (await login(admin, adminPassword)).tokens;
    assert.equal((await request('/auth/refresh', { method: 'POST', refresh: fresh.refresh, body: {} })).status, 204);
  });
  await t.test('concurrent refresh cannot both succeed and replay revocation remains committed', async () => {
    const original = (await login(admin, adminPassword)).tokens;
    const results = await Promise.allSettled([auth.refresh(original.refresh), auth.refresh(original.refresh)]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
    assert.ok((await db.authSession.findUnique({ where: { id: (await import('jose')).decodeJwt(original.access).sid } })).revokedAt);
  });
  await t.test('own-session revocation cannot target another account, and logout revokes immediately', async () => {
    const ownIdentity = await identity(regular), privilegedIdentity = await identity(privileged);
    assert.equal((await request('/auth/sessions/' + privilegedIdentity.sessionId, { method: 'DELETE', token: regular.access })).status, 404);
    const list = await request('/auth/sessions', { token: regular.access }); assert.equal(list.status, 200); assert.ok(list.body.data.some(row => row.id === ownIdentity.sessionId));
    assert.doesNotMatch(JSON.stringify(list.body), /refreshHash|refreshToken|passwordHash/);
    assert.equal((await request('/auth/sessions/' + ownIdentity.sessionId, { method: 'DELETE', token: regular.access })).status, 204);
    assert.equal((await request('/auth/me', { token: regular.access })).status, 401);
    regular = (await login(admin, adminPassword)).tokens;
    assert.equal((await request('/auth/logout', { method: 'POST', refresh: regular.refresh, body: {} })).status, 204);
    assert.equal((await request('/auth/me', { token: regular.access })).status, 401);
    await assert.rejects(() => auth.refresh(regular.refresh), { status: 401 });
  });
  await t.test('disabled accounts immediately lose access, cannot login or refresh, and reactivate without old sessions', async () => {
    regular = (await login(admin, adminPassword)).tokens;
    const actor = await identity(privileged);
    await accounts.manage(actor, admin.id, 'status', maintainerPassword, false);
    assert.equal((await request('/auth/me', { token: regular.access })).status, 401);
    await assert.rejects(() => auth.refresh(regular.refresh), { status: 401 });
    await assert.rejects(() => login(admin, adminPassword), { code: 'INVALID_CREDENTIALS' });
    await accounts.manage(actor, admin.id, 'status', maintainerPassword, true);
    assert.equal((await request('/auth/me', { token: regular.access })).status, 401);
    regular = (await login(admin, adminPassword)).tokens;
  });
  await t.test('manual ADMIN recovery revokes sessions and forces a new personal password', async () => {
    const temporary = secret();
    const result = await request('/administrators/' + admin.id + '/recovery', { method: 'POST', token: privileged.access, body: { temporaryPassword: temporary, currentPassword: maintainerPassword } });
    assert.equal(result.status, 200); assert.equal(result.body.data.mustChangePassword, true);
    assert.equal((await request('/auth/me', { token: regular.access })).status, 401);
    await assert.rejects(() => login(admin, adminPassword), { status: 401 });
    regular = (await login(admin, temporary)).tokens;
    const replacement = secret(); await auth.changePassword(await identity(regular), temporary, replacement); adminPassword = replacement;
    regular = (await login(admin, adminPassword)).tokens;
  });
  await t.test('session expiry is enforced by database even when JWT is still valid', async () => {
    const tokens = (await login(admin, adminPassword)).tokens; const current = await identity(tokens);
    await db.authSession.update({ where: { id: current.sessionId }, data: { expiresAt: new Date(Date.now() - 1000) } });
    assert.equal((await request('/auth/me', { token: tokens.access })).status, 401);
    await assert.rejects(() => auth.refresh(tokens.refresh), { status: 401 });
  });
  await t.test('current database role overrides token history and local emergency recovery is audited', async () => {
    other = own(await db.user.create({ data: { email: 'other-test@example.invalid', displayName: 'TEST ONLY other', passwordHash: await hashPassword(secret()), role: 'SUPER_ADMIN' } }));
    await db.user.update({ where: { id: maintainer.id }, data: { role: 'ADMIN' } });
    assert.equal((await request('/administrators', { token: privileged.access })).status, 403);
    await db.user.update({ where: { id: maintainer.id }, data: { role: 'SUPER_ADMIN' } });
    await accounts.recoverMaintainer(maintainer.email, secret());
    assert.equal((await request('/auth/me', { token: privileged.access })).status, 401);
    assert.equal((await db.user.findUnique({ where: { id: maintainer.id } })).mustChangePassword, true);
  });
  await t.test('audit events are real and contain no credential or token material', async () => {
    const rows = await db.auditLog.findMany();
    for (const action of ['SUPER_ADMIN_BOOTSTRAPPED','LOGIN_SUCCEEDED','LOGIN_FAILED','ADMIN_CREATED','PASSWORD_CHANGED','REFRESH_REPLAY_REVOKED','SESSION_REVOKED','LOGOUT','ADMIN_DEACTIVATED','ADMIN_RECOVERY','LOCAL_SUPER_ADMIN_RECOVERY']) assert.ok(rows.some(row => row.action === action), action);
    const text = JSON.stringify(rows); assert.ok(!text.includes(maintainerPassword)); assert.ok(!text.includes(adminPassword)); assert.doesNotMatch(text, /passwordHash|refreshHash|eyJhbGci/);
  });
  await t.test('login limiter rejects repeated attempts with retry headers', async () => {
    let response;
    for (let i = 0; i < 12; i++) { response = await request('/auth/login', { method: 'POST', body: {} }); if (response.status === 429) break; }
    assert.equal(response.status, 429); assert.ok(response.headers.get('retry-after'));
    assert.equal((await request('/health')).status, 200);
  });
});
