import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const get = (path) => readFileSync(join(root, path), 'utf8');

test('required frontend, API, database and handoff files exist', () => {
  for (const file of [
    'frontend/src/main.tsx', 'frontend/src/App.tsx', 'frontend/vite.config.ts',
    'backend/src/app.ts', 'backend/src/server.ts', 'backend/prisma/schema.prisma',
    'AGENTS.md', 'PROJECT_STATUS.md', 'DESIGN_SYSTEM.md', 'ARCHITECTURE.md', 'HANDOFF.md',
  ]) assert.ok(existsSync(join(root, file)), `${file} should exist`);
});

test('project role names are declared but no public GUEST account role', () => {
  const schema = get('backend/prisma/schema.prisma');
  assert.match(schema, /SUPER_ADMIN/);
  assert.match(schema, /ADMIN/);
  assert.doesNotMatch(schema, /\bGUEST\b/);
});

test('approved homepage uses the correct client identity', () => {
  const profile = get('frontend/src/data/profile.ts');
  assert.match(profile, /Nyirarukundo Seraphine/);
  assert.match(profile, /Water Treatment Plant Engineer/);
  assert.doesNotMatch(profile, /Environmental Engineer/);
  const app = get('frontend/src/App.tsx');
  assert.match(app, /id="hero-title"/);
  assert.match(app, /Seraphine/);
});

test('preview portrait assets exist and are lightweight WebP', () => {
  for (const file of ['frontend/public/images/seraphine-portrait.webp', 'frontend/public/images/seraphine-portrait-small.webp']) {
    assert.ok(existsSync(join(root, file)));
    assert.ok(statSync(join(root, file)).size < 250_000);
  }
});

test('secret files are ignored and sample env file is present', () => {
  assert.match(get('.gitignore'), /\*\*\/\.env/);
  assert.ok(existsSync(join(root, 'backend/.env.example')));
  assert.ok(!existsSync(join(root, 'backend/.env')));
});

test('only explicitly configured health endpoint is included', () => {
  const app = get('backend/src/app.ts');
  assert.match(app, /\/api\/v1\/health/);
  assert.match(app, /helmet\(/);
  assert.match(app, /rateLimit\(/);
});
