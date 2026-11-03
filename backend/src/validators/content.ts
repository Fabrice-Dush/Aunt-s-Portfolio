import { z } from 'zod';

const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => text(max).nullable().optional();
const year = z.number().int().min(1900).max(2100).nullable().optional();
const sortOrder = z.number().int().min(0).max(10000).default(0);
export const idSchema = text(191).regex(/^[a-zA-Z0-9_-]+$/);
export const slugSchema = text(191).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const paginationSchema = z.strictObject({
  page: z.string().regex(/^[1-9]\d{0,3}$/).transform(Number).default(1),
  limit: z.string().regex(/^[1-9]\d?$/).transform(Number).pipe(z.number().max(50)).default(20),
  sort: z.enum(['asc', 'desc']).default('asc'),
});
export const emptyQuerySchema = z.strictObject({});
const common = { isVerified: z.boolean().default(false), sortOrder };
export const contentSchemas = {
  profile: z.strictObject({
    fullName: text(150), professionalTitle: text(200), location: optionalText(150),
    city: optionalText(100), country: optionalText(100), motto: optionalText(255),
    summary: optionalText(10000), biography: optionalText(20000), experienceDescription: optionalText(255),
    portraitId: idSchema.nullable().optional(), email: z.email().max(191).nullable().optional(),
    phone: optionalText(40),
  }),
  experience: z.strictObject({ ...common, jobTitle: text(200), organization: text(200),
    startYear: year, endYear: year, isCurrent: z.boolean().default(false),
    description: optionalText(10000), responsibilities: optionalText(10000) }),
  education: z.strictObject({ ...common, qualification: text(200), institution: text(200),
    country: optionalText(100), yearCompleted: year, notes: optionalText(10000) }),
  skill: z.strictObject({ ...common, name: text(200), category: optionalText(100), description: optionalText(10000) }),
  project: z.strictObject({ ...common, title: text(220), slug: slugSchema, summary: optionalText(10000),
    body: optionalText(50000), role: optionalText(160), result: optionalText(10000), year,
    organization: optionalText(200), startYear: year, endYear: year, featured: z.boolean().default(false) }),
  achievement: z.strictObject({ ...common, title: text(220), description: optionalText(10000), year,
    projectId: idSchema.nullable().optional() }),
  certificate: z.strictObject({ ...common, title: text(220), issuer: optionalText(200), year,
    credentialDetails: optionalText(10000), mediaId: idSchema.nullable().optional() }),
};
export const mediaSchema = z.strictObject({
  fileName: text(255), storageKey: text(255).regex(/^[a-zA-Z0-9][a-zA-Z0-9/_-]*\.[a-zA-Z0-9]+$/).refine(v => !v.includes('..')),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  bytes: z.number().int().min(1).max(20_000_000), altText: optionalText(255),
  projectId: idSchema.nullable().optional(),
});
export const publicMediaUrlSchema = z.url().max(500).refine(value => {
  const url = new URL(value);
  return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash;
}, 'Public media must use a permanent HTTPS URL without credentials or query parameters');
export const contactSchema = z.strictObject({ senderName: text(150), senderEmail: z.email().max(191),
  subject: optionalText(200), content: text(10000) });
export const settingsSchema = z.strictObject({ siteTitle: text(200), description: optionalText(500), allowIndexing: z.boolean().default(false) });
export const reorderSchema = z.array(z.strictObject({ id: idSchema, sortOrder: z.number().int().min(0).max(10000) }))
  .min(1).max(100).refine(items => new Set(items.map(item => item.id)).size === items.length);
