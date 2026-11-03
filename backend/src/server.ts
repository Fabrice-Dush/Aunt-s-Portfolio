import { app } from './app.js';
import { env } from './config/env.js';
import { disconnectDatabase } from './config/database.js';

const server = app.listen(env.PORT, () => {
  console.log(`Portfolio API available at http://localhost:${env.PORT}/api/v1/health`);
});

let closing = false;
function shutDown(signal: string) {
  if (closing) return;
  closing = true;
  console.log(`${signal} received. Closing HTTP server.`);
  const deadline = setTimeout(() => { process.exit(1); }, 10000).unref();
  server.close(async (error?: Error) => {
    if (error) {
      console.error('HTTP shutdown failed');
      process.exitCode = 1;
    }
    try { await disconnectDatabase(); } catch { process.exitCode = 1; }
    clearTimeout(deadline);
  });
}
process.on('SIGTERM', () => shutDown('SIGTERM'));
process.on('SIGINT', () => shutDown('SIGINT'));
