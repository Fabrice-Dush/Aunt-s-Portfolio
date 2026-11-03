import type { PrismaClient } from '../generated/prisma/client.js';
import type { z } from 'zod';
import type { paginationSchema } from '../validators/content.js';
import { AppError } from '../utils/AppError.js';

// All public response fields are explicitly selected. Storage keys and private metadata never leave this service.
const mediaSelect = { id: true, publicUrl: true, altText: true, mimeType: true } as const;
const publicMedia = { approved: true, publicUrl: { not: null } } as const;
const published = { status: 'PUBLISHED', isVerified: true } as const;
const projectSelect = {
  id: true, slug: true, title: true, summary: true, body: true, role: true, result: true,
  year: true, organization: true, startYear: true, endYear: true, featured: true,
  media: { where: publicMedia, select: mediaSelect, orderBy: { id: 'asc' } },
} as const;
type Page = z.infer<typeof paginationSchema>;
export type Collection = 'experience' | 'education' | 'skills' | 'projects' | 'achievements' | 'certifications';

export function portfolioService(db: PrismaClient) {
  return {
    async profile() {
      const row = await db.profile.findFirst({ where: { id: 'owner', status: 'PUBLISHED' }, select: {
        fullName: true, professionalTitle: true, location: true, city: true, country: true,
        motto: true, summary: true, biography: true, experienceDescription: true,
        email: true, phone: true, showPublicContact: true, contactApprovedAt: true,
        portrait: { select: { ...mediaSelect, approved: true } },
      } });
      if (!row) throw new AppError(404, 'NOT_FOUND', 'Profile not found');
      const { email, phone, showPublicContact, contactApprovedAt, portrait, ...identity } = row;
      return { ...identity,
        contact: showPublicContact && contactApprovedAt ? { email, phone } : null,
        portrait: portrait?.approved && portrait.publicUrl
          ? { id: portrait.id, publicUrl: portrait.publicUrl, altText: portrait.altText, mimeType: portrait.mimeType } : null,
      };
    },
    async list(collection: Collection, page: Page) {
      const args = { where: published, skip: (page.page - 1) * page.limit, take: page.limit + 1,
        orderBy: [{ sortOrder: page.sort }, { id: page.sort }] };
      let rows: unknown[];
      switch (collection) {
        case 'experience': rows = await db.experience.findMany({ ...args, select: { id: true, jobTitle: true, organization: true, startYear: true, endYear: true, isCurrent: true, description: true, responsibilities: true } }); break;
        case 'education': rows = await db.education.findMany({ ...args, select: { id: true, qualification: true, institution: true, country: true, yearCompleted: true, notes: true } }); break;
        case 'skills': rows = await db.skill.findMany({ ...args, select: { id: true, name: true, category: true, description: true } }); break;
        case 'projects': rows = await db.project.findMany({ ...args, select: projectSelect }); break;
        case 'achievements': rows = await db.achievement.findMany({ ...args,
          where: { ...published, OR: [{ projectId: null }, { project: published }] },
          select: { id: true, title: true, description: true, year: true, project: { select: { slug: true, title: true } } } }); break;
        case 'certifications': {
          const certificates = await db.certificate.findMany({ ...args, select: { id: true, title: true, issuer: true, year: true,
            credentialDetails: true, media: { select: { ...mediaSelect, approved: true } } } });
          rows = certificates.map(({ media, ...record }) => ({ ...record, media: media?.approved && media.publicUrl
            ? { id: media.id, publicUrl: media.publicUrl, altText: media.altText, mimeType: media.mimeType } : null }));
          break;
        }
      }
      return { data: rows.slice(0, page.limit), pagination: { page: page.page, limit: page.limit, hasMore: rows.length > page.limit } };
    },
    async project(slug: string) {
      const row = await db.project.findFirst({ where: { ...published, slug }, select: projectSelect });
      if (!row) throw new AppError(404, 'NOT_FOUND', 'Project not found');
      return row;
    },
  };
}
