import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
});

// Database credentials are intentionally not loaded by the public health route.
// Database access will be added in Phase 5 after connection is configured.
export const env = schema.parse(process.env);
