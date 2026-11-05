import './loadEnv.js';
import { AppError } from '../utils/AppError.js';

export const ACCESS_SECONDS = 5 * 60;
export const SESSION_SECONDS = 7 * 24 * 60 * 60;
export const issuer = 'seraphine-portfolio-api';
export const audience = 'seraphine-portfolio-admin';
// Lazy validation preserves independent public liveness. Auth always fails closed.
export function signingKey() {
  const value = process.env.JWT_SECRET;
  if (!value || !/^[a-f0-9]{128}$/i.test(value)) {
    throw new AppError(503, 'AUTH_UNAVAILABLE', 'Sign-in is not configured');
  }
  return Buffer.from(value, 'hex');
}
