import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, writeFile, unlink, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';

test('preview serves exactly the verified bytes and fails closed for altered, missing or stale publication files', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const cache = resolve(root, '.cache');
  await mkdir(cache, { recursive: true });
  const directory = await mkdtemp(resolve(cache, 'preview-review-'));
  let revision = 'verified-revision', available = true, fallthrough = 0, server;
  const api = createServer((_req, res) => {
    res.writeHead(available ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ revision }));
  });
  try {
    await new Promise(resolve => api.listen(0, '127.0.0.1', resolve));
    const page = '<!doctype html><title>Verified fixture</title><main>Approved content only</main>';
    const pagePath = resolve(directory, 'index.html');
    const receiptPath = resolve(directory, '.publication.json');
    await writeFile(pagePath, page);
    const receipt = JSON.stringify({ revision, htmlHash: createHash('sha256').update(page).digest('hex') });
    await writeFile(receiptPath, receipt);
    server = await preview({ root, build: { outDir: directory },
      preview: { host: '127.0.0.1', port: 0, strictPort: false, proxy: { '/api': { target: `http://127.0.0.1:${api.address().port}` } } },
      plugins: [{ name: 'detect-public-page-reread', configurePreviewServer(instance) {
        instance.middlewares.use((req, res, next) => {
          if (req.url === '/') { fallthrough++; res.end('UNVERIFIED SECOND READ'); } else next();
        });
      } }],
    });
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    let response = await fetch(origin);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), page);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(fallthrough, 0, 'Verified bytes must be sent without delegating to another file read');
    response = await fetch(origin, { method: 'HEAD' });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), '');
    assert.equal(Number(response.headers.get('content-length')), Buffer.byteLength(page));
    await writeFile(pagePath, page + 'altered');
    assert.equal((await fetch(origin)).status, 503);
    await unlink(pagePath);
    assert.equal((await fetch(origin)).status, 503);
    await writeFile(pagePath, page);
    await unlink(receiptPath);
    assert.equal((await fetch(origin)).status, 503);
    await writeFile(receiptPath, receipt);
    revision = 'changed-revision';
    assert.equal((await fetch(origin)).status, 503);
    revision = 'verified-revision'; available = false;
    assert.equal((await fetch(origin)).status, 503);
    assert.equal((await fetch(origin + '/unknown')).status, 404);
  } finally {
    if (server) await new Promise(resolve => server.httpServer.close(resolve));
    await new Promise(resolve => api.close(resolve));
    assert.ok(directory.startsWith(cache + '/') || directory.startsWith(cache + '\\'));
    await rm(directory, { recursive: true, force: true });
  }
});
