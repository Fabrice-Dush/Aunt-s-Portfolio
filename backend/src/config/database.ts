import './loadEnv.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';

export function databaseOptions(value: string | undefined) {
  try {
    const url = new URL(value ?? '');
    if (url.protocol !== 'mysql:' || !url.hostname || !url.username || !url.password || !/^\/[a-zA-Z0-9_]+$/.test(url.pathname) || url.search || url.hash) throw new Error();
    return {
      host: url.hostname, port: Number(url.port || 3306),
      user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
      database: url.pathname.slice(1), connectionLimit: 5, connectTimeout: 5000,
      acquireTimeout: 5000,
    };
  } catch { throw new Error('Invalid database configuration'); }
}

export function createDatabase(url: string | undefined) {
  return new PrismaClient({ adapter: new PrismaMariaDb(databaseOptions(url)), log: [] });
}
let client: PrismaClient | undefined;
export function getDatabase() { return client ??= createDatabase(process.env.DATABASE_URL); }
export async function disconnectDatabase() { if (client) await client.$disconnect(); client = undefined; }
