import { createHash, randomBytes } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { ACCESS_SECONDS, issuer, audience, signingKey } from '../config/auth.js';
import { AppError } from '../utils/AppError.js';

export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export function unauthorized() { return new AppError(401, 'UNAUTHENTICATED', 'Please sign in again'); }
export async function issueTokens(userId: string, sessionId: string, expiresAt: Date) {
  const make = (purpose: string, expires: number) => new SignJWT({ purpose, sid: sessionId })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' }).setIssuer(issuer).setAudience(audience)
    .setSubject(userId).setJti(randomBytes(32).toString('hex')).setIssuedAt().setExpirationTime(expires).sign(signingKey());
  const now = Math.floor(Date.now() / 1000);
  const [access, refresh] = await Promise.all([
    make('access', Math.min(now + ACCESS_SECONDS, Math.floor(expiresAt.getTime() / 1000))),
    make('refresh', Math.floor(expiresAt.getTime() / 1000)),
  ]);
  return { access, refresh, expiresAt };
}
export async function verifyToken(token: string | undefined, purpose: 'access' | 'refresh') {
  const key = signingKey();
  if (!token || token.length > 4096) throw unauthorized();
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'], issuer, audience, typ: 'JWT', requiredClaims: ['exp', 'iat', 'sub', 'jti'], maxTokenAge: purpose === 'access' ? ACCESS_SECONDS : '7d' });
    if (payload.purpose !== purpose || typeof payload.sid !== 'string' || !payload.sid || !payload.sub || typeof payload.jti !== 'string') throw unauthorized();
    return { userId: payload.sub, sessionId: payload.sid };
  } catch { throw unauthorized(); }
}
