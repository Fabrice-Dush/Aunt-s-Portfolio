import type { RequestHandler } from 'express';

export const getHealth: RequestHandler = (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'seraphine-portfolio-api',
    // Deliberately excludes database status; no connection is configured in Phase 3.
    timestamp: new Date().toISOString(),
  });
};
