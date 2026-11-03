import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contentSchemas, paginationSchema, slugSchema, contactSchema, mediaSchema, publicMediaUrlSchema, reorderSchema } from '../src/validators/content.ts';
import { validatePeriod, requireVerified } from '../src/services/publication.ts';
import { databaseOptions } from '../src/config/database.ts';
import { portfolioService } from '../src/services/portfolio.service.ts';
import { errorHandler } from '../src/middlewares/errorHandler.ts';
import { AppError } from '../src/utils/AppError.ts';
import { Prisma } from '../src/generated/prisma/client.ts';

test('strict content validation blocks mass assignment and invalid fields', () => {
  assert.throws(() => contentSchemas.project.parse({ title: 'Test', slug: 'test', status: 'PUBLISHED' }));
  assert.throws(() => contentSchemas.profile.parse({ fullName: 'Test', professionalTitle: 'Engineer', showPublicContact: true }));
  assert.throws(() => contentSchemas.skill.parse({ name: ' ', isVerified: true }));
  assert.throws(() => contentSchemas.education.parse({ qualification: 'Test', institution: 'Test', yearCompleted: 1800 }));
  assert.throws(() => contentSchemas.project.parse({ title: 'x'.repeat(221), slug: 'test' }));
  assert.throws(() => contactSchema.parse({ senderName: 'Test', senderEmail: 'invalid', content: 'Test' }));
  assert.throws(() => contactSchema.parse({ senderName: 'Test', senderEmail: 'test@example.invalid', content: 'Test', status: 'READ' }));
  assert.equal(contentSchemas.certificate.parse({ title: 'Training' }).issuer, undefined);
});
test('slugs and bounded deterministic pagination reject malformed and repeated query values', () => {
  assert.deepEqual(paginationSchema.parse({}), { page: 1, limit: 20, sort: 'asc' });
  for (const query of [{ page: '0' }, { limit: '51' }, { page: '-1' }, { page: '1.2' }, { page: ['1','2'] }, { status: 'DRAFT' }, { sort: 'title' }]) {
    assert.throws(() => paginationSchema.parse(query));
  }
  for (const slug of ['UPPER', '../private', 'bad_slug', 'bad--slug', '']) assert.throws(() => slugSchema.parse(slug));
  assert.equal(slugSchema.parse('water-quality'), 'water-quality');
});
test('publication and partial-year business rules do not invent dates', () => {
  validatePeriod({ startYear: null, endYear: null });
  validatePeriod({ startYear: 2022, isCurrent: true });
  assert.throws(() => validatePeriod({ startYear: 2022, endYear: 2021 }));
  assert.throws(() => validatePeriod({ isCurrent: true, endYear: 2024 }));
  assert.throws(() => requireVerified({ isVerified: false }));
  requireVerified({ isVerified: true });
  assert.throws(() => reorderSchema.parse([{ id: 'a', sortOrder: 0 }, { id: 'a', sortOrder: 1 }]));
});
test('media approval rejects unsafe URLs and metadata', () => {
  for (const url of ['javascript:alert(1)', 'http://example.invalid/a', 'https://u:p@example.invalid/a', 'https://example.invalid/a?token=private']) assert.throws(() => publicMediaUrlSchema.parse(url));
  assert.throws(() => mediaSchema.parse({ fileName: 'x', storageKey: '../private.pdf', mimeType: 'application/pdf', bytes: 1 }));
  assert.equal(publicMediaUrlSchema.parse('https://example.invalid/photo.webp'), 'https://example.invalid/photo.webp');
});
test('database URL credentials are decoded and invalid configuration stays private', () => {
  const options = databaseOptions('mysql://local:p%40ss%3Aword@127.0.0.1:3306/test');
  assert.equal(options.password, 'p@ss:word');
  for (const value of ['bad-secret', 'postgres://u:p@localhost/db', 'mysql://u:p@localhost/db?unknown=x']) {
    assert.throws(() => databaseOptions(value), { message: 'Invalid database configuration' });
  }
});
test('public service selects explicit fields and requires publication and verification', async () => {
  let query;
  const db = { skill: { findMany: async args => { query = args; return [{ id: 'a' }, { id: 'b' }]; } } };
  const result = await portfolioService(db).list('skills', { page: 2, limit: 1, sort: 'asc' });
  assert.deepEqual(query.where, { status: 'PUBLISHED', isVerified: true });
  assert.deepEqual(query.orderBy, [{ sortOrder: 'asc' }, { id: 'asc' }]);
  assert.equal(query.skip, 1);
  assert.equal(query.select.status, undefined);
  assert.equal(result.pagination.hasMore, true);
  assert.equal(result.data.length, 1);
});
test('profile DTO omits private contacts and unapproved portrait fields', async () => {
  const db = { profile: { findFirst: async () => ({ fullName: 'Test', email: 'private@example.invalid', phone: 'private',
    showPublicContact: true, contactApprovedAt: null, portrait: { approved: false, publicUrl: 'https://example.invalid/private' } }) } };
  const result = await portfolioService(db).profile();
  assert.deepEqual(result, { fullName: 'Test', contact: null, portrait: null });
  await assert.rejects(() => portfolioService({ project: { findFirst: async () => null } }).project('missing'), { status: 404 });
});
test('central error responses map conflicts, auth boundaries and failures without raw details', () => {
  for (const [error, status, code] of [
    [new AppError(401, 'UNAUTHORIZED', 'Authentication required'), 401, 'UNAUTHORIZED'],
    [new AppError(403, 'FORBIDDEN', 'Access denied'), 403, 'FORBIDDEN'],
    [new Prisma.PrismaClientKnownRequestError('private SQL', { code: 'P2002', clientVersion: '7.10.0' }), 409, 'CONFLICT'],
    [new Prisma.PrismaClientKnownRequestError('private SQL', { code: 'P2003', clientVersion: '7.10.0' }), 409, 'RELATION_CONFLICT'],
    [new Prisma.PrismaClientKnownRequestError('private SQL', { code: 'P2025', clientVersion: '7.10.0' }), 404, 'NOT_FOUND'],
    [new Prisma.PrismaClientKnownRequestError('private SQL', { code: 'P2024', clientVersion: '7.10.0' }), 503, 'SERVICE_UNAVAILABLE'],
  ]) {
    let received;
    errorHandler(error, {}, { status(value) { assert.equal(value, status); return this; }, json(value) { received = value; } }, () => {});
    assert.equal(received.error.code, code);
    assert.doesNotMatch(JSON.stringify(received), /private SQL/);
  }
});
