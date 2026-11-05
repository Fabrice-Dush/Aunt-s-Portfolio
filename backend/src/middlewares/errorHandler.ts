import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../generated/prisma/client.js';
import { AppError } from '../utils/AppError.js';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Request contains invalid or unsupported fields' } });
    return;
  }
  if (error instanceof AppError) {
    response.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const known: Record<string, [number, string, string]> = {
      P2002: [409, 'CONFLICT', 'A unique value is already in use'],
      P2003: [409, 'RELATION_CONFLICT', 'A related record prevents this operation'],
      P2025: [404, 'NOT_FOUND', 'Record not found'],
      P2034: [409, 'EDIT_CONFLICT', 'Another change overlapped this request. Reload the record and try again.'],
      P1001: [503, 'SERVICE_UNAVAILABLE', 'Content is temporarily unavailable'],
      P1002: [503, 'SERVICE_UNAVAILABLE', 'Content is temporarily unavailable'],
      P2024: [503, 'SERVICE_UNAVAILABLE', 'Content is temporarily unavailable'],
    };
    const entry = known[error.code];
    if (entry) { response.status(entry[0]).json({ error: { code: entry[1], message: entry[2] } }); return; }
  }
  // Express's JSON parser reports client errors before a route is reached.
  // Return fixed messages without reflecting the submitted body or parser details.
  if (error && typeof error === 'object' && 'type' in error) {
    if (error.type === 'entity.parse.failed') {
      response.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' } });
      return;
    }
    if (error.type === 'entity.too.large') {
      response.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large' } });
      return;
    }
  }
  // Do not leak internal errors, stack traces or environment details to visitors.
  console.error('Unhandled API error'); // Never log request bodies, driver queries or credentials.
  response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
};
