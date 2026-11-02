import { app } from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
  console.log(`Portfolio API available at http://localhost:${env.PORT}/api/v1/health`);
});

function shutDown(signal: string) {
  console.log(`${signal} received. Closing HTTP server.`);
  server.close((error?: Error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
}
process.on('SIGTERM', () => shutDown('SIGTERM'));
process.on('SIGINT', () => shutDown('SIGINT'));
