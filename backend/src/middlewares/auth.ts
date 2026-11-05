import type { RequestHandler, CookieOptions, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';
import { ACCESS_SECONDS } from '../config/auth.js';
import { authService } from '../services/auth.service.js';
import { AppError } from '../utils/AppError.js';

export const cookieNames = { access: 'sp_access', refresh: 'sp_refresh' };
export function readCookie(req: Request, name: string) {
  const matches = (req.headers.cookie ?? '').split(';').map(v => v.trim()).filter(v => v.startsWith(name + '='));
  if (matches.length !== 1) return undefined;
  return matches[0]!.slice(name.length + 1);
}
export function cookieOptions(path: string): CookieOptions {
  return { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'strict', path };
}
export function setCookies(res: Response, tokens: { access: string; refresh: string; expiresAt: Date }) {
  res.cookie(cookieNames.access, tokens.access, { ...cookieOptions('/api/v1'), maxAge: ACCESS_SECONDS * 1000 });
  res.cookie(cookieNames.refresh, tokens.refresh, { ...cookieOptions('/api/v1/auth'), expires: tokens.expiresAt });
}
export function clearCookies(res: Response) {
  res.clearCookie(cookieNames.access, cookieOptions('/api/v1'));
  res.clearCookie(cookieNames.refresh, cookieOptions('/api/v1/auth'));
}
export const noStore: RequestHandler = (_req, res, next) => {
  res.set({ 'Cache-Control': 'no-store', Pragma: 'no-cache', 'X-Robots-Tag': 'noindex, nofollow' }); next();
};
// Exact Origin is mandatory, including login/logout/refresh. Missing/null Origin fails closed.
// Custom header requires CORS preflight; JSON-only mutations cannot be submitted by HTML forms.
export const csrf: RequestHandler = (req, _res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (req.headers.origin !== env.FRONTEND_ORIGIN || req.headers['x-portfolio-request'] !== '1'
      || (req.body !== undefined && !req.is('application/json'))) {
      throw new AppError(403, 'CSRF_REJECTED', 'This request could not be verified');
    }
    if (env.NODE_ENV === 'production' && !env.FRONTEND_ORIGIN.startsWith('https://')) throw new AppError(503, 'AUTH_UNAVAILABLE', 'Secure sign-in is not configured');
  }
  next();
};
export const authenticate = (allowPasswordChange = false): RequestHandler => async (req, res, next) => {
  res.locals.auth = await authService().authenticate(readCookie(req, cookieNames.access), allowPasswordChange);
  next();
};
export const superAdmin: RequestHandler = (_req, res, next) => {
  if (res.locals.auth.user.role !== 'SUPER_ADMIN') throw new AppError(403, 'FORBIDDEN', 'This area is for the technical administrator');
  next();
};
export const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many sign-in attempts. Try again in 15 minutes.' } } });
export const sensitiveLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many account requests. Try again later.' } } });
