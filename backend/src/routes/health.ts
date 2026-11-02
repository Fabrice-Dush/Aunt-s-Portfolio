import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'seraphine-portfolio-api',
    // Deliberately excludes database status; no connection is configured in Phase 3.
    timestamp: new Date().toISOString(),
  });
});
