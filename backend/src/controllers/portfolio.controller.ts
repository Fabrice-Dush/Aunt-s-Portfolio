import type { RequestHandler } from 'express';
import { getDatabase } from '../config/database.js';
import { portfolioService, type Collection } from '../services/portfolio.service.js';
import { emptyQuerySchema, paginationSchema, slugSchema } from '../validators/content.js';

export const getProfile: RequestHandler = async (request, response) => {
  emptyQuerySchema.parse(request.query);
  response.json({ data: await portfolioService(getDatabase()).profile() });
};
export function listContent(collection: Collection): RequestHandler {
  return async (request, response) => {
    const page = paginationSchema.parse(request.query);
    response.json(await portfolioService(getDatabase()).list(collection, page));
  };
}
export const getProject: RequestHandler = async (request, response) => {
  emptyQuerySchema.parse(request.query);
  const slug = slugSchema.parse(request.params.slug);
  response.json({ data: await portfolioService(getDatabase()).project(slug) });
};
