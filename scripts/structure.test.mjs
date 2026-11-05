import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const get = (path) => readFileSync(join(root, path), 'utf8');

test('required frontend, API, database and handoff files exist', () => {
  for (const file of [
    'frontend/src/main.tsx', 'frontend/src/app/App.tsx', 'frontend/vite.config.ts',
    'frontend/src/features/portfolio/pages/HomePage.tsx',
    'frontend/src/shared/styles/global.css',
    'backend/src/app.ts', 'backend/src/server.ts', 'backend/prisma/schema.prisma',
    'backend/src/routes/index.ts', 'backend/src/routes/health.routes.ts',
    'backend/src/controllers/health.controller.ts', 'backend/src/controllers/api.controller.ts',
    'backend/src/middlewares/errorHandler.ts', 'backend/src/middlewares/notFound.ts',
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
  const profile = get('backend/src/services/cms.service.ts');
  assert.match(profile, /Nyirarukundo Seraphine/);
  assert.match(profile, /Water Treatment Plant Engineer/);
  assert.doesNotMatch(profile, /Environmental Engineer/);
  const hero = get('frontend/src/features/portfolio/components/Hero.tsx');
  assert.match(hero, /id="hero-title"/);
  assert.match(hero, /Seraphine/);
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
  // A developer's ignored local .env is expected by the setup instructions.
  // Archive exclusion is verified by the packaging script, not by forbidding it here.
  assert.match(get('.gitignore'), /!\.env\.example/);
});

test('API composition keeps middleware and delegates routes to controllers', () => {
  const app = get('backend/src/app.ts');
  assert.match(app, /app\.use\('\/api\/v1', apiRouter\)/);
  assert.doesNotMatch(app, /app\.(get|post|put|patch|delete)\(/);
  assert.match(app, /helmet\(/);
  assert.match(app, /rateLimit\(/);
  const routes = get('backend/src/routes/index.ts') + get('backend/src/routes/health.routes.ts');
  assert.match(routes, /apiRouter\.use\('\/health', healthRouter\)/);
  assert.match(routes, /healthRouter\.get\('\/', getHealth\)/);
  assert.match(routes, /controllers\/health\.controller\.js/);
  assert.doesNotMatch(routes, /\.json\(|PrismaClient/);
});
