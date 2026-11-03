import { z } from 'zod';
import type { PrismaClient } from '../generated/prisma/client.js';
import { contactSchema, idSchema, mediaSchema, publicMediaUrlSchema, settingsSchema } from '../validators/content.js';

// Service foundations only; none is registered as an HTTP endpoint.
export function privateServices(db: PrismaClient) {
  return {
    createMedia: (input: unknown) => db.mediaAsset.create({ data: mediaSchema.parse(input) }),
    approveMedia: (id: string, publicUrl: unknown) => db.mediaAsset.update({ where: { id: idSchema.parse(id) },
      data: { publicUrl: publicMediaUrlSchema.parse(publicUrl), approved: true } }),
    revokeMedia: (id: string) => db.mediaAsset.update({ where: { id: idSchema.parse(id) }, data: { approved: false, publicUrl: null } }),
    // Caller must record owner consent in Phase 6 audit flow. Future API cannot mass-assign consent flags.
    approveContact: () => db.profile.update({ where: { id: 'owner' }, data: { showPublicContact: true, contactApprovedAt: new Date() } }),
    revokeContact: () => db.profile.update({ where: { id: 'owner' }, data: { showPublicContact: false, contactApprovedAt: null } }),
    createMessage: (input: unknown) => db.contactMessage.create({ data: {
      ...contactSchema.parse(input), expiresAt: new Date(Date.now() + 90 * 86400000),
    } }),
    listMessages: () => db.contactMessage.findMany({ take: 100, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] }),
    setMessageStatus: (id: string, status: unknown) => db.contactMessage.update({ where: { id: idSchema.parse(id) },
      data: { status: z.enum(['NEW', 'READ', 'ARCHIVED']).parse(status) } }),
    deleteMessage: (id: string) => db.contactMessage.delete({ where: { id: idSchema.parse(id) } }),
    purgeExpiredMessages: () => db.contactMessage.deleteMany({ where: { expiresAt: { lte: new Date() } } }),
    saveSettings: (input: unknown) => {
      const data = settingsSchema.parse(input);
      return db.siteSettings.upsert({ where: { id: 'site' }, create: { id: 'site', ...data }, update: data });
    },
  };
}
