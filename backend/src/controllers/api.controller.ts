import type { RequestHandler } from 'express';

export const getApiMetadata: RequestHandler = (_request, response) => {
  response.json({ service: 'seraphine-portfolio-api', version: 'v1', message: 'API foundation. Content routes are planned for Phase 5.' });
};
