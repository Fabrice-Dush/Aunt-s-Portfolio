/** HTTP/module/asset checks only; this is not a browser interaction or visual test. */
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { createServer, preview } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const frontend = resolve(root, 'frontend');
let development, production, api;
try {
  development = await createServer({ root: frontend, server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false } });
  await development.listen();
  production = await preview({ root: frontend, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
  for (const [label, server] of [['development', development], ['production', production]]) {
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    const response = await fetch(origin);
    assert.equal(response.status, 200);
    const html = await response.text();
    const paths = new Set([...html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)].map(match => match[1]));
    for (const path of ['/images/seraphine-portrait.webp', '/images/seraphine-portrait-small.webp', '/favicon.svg']) paths.add(path);
    if (label === 'development') {
      for (const path of await readdir(resolve(frontend, 'src'), { recursive: true })) {
        if (/\.(tsx?|css)$/.test(path) && !path.endsWith('.d.ts')) paths.add(`/src/${path.replaceAll('\\', '/')}`);
      }
    } else {
      paths.add('/robots.txt');
      assert.match(html, /<main id="main-content"/);
      assert.match(html, /noindex, nofollow/);
    }
    for (const path of paths) {
      const asset = await fetch(`${origin}${path}`);
      assert.equal(asset.status, 200, `${label}: ${path}`);
      await asset.arrayBuffer();
    }
    console.log(`${label}: ${paths.size + 1} HTTP 200 page/module/asset requests passed.`);
  }
  // Use the real compiled server on an isolated port; no existing process is touched.
  api = spawn(process.execPath, [resolve(root, 'backend/dist/server.js')], {
    cwd: resolve(root, 'backend'), env: { ...process.env, PORT: '4402' }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
  });
  let started = false;
  let startup = '';
  api.stdout.on('data', chunk => { startup += chunk; if (startup.includes('Portfolio API available')) started = true; });
  api.on('error', error => { startup = error.message; });
  for (let attempt = 0; attempt < 50 && !started && api.exitCode === null; attempt++) await delay(100);
  assert.ok(started, 'Compiled API could not start on isolated port 4402');
  const url = 'http://127.0.0.1:4402/api/v1/health';
  for (const [body, status, error] of [[undefined, 200, undefined], ['{', 400, 'INVALID_JSON'],
    [JSON.stringify({ data: 'x'.repeat(110_000) }), 413, 'PAYLOAD_TOO_LARGE']]) {
    const response = await fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body } : {});
    assert.equal(response.status, status);
    const data = await response.json();
    if (error) assert.equal(data.error.code, error);
    else assert.equal(data.status, 'ok');
  }
  console.log('Compiled API: health 200, invalid JSON 400 and oversized JSON 413 passed.');
} finally {
  await development?.close();
  if (production) await new Promise(resolve => production.httpServer.close(resolve));
  if (api && api.exitCode === null) { api.kill(); await once(api, 'exit'); }
}
