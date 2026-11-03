import './loadEnv.js';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
});

// Database validation is lazy so the liveness route remains independent of MariaDB.
export const env = schema.parse(process.env);
