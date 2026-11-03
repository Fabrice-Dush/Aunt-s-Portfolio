import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';

// Isolate tests from the developer's .env and any running development server.
process.env.NODE_ENV = 'production';
process.env.FRONTEND_ORIGIN = 'http://localhost:5173';
const { app } = await import('../src/app.ts');

test('API foundation over real HTTP', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${server.address().port}`;

  await t.test('health, security headers and API metadata', async () => {
    const response = await fetch(`${base}/api/v1/health`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'seraphine-portfolio-api');
    assert.ok(Number.isFinite(Date.parse(body.timestamp)));
    assert.equal('database' in body, false);
    assert.equal(response.headers.get('x-powered-by'), null);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.ok(response.headers.get('content-security-policy'));
    const metadata = await fetch(`${base}/api/v1`);
    assert.equal(metadata.status, 200);
    assert.deepEqual(await metadata.json(), {
      service: 'seraphine-portfolio-api', version: 'v1',
      message: 'API foundation. Content routes are planned for Phase 5.',
    });
  });

  await t.test('CORS allows the configured browser origin only', async () => {
    for (const origin of ['http://localhost:5173', 'https://untrusted.example']) {
      const response = await fetch(`${base}/api/v1/health`, { headers: { Origin: origin } });
      assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173');
      assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
      await response.arrayBuffer();
    }
    const preflight = await fetch(`${base}/api/v1/health`, {
      method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'GET' },
    });
    assert.equal(preflight.status, 204);
  });

  await t.test('unknown routes return safe JSON 404', async () => {
    const response = await fetch(`${base}/missing`);
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  await t.test('malformed JSON returns 400 without reflecting input', async () => {
    const response = await fetch(`${base}/api/v1/health`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"private-input":',
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' } });
  });

  await t.test('oversized JSON returns 413', async () => {
    const response = await fetch(`${base}/api/v1/health`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: 'x'.repeat(110_000) }),
    });
    assert.equal(response.status, 413);
    assert.equal((await response.json()).error.code, 'PAYLOAD_TOO_LARGE');
  });

  await t.test('unexpected errors hide internal details', async () => {
    const { errorHandler } = await import('../src/middlewares/errorHandler.ts');
    const { default: express } = await import('express');
    const failureApp = express();
    failureApp.get('/', () => { throw new Error('private internal detail'); });
    failureApp.use(errorHandler);
    const failureServer = failureApp.listen(0, '127.0.0.1');
    await once(failureServer, 'listening');
    try {
      const response = await fetch(`http://127.0.0.1:${failureServer.address().port}`);
      assert.equal(response.status, 500);
      assert.deepEqual(await response.json(), { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
    } finally {
      await new Promise(resolve => failureServer.close(resolve));
    }
  });

  await t.test('rate limit returns 429 and retry information', async () => {
    let response;
    for (let i = 0; i < 121; i++) {
      response = await fetch(`${base}/api/v1/health`);
      await response.arrayBuffer();
      if (response.status === 429) break;
      assert.equal(response.status, 200);
    }
    assert.equal(response.status, 429);
    assert.ok(response.headers.get('retry-after'));
    assert.ok(response.headers.get('ratelimit'));
  });
});
