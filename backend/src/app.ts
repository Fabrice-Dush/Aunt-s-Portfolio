import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }));
app.use(express.json({ limit: '100kb' }));
app.get('/api/v1', (_req, res) => res.json({ service: 'seraphine-portfolio-api', version: 'v1', message: 'API foundation. Content routes are planned for Phase 5.' }));
app.use('/api/v1/health', healthRouter);
app.use(notFound);
app.use(errorHandler);
