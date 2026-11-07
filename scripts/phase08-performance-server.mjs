// Owned local lab helper; production serving behavior with a loopback-only listener.
import assert from 'node:assert/strict';
import { app } from '../backend/dist/app.js';
import { disconnectDatabase } from '../backend/dist/config/database.js';

assert.equal(process.env.NODE_ENV, 'production');
assert.equal(process.env.PORT, '4496');
const server = app.listen(4496, '127.0.0.1', () => console.log('Portfolio API available for local lab'));
let closing = false;
for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => {
  if (closing) return;
  closing = true;
  const deadline = setTimeout(() => process.exit(1), 10000).unref();
  server.close(async () => {
    try { await disconnectDatabase(); } catch { process.exitCode = 1; }
    clearTimeout(deadline);
  });
});
