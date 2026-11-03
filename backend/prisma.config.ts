import './src/config/loadEnv.js';
import { defineConfig, env } from 'prisma/config';

function safeUrl(value: string) {
  try { return new URL(value); } catch { throw new Error('Invalid database URL configuration'); }
}
const runtimeUrl = safeUrl(env('DATABASE_URL'));
const migrationUrl = safeUrl(process.env.MIGRATION_DATABASE_URL || env('DATABASE_URL'));
if (runtimeUrl.hostname !== migrationUrl.hostname || runtimeUrl.port !== migrationUrl.port || runtimeUrl.pathname !== migrationUrl.pathname) {
  throw new Error('Runtime and migration URLs must target the same database server and schema');
}
if (process.env.SHADOW_DATABASE_URL && safeUrl(process.env.SHADOW_DATABASE_URL).pathname === migrationUrl.pathname) {
  throw new Error('Shadow database must have a different database name');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  datasource: {
    url: process.env.MIGRATION_DATABASE_URL || env('DATABASE_URL'),
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL || undefined,
  },
});
