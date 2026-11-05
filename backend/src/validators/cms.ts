import { z } from "zod";
import { idSchema } from "./content.js";

export const sectionSchema = z.enum([
  "profile",
  "experience",
  "education",
  "skills",
  "projects",
  "achievements",
  "certifications",
]);
export const versionSchema = z.iso.datetime();
export const editSchema = z.strictObject({
  expectedUpdatedAt: versionSchema,
  data: z.unknown(),
});
export const actionSchema = z.strictObject({
  expectedUpdatedAt: versionSchema,
});
export const publishSchema = actionSchema.extend({
  confirmed: z.literal(true),
  contactConsent: z.boolean().default(false),
});
export const pageSchema = z.strictObject({
  page: z
    .string()
    .regex(/^[1-9]\d{0,3}$/)
    .transform(Number)
    .default(1),
});
export const orderSchema = z.strictObject({
  items: z
    .array(
      z.strictObject({
        id: idSchema,
        expectedUpdatedAt: versionSchema,
        sortOrder: z.number().int().min(0).max(10000),
      }),
    )
    .min(1)
    .max(100)
    .refine((v) => new Set(v.map((i) => i.id)).size === v.length),
});
