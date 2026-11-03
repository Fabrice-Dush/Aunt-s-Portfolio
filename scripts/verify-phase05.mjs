import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const server = spawn(process.execPath, ['backend/dist/server.js'], {
  cwd: root, env: { ...process.env, PORT: '4405', NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'],
});
const ended = once(server, 'exit');
let ready = false;
server.stdout.on('data', data => { if (data.toString().includes('Portfolio API available')) ready = true; });
server.stderr.on('data', () => {}); // Never forward raw unexpected diagnostic content.
try {
  for (let attempt = 0; attempt < 100 && !ready && server.exitCode === null; attempt++) await delay(100);
  assert.ok(ready, 'Compiled API did not start; port 4405 must be free');
  for (const route of ['health', 'profile', 'experience', 'education', 'skills', 'projects', 'achievements', 'certifications']) {
    const response = await fetch(`http://127.0.0.1:4405/api/v1/${route}`);
    assert.equal(response.status, 200, route);
    const body = await response.json();
    if (route === 'profile') assert.equal(body.data.fullName, 'Nyirarukundo Seraphine');
    assert.doesNotMatch(JSON.stringify(body), /passwordHash|storageKey|senderEmail|contactApprovedAt/);
  }
  console.log('Compiled backend: eight live database/health endpoints passed from repository-root working directory.');
} finally {
  server.kill('SIGTERM');
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => { server.kill('SIGKILL'); reject(new Error('API shutdown exceeded deadline')); }, 12000);
  });
  try { await Promise.race([ended, timeout]); } finally { clearTimeout(timer); }
}
