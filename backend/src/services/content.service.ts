import { z } from 'zod';
import type { PrismaClient, PublicationStatus } from '../generated/prisma/client.js';
import { contentSchemas, idSchema, reorderSchema } from '../validators/content.js';
import { requireVerified, validatePeriod } from './publication.js';
import { AppError } from '../utils/AppError.js';

type RecordState = { id: string; status: PublicationStatus; isVerified?: boolean; startYear?: number | null; endYear?: number | null; isCurrent?: boolean };
type Change<T> = T & { status: 'DRAFT' };

// Internal managers. Phase 7 HTTP wrappers add authentication, concurrency and transactional audits.
function manager<S extends z.ZodObject, R extends RecordState>(schema: S, adapter: {
  create(data: Change<z.output<S>>): Promise<R>;
  get(id: string): Promise<R | null>;
  list(): Promise<R[]>;
  update(id: string, data: Change<z.output<S>>): Promise<R>;
  status(id: string, status: PublicationStatus): Promise<R>;
  remove(id: string): Promise<R>;
  reorder(items: z.infer<typeof reorderSchema>): Promise<unknown>;
}) {
  async function read(id: string) {
    const row = await adapter.get(idSchema.parse(id));
    if (!row) throw new AppError(404, 'NOT_FOUND', 'Record not found');
    return row;
  }
  return {
    read, list: adapter.list,
    async create(input: unknown) {
      const data = schema.parse(input);
      validatePeriod(data);
      return adapter.create({ ...data, status: 'DRAFT' });
    },
    async update(id: string, input: unknown) {
      // Strict partial validation rejects status, IDs and unsupported properties.
      schema.partial().parse(input);
      const row = await read(id);
      const current = Object.fromEntries(Object.keys(schema.shape).map(key => [key, Reflect.get(row, key)]));
      const data = schema.parse({ ...current, ...input as object });
      validatePeriod(data);
      return adapter.update(id, { ...data, status: 'DRAFT' });
    },
    async publish(id: string) {
      const row = await read(id);
      requireVerified(row);
      validatePeriod(row);
      return adapter.status(id, 'PUBLISHED');
    },
    async unpublish(id: string) { await read(id); return adapter.status(id, 'DRAFT'); },
    async remove(id: string) { return adapter.remove(idSchema.parse(id)); },
    async reorder(input: unknown) { return adapter.reorder(reorderSchema.parse(input)); },
  };
}

export function contentServices(db: PrismaClient) {
  return {
    profile: manager(contentSchemas.profile, {
      create: data => db.profile.create({ data: { ...data, id: 'owner' } }),
      get: id => db.profile.findUnique({ where: { id } }),
      list: () => db.profile.findMany({ take: 1 }),
      // Changing private contact data always revokes any prior contact consent.
      update: (id, data) => db.profile.update({ where: { id }, data: { ...data, showPublicContact: false, contactApprovedAt: null } }),
      status: (id, status) => db.profile.update({ where: { id }, data: { status } }),
      remove: id => db.profile.delete({ where: { id } }),
      reorder: async () => { throw new AppError(400, 'INVALID_OPERATION', 'Singleton profile cannot be reordered'); },
    }),
    experience: manager(contentSchemas.experience, {
      create: data => db.experience.create({ data }), get: id => db.experience.findUnique({ where: { id } }),
      list: () => db.experience.findMany({ take: 100, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
      update: (id, data) => db.experience.update({ where: { id }, data }),
      status: (id, status) => db.experience.update({ where: { id }, data: { status } }),
      remove: id => db.experience.delete({ where: { id } }),
      reorder: items => db.$transaction(items.map(({ id, sortOrder }) => db.experience.update({ where: { id }, data: { sortOrder } }))),
    }),
    education: manager(contentSchemas.education, {
      create: data => db.education.create({ data }), get: id => db.education.findUnique({ where: { id } }),
      list: () => db.education.findMany({ take: 100, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
      update: (id, data) => db.education.update({ where: { id }, data }),
      status: (id, status) => db.education.update({ where: { id }, data: { status } }),
      remove: id => db.education.delete({ where: { id } }),
      reorder: items => db.$transaction(items.map(({ id, sortOrder }) => db.education.update({ where: { id }, data: { sortOrder } }))),
    }),
    skill: manager(contentSchemas.skill, {
      create: data => db.skill.create({ data }), get: id => db.skill.findUnique({ where: { id } }),
      list: () => db.skill.findMany({ take: 100, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
      update: (id, data) => db.skill.update({ where: { id }, data }),
      status: (id, status) => db.skill.update({ where: { id }, data: { status } }),
      remove: id => db.skill.delete({ where: { id } }),
      reorder: items => db.$transaction(items.map(({ id, sortOrder }) => db.skill.update({ where: { id }, data: { sortOrder } }))),
    }),
    project: manager(contentSchemas.project, {
      create: data => db.project.create({ data }), get: id => db.project.findUnique({ where: { id } }),
      list: () => db.project.findMany({ take: 100, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
      update: (id, data) => db.project.update({ where: { id }, data }),
      status: (id, status) => db.project.update({ where: { id }, data: { status } }),
      remove: id => db.project.delete({ where: { id } }),
      reorder: items => db.$transaction(items.map(({ id, sortOrder }) => db.project.update({ where: { id }, data: { sortOrder } }))),
    }),
    achievement: manager(contentSchemas.achievement, {
      create: data => db.achievement.create({ data }), get: id => db.achievement.findUnique({ where: { id } }),
      list: () => db.achievement.findMany({ take: 100, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
      update: (id, data) => db.achievement.update({ where: { id }, data }),
      status: (id, status) => db.achievement.update({ where: { id }, data: { status } }),
      remove: id => db.achievement.delete({ where: { id } }),
      reorder: items => db.$transaction(items.map(({ id, sortOrder }) => db.achievement.update({ where: { id }, data: { sortOrder } }))),
    }),
    certificate: manager(contentSchemas.certificate, {
      create: data => db.certificate.create({ data }), get: id => db.certificate.findUnique({ where: { id } }),
      list: () => db.certificate.findMany({ take: 100, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
      update: (id, data) => db.certificate.update({ where: { id }, data }),
      status: (id, status) => db.certificate.update({ where: { id }, data: { status } }),
      remove: id => db.certificate.delete({ where: { id } }),
      reorder: items => db.$transaction(items.map(({ id, sortOrder }) => db.certificate.update({ where: { id }, data: { sortOrder } }))),
    }),
  };
}
