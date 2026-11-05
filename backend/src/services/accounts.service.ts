import type { Prisma, PrismaClient } from '../generated/prisma/client.js';
import { getDatabase } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { audit, currentIdentity, lockUser, safeUserSelect } from './auth.service.js';
import type { Identity } from './auth.service.js';
import { hashPassword, verifyPassword } from './password.service.js';

async function requireMaintainer(tx: Prisma.TransactionClient, identity: Identity, password: string) {
  await lockUser(tx, identity.userId);
  const actor = await currentIdentity(tx, identity);
  if (actor.role !== 'SUPER_ADMIN') throw new AppError(403, 'FORBIDDEN', 'This action requires technical administrator access');
  const user = await tx.user.findUniqueOrThrow({ where: { id: actor.id } });
  if (!await verifyPassword(user.passwordHash, password)) throw new AppError(401, 'INVALID_CREDENTIALS', 'Current password is incorrect');
}
export function accountsService(db: PrismaClient = getDatabase()) {
  return {
    list: (page: number) => db.user.findMany({ where: { role: 'ADMIN' }, select: safeUserSelect, orderBy: { id: 'asc' }, skip: (page - 1) * 20, take: 21 }),
    async create(identity: Identity, input: { email: string; displayName: string; temporaryPassword: string; currentPassword: string }) {
      const passwordHash = await hashPassword(input.temporaryPassword);
      return db.$transaction(async tx => {
        await requireMaintainer(tx, identity, input.currentPassword);
        const user = await tx.user.create({ data: { email: input.email, displayName: input.displayName, passwordHash, role: 'ADMIN', mustChangePassword: true }, select: safeUserSelect });
        await audit(tx, identity.userId, 'ADMIN_CREATED', user.id);
        return user;
      });
    },
    async manage(identity: Identity, id: string, operation: 'status' | 'recover' | 'revoke', password: string, value?: boolean | string) {
      const hash = operation === 'recover' ? await hashPassword(value as string) : undefined;
      return db.$transaction(async tx => {
        await requireMaintainer(tx, identity, password);
        await lockUser(tx, id);
        const target = await tx.user.findUnique({ where: { id } });
        // No endpoint can modify ANY SUPER_ADMIN, including the last one or oneself.
        if (!target || target.role !== 'ADMIN') throw new AppError(404, 'NOT_FOUND', 'Administrator not found');
        if (operation === 'status') await tx.user.update({ where: { id }, data: { isActive: value as boolean } });
        if (operation === 'recover') await tx.user.update({ where: { id }, data: { passwordHash: hash, mustChangePassword: true } });
        await tx.authSession.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
        await audit(tx, identity.userId, operation === 'recover' ? 'ADMIN_RECOVERY' : operation === 'revoke' ? 'ADMIN_SESSIONS_REVOKED' : value ? 'ADMIN_ACTIVATED' : 'ADMIN_DEACTIVATED', id);
        return tx.user.findUniqueOrThrow({ where: { id }, select: safeUserSelect });
      });
    },
    async bootstrap(input: { email: string; displayName: string; password: string }) {
      const passwordHash = await hashPassword(input.password);
      return db.$transaction(async tx => {
        if (await tx.user.count({ where: { role: 'SUPER_ADMIN' } })) throw new AppError(409, 'ALREADY_PROVISIONED', 'A technical administrator already exists');
        // Unique slot also prevents two concurrent bootstrap processes succeeding.
        const user = await tx.user.create({ data: { email: input.email, displayName: input.displayName, passwordHash, role: 'SUPER_ADMIN', bootstrapSlot: 'initial' }, select: safeUserSelect });
        await audit(tx, user.id, 'SUPER_ADMIN_BOOTSTRAPPED', user.id);
        return user;
      });
    },
    async recoverMaintainer(email: string, password: string) {
      const passwordHash = await hashPassword(password);
      await db.$transaction(async tx => {
        const user = await tx.user.findUnique({ where: { email } });
        if (!user || user.role !== 'SUPER_ADMIN') throw new AppError(404, 'NOT_FOUND', 'Technical administrator not found');
        await lockUser(tx, user.id);
        await tx.user.update({ where: { id: user.id }, data: { passwordHash, isActive: true, mustChangePassword: true } });
        await tx.authSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
        await audit(tx, user.id, 'LOCAL_SUPER_ADMIN_RECOVERY', user.id);
      });
    },
  };
}
