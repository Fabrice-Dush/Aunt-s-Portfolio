import { randomUUID } from 'node:crypto';
import type { Prisma, PrismaClient } from '../generated/prisma/client.js';
import { getDatabase } from '../config/database.js';
import { SESSION_SECONDS } from '../config/auth.js';
import { AppError } from '../utils/AppError.js';
import { dummyHash, hashPassword, verifyPassword } from './password.service.js';
import { issueTokens, tokenHash, unauthorized, verifyToken } from './token.service.js';

export const safeUserSelect = { id: true, email: true, displayName: true, role: true, isActive: true, mustChangePassword: true, createdAt: true } as const;
export type Identity = { userId: string; sessionId: string };
type Tx = Prisma.TransactionClient;
export const audit = (tx: Tx, actorId: string | null, action: string, entityId?: string) =>
  tx.auditLog.create({ data: { actorId, action, entity: 'User', entityId } });

// All credential/session mutations lock the affected user, preventing login racing a reset.
export async function lockUser(tx: Tx, id: string) {
  await tx.$queryRaw`SELECT id FROM User WHERE id = ${id} FOR UPDATE`;
}
export async function currentIdentity(tx: Tx, identity: Identity, allowPasswordChange = false) {
  const session = await tx.authSession.findUnique({ where: { id: identity.sessionId }, include: { user: { select: safeUserSelect } } });
  if (!session || session.userId !== identity.userId || session.revokedAt || session.expiresAt <= new Date() || !session.user.isActive) throw unauthorized();
  if (!allowPasswordChange && session.user.mustChangePassword) throw new AppError(403, 'PASSWORD_CHANGE_REQUIRED', 'Change your temporary password to continue');
  return session.user;
}
export function authService(db: PrismaClient = getDatabase()) {
  return {
    async login(email: string, password: string) {
      const candidate = await db.user.findUnique({ where: { email } });
      const valid = await verifyPassword(candidate?.passwordHash ?? await dummyHash(), password);
      if (!candidate || !valid || !candidate.isActive) {
        await audit(db, null, 'LOGIN_FAILED');
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
      }
      return db.$transaction(async tx => {
        await lockUser(tx, candidate.id);
        const user = await tx.user.findUniqueOrThrow({ where: { id: candidate.id } });
        if (!user.isActive || user.passwordHash !== candidate.passwordHash) throw unauthorized();
        const active = await tx.authSession.findMany({ where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { id: true } });
        if (active.length >= 10) {
          await tx.authSession.updateMany({ where: { id: { in: active.slice(9).map(session => session.id) } }, data: { revokedAt: new Date() } });
          await audit(tx, user.id, 'SESSION_LIMIT_REVOKED', user.id);
        }
        const sessionId = randomUUID();
        const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
        const tokens = await issueTokens(user.id, sessionId, expiresAt);
        await tx.authSession.create({ data: { id: sessionId, userId: user.id, expiresAt, refreshHash: tokenHash(tokens.refresh) } });
        await audit(tx, user.id, 'LOGIN_SUCCEEDED', user.id);
        return { tokens, user: await tx.user.findUniqueOrThrow({ where: { id: user.id }, select: safeUserSelect }) };
      });
    },
    async authenticate(token: string | undefined, allowPasswordChange = false) {
      const identity = await verifyToken(token, 'access');
      const user = await currentIdentity(db, identity, allowPasswordChange);
      return { identity, user };
    },
    async refresh(token: string | undefined) {
      const identity = await verifyToken(token, 'refresh');
      const result = await db.$transaction(async tx => {
        await lockUser(tx, identity.userId);
        await currentIdentity(tx, identity, true);
        const session = await tx.authSession.findUniqueOrThrow({ where: { id: identity.sessionId } });
        if (session.refreshHash !== tokenHash(token!)) {
          await tx.authSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
          await audit(tx, identity.userId, 'REFRESH_REPLAY_REVOKED', identity.userId);
          return null; // Commit revocation before reporting the invalid token.
        }
        const tokens = await issueTokens(identity.userId, session.id, session.expiresAt);
        await tx.authSession.update({ where: { id: session.id }, data: { refreshHash: tokenHash(tokens.refresh), refreshedAt: new Date() } });
        return tokens;
      });
      if (!result) throw unauthorized();
      return result;
    },
    async logout(refresh: string | undefined) {
      let identity: Identity;
      try { identity = await verifyToken(refresh, 'refresh'); } catch (error) {
        if (error instanceof AppError && error.status === 401) return;
        throw error;
      }
      await db.$transaction(async tx => {
        await lockUser(tx, identity.userId);
        const result = await tx.authSession.updateMany({ where: { id: identity.sessionId, userId: identity.userId, revokedAt: null }, data: { revokedAt: new Date() } });
        if (result.count) await audit(tx, identity.userId, 'LOGOUT', identity.userId);
      });
    },
    async changePassword(identity: Identity, currentPassword: string, newPassword: string) {
      if (currentPassword === newPassword) throw new AppError(400, 'PASSWORD_UNCHANGED', 'Choose a different password');
      const hash = await hashPassword(newPassword);
      await db.$transaction(async tx => {
        await lockUser(tx, identity.userId);
        await currentIdentity(tx, identity, true);
        const user = await tx.user.findUniqueOrThrow({ where: { id: identity.userId } });
        if (!await verifyPassword(user.passwordHash, currentPassword)) throw new AppError(401, 'INVALID_CREDENTIALS', 'Current password is incorrect');
        await tx.user.update({ where: { id: user.id }, data: { passwordHash: hash, mustChangePassword: false } });
        await tx.authSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
        await audit(tx, user.id, 'PASSWORD_CHANGED', user.id);
      });
    },
    async sessions(identity: Identity) {
      await currentIdentity(db, identity, true);
      return db.authSession.findMany({ where: { userId: identity.userId, revokedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' }, take: 100,
        select: { id: true, createdAt: true, refreshedAt: true, expiresAt: true } });
    },
    async revoke(identity: Identity, id: string) {
      await db.$transaction(async tx => {
        await lockUser(tx, identity.userId);
        await currentIdentity(tx, identity, true);
        const result = await tx.authSession.updateMany({ where: { id, userId: identity.userId, revokedAt: null }, data: { revokedAt: new Date() } });
        if (!result.count) throw new AppError(404, 'NOT_FOUND', 'Session not found');
        await audit(tx, identity.userId, 'SESSION_REVOKED', identity.userId);
      });
    },
  };
}
