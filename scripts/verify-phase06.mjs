/** Compiled HTTP and private static-shell verification; not a browser test. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { preview } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const server = spawn(process.execPath, ['backend/dist/server.js'], { cwd: root, env: { ...process.env, PORT: '4406', NODE_ENV: 'production', FRONTEND_ORIGIN: 'https://portfolio.example.invalid' }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
const ended = once(server, 'exit'); let ready = false, frontend;
server.stdout.on('data', chunk => { if (chunk.toString().includes('Portfolio API available')) ready = true; });
server.stderr.on('data', () => {});
try {
  for (let attempt = 0; attempt < 100 && !ready && server.exitCode === null; attempt++) await delay(100);
  assert.ok(ready, 'Compiled API must start on free port 4406');
  for (const path of ['/auth/me','/auth/sessions','/administrators','/dashboard/summary','/dashboard/content/messages','/dashboard/security','/dashboard/status']) {
    const result = await fetch('http://127.0.0.1:4406/api/v1' + path);
    assert.equal(result.status, 401); assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.equal((await result.json()).error.code, 'UNAUTHENTICATED');
  }
  const rejected = await fetch('http://127.0.0.1:4406/api/v1/auth/login', { method: 'POST', headers: { Origin: 'https://foreign.example.invalid', 'Content-Type': 'application/json', 'X-Portfolio-Request': '1' }, body: '{}' });
  assert.equal(rejected.status, 403); assert.equal((await rejected.json()).error.code, 'CSRF_REJECTED');
  frontend = await preview({ root: resolve(root, 'frontend'), preview: { host: '127.0.0.1', port: 0, strictPort: false } });
  const origin = 'http://127.0.0.1:' + frontend.httpServer.address().port;
  for (const path of ['/login','/admin','/admin/account','/admin/projects','/super-admin','/super-admin/users','/super-admin/security']) {
    const result = await fetch(origin + path); assert.equal(result.status, 200);
    const html = await result.text(); assert.match(html, /<div id="root"><\/div>/); assert.match(html, /noindex,nofollow/);
    assert.doesNotMatch(html, /<main|passwordHash|refreshHash/);
    for (const asset of html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)) { const response = await fetch(origin + asset[1]); assert.equal(response.status, 200); await response.arrayBuffer(); }
  }
  console.log('Phase 6: seven compiled private endpoints deny guests with no-store; foreign-Origin mutation denied; seven direct production routes serve neutral shells and valid assets.');
} finally {
  if (frontend) await new Promise(resolve => frontend.httpServer.close(resolve));
  server.kill('SIGTERM');
  let timer;
  try { await Promise.race([ended, new Promise((_, reject) => { timer = setTimeout(() => { server.kill('SIGKILL'); reject(new Error('API shutdown exceeded deadline')); }, 12000); })]); }
  finally { clearTimeout(timer); }
}
