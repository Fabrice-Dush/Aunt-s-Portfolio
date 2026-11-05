import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { SignJWT } from 'jose';
import { hashPassword, verifyPassword } from '../src/services/password.service.ts';
import { issueTokens, verifyToken } from '../src/services/token.service.ts';
import { issuer, audience, signingKey } from '../src/config/auth.ts';
import { password, createAdminInput } from '../src/validators/auth.ts';
import { cookieOptions } from '../src/middlewares/auth.ts';
import { env } from '../src/config/env.ts';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
process.env.JWT_SECRET = randomBytes(64).toString('hex');

test('Argon2id salts and verifies passwords without storing plaintext', async () => {
  const value = randomBytes(24).toString('base64url');
  const first = await hashPassword(value), second = await hashPassword(value);
  assert.match(first, /^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
  assert.notEqual(first, second); assert.ok(!first.includes(value));
  assert.equal(await verifyPassword(first, value), true);
  assert.equal(await verifyPassword(first, value + 'wrong'), false);
  assert.equal(await verifyPassword('invalid-hash', value), false);
});
test('password policy and strict account input reject weak credentials and role injection', () => {
  for (const value of ['short', 'password1234567890', 'aaaaaaaaaaaaaaaaaaaa', 'abc'.repeat(50)]) assert.equal(password.safeParse(value).success, false);
  assert.equal(createAdminInput.safeParse({ email: 'owner@example.invalid', displayName: 'TEST ONLY', temporaryPassword: randomBytes(24).toString('hex'), currentPassword: 'x', role: 'SUPER_ADMIN' }).success, false);
});
test('JWT requires purpose, signature, issuer, audience, expiry and allowed algorithm', async () => {
  const tokens = await issueTokens('test-user', 'test-session', new Date(Date.now() + 60000));
  assert.deepEqual(await verifyToken(tokens.access, 'access'), { userId: 'test-user', sessionId: 'test-session' });
  await assert.rejects(() => verifyToken(tokens.refresh, 'access'), { status: 401 });
  for (const value of [undefined, 'broken', tokens.access.slice(0, -8) + 'tampered']) await assert.rejects(() => verifyToken(value, 'access'), { status: 401 });
  const make = (options = {}) => new SignJWT({ purpose: options.purpose ?? 'access', sid: 'test-session' }).setProtectedHeader({ alg: options.alg ?? 'HS256', typ: 'JWT' }).setSubject('test-user').setJti('test-jti').setIssuedAt().setIssuer(options.issuer ?? issuer).setAudience(options.audience ?? audience).setExpirationTime(options.exp ?? '5m').sign(signingKey());
  for (const options of [{ issuer: 'wrong' }, { audience: 'wrong' }, { exp: 1 }, { alg: 'HS384' }, { purpose: 'refresh' }]) await assert.rejects(() => make(options).then(t => verifyToken(t, 'access')), { status: 401 });
  const unsigned = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url') + '.' + Buffer.from('{}').toString('base64url') + '.';
  await assert.rejects(() => verifyToken(unsigned, 'access'), { status: 401 });
});
test('missing and weak signing configuration fail closed', async () => {
  const key = process.env.JWT_SECRET;
  for (const value of ['', 'change-me']) { process.env.JWT_SECRET = value; await assert.rejects(() => verifyToken('anything', 'access'), { status: 503 }); }
  process.env.JWT_SECRET = key;
});

test('production cookies are Secure, HttpOnly, Strict and host scoped', () => {
  const previous = env.NODE_ENV; env.NODE_ENV = 'production';
  assert.deepEqual(cookieOptions('/api/v1/auth'), { secure: true, httpOnly: true, sameSite: 'strict', path: '/api/v1/auth' });
  env.NODE_ENV = 'development'; assert.equal(cookieOptions('/api/v1').secure, false);
  env.NODE_ENV = previous;
});

test('bootstrap refuses noninteractive credential input', () => {
  const result = spawnSync(process.execPath, ['--import', 'tsx', fileURLToPath(new URL('../scripts/provision.ts', import.meta.url)), 'bootstrap'], { input: '', encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Account operation did not complete/);
  assert.doesNotMatch(result.stdout + result.stderr, /mysql:\/\/|passwordHash|JWT_SECRET=/);
});
