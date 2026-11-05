import type { PrismaClient, Prisma } from "../generated/prisma/client.js";
import { getDatabase } from "../config/database.js";
import { contentServices } from "./content.service.js";
import { contentSchemas } from "../validators/content.js";
import { AppError } from "../utils/AppError.js";
import { createHash } from "node:crypto";

export const cmsModels = {
  profile: "profile",
  experience: "experience",
  education: "education",
  skills: "skill",
  projects: "project",
  achievements: "achievement",
  certifications: "certificate",
} as const;
export type CmsSection = keyof typeof cmsModels;
export type Tx = Prisma.TransactionClient;
export type CmsRow = {
  id: string;
  updatedAt: Date;
  status: string;
  [key: string]: unknown;
};
type Manager = {
  read(id: string): Promise<CmsRow>;
  list(): Promise<CmsRow[]>;
  create(data: unknown): Promise<CmsRow>;
  update(id: string, data: unknown): Promise<CmsRow>;
  publish(id: string): Promise<CmsRow>;
  unpublish(id: string): Promise<CmsRow>;
  remove(id: string): Promise<CmsRow>;
};
export function cmsManager(db: PrismaClient | Tx, section: CmsSection) {
  // Managers use only the transaction delegate methods here; their standalone reorder is not used.
  return contentServices(db as PrismaClient)[
    cmsModels[section]
  ] as unknown as Manager;
}
export async function audit(
  tx: Tx,
  actorId: string,
  action: string,
  entity: string,
  entityId?: string,
) {
  await tx.auditLog.create({ data: { actorId, action, entity, entityId } });
}
export function checkVersion(row: { updatedAt: Date }, expected: string) {
  if (row.updatedAt.toISOString() !== expected)
    throw new AppError(
      409,
      "EDIT_CONFLICT",
      "This record changed. Reload it before saving your changes.",
    );
}
export async function lockRow(tx: Tx, model: string, id: string) {
  const tables: Record<string, string> = {
    profile: "Profile",
    experience: "Experience",
    education: "Education",
    skill: "Skill",
    project: "Project",
    achievement: "Achievement",
    certificate: "Certificate",
    mediaAsset: "MediaAsset",
    contactMessage: "ContactMessage",
    siteSettings: "SiteSettings",
  };
  const table = tables[model];
  if (!table)
    throw new AppError(400, "INVALID_OPERATION", "Unknown content area");
  // Table names are exclusively selected from this fixed server allowlist. IDs remain parameters.
  await tx.$queryRawUnsafe(
    `SELECT id FROM \`${table}\` WHERE id = ? FOR UPDATE`,
    id,
  );
}
export const nextVersion = (old: Date) =>
  new Date(Math.max(Date.now(), old.getTime() + 1));
async function touch(tx: Tx, section: CmsSection, id: string, old: Date) {
  const version = nextVersion(old);
  switch (section) {
    case "profile":
      await tx.profile.update({ where: { id }, data: { updatedAt: version } });
      break;
    case "experience":
      await tx.experience.update({
        where: { id },
        data: { updatedAt: version },
      });
      break;
    case "education":
      await tx.education.update({
        where: { id },
        data: { updatedAt: version },
      });
      break;
    case "skills":
      await tx.skill.update({ where: { id }, data: { updatedAt: version } });
      break;
    case "projects":
      await tx.project.update({ where: { id }, data: { updatedAt: version } });
      break;
    case "achievements":
      await tx.achievement.update({
        where: { id },
        data: { updatedAt: version },
      });
      break;
    case "certifications":
      await tx.certificate.update({
        where: { id },
        data: { updatedAt: version },
      });
      break;
  }
}
async function validateRelations(
  tx: Tx,
  section: CmsSection,
  row: CmsRow,
  publishing: boolean,
) {
  if (section === "profile") {
    if (
      row.fullName !== "Nyirarukundo Seraphine" ||
      row.professionalTitle !== "Water Treatment Plant Engineer"
    ) {
      throw new AppError(
        400,
        "IDENTITY_REQUIRED",
        "Use Nyirarukundo Seraphine and Water Treatment Plant Engineer.",
      );
    }
  }
  if (section === "achievements" && row.projectId) {
    const project = await tx.project.findUnique({
      where: { id: String(row.projectId) },
    });
    if (
      !project ||
      (publishing && (project.status !== "PUBLISHED" || !project.isVerified))
    )
      throw new AppError(
        409,
        "RELATION_CONFLICT",
        "Choose an available published project before publication.",
      );
  }
  const ids = [
    section === "profile"
      ? row.portraitId
      : section === "certifications"
        ? row.mediaId
        : null,
  ]
    .filter(Boolean)
    .map(String);
  if (section === "projects" && publishing)
    ids.push(
      ...(
        await tx.mediaAsset.findMany({
          where: { projectId: row.id },
          select: { id: true },
        })
      ).map((v) => v.id),
    );
  for (const id of ids) {
    await lockRow(tx, "mediaAsset", id);
    const media = await tx.mediaAsset.findUnique({ where: { id } });
    if (
      !media ||
      (publishing &&
        (!media.approved ||
          !media.publicUrl ||
          (media.mimeType.startsWith("image/") && !media.altText)))
    )
      throw new AppError(
        409,
        "MEDIA_NOT_APPROVED",
        "Review and approve attached media before publishing.",
      );
    if (section === "profile" && !media.mimeType.startsWith("image/"))
      throw new AppError(
        400,
        "INVALID_PORTRAIT",
        "Choose an image for the portrait.",
      );
  }
}
export function cmsService(db = getDatabase()) {
  return {
    async list(section: CmsSection, page: number) {
      // Explicit bounded schema projection excludes future sensitive model fields.
      const model = cmsModels[section];
      const select = {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        ...Object.fromEntries(
          Object.keys(contentSchemas[model].shape).map((k) => [k, true]),
        ),
        ...(section === "profile"
          ? { showPublicContact: true, contactApprovedAt: true }
          : {}),
      };
      const delegate = db[model] as unknown as {
        findMany(args: unknown): Promise<CmsRow[]>;
      };
      return delegate.findMany({
        select,
        skip: (page - 1) * 20,
        take: 21,
        orderBy:
          section === "profile"
            ? { id: "asc" }
            : [{ sortOrder: "asc" }, { id: "asc" }],
      });
    },
    async create(
      section: CmsSection,
      input: unknown,
      actorId: string,
      operation: string,
    ) {
      const data = contentSchemas[cmsModels[section]].parse(input);
      return db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM User WHERE id = ${actorId} FOR UPDATE`;
        const fingerprint = createHash("sha256")
          .update(JSON.stringify(data))
          .digest("hex");
        const receipt = await tx.auditLog.findFirst({
          where: {
            actorId,
            action: "CONTENT_CREATE",
            details: { path: "$.operation", equals: operation },
          },
        });
        if (receipt) {
          const details = receipt.details as { fingerprint?: string };
          if (
            receipt.entity !== section ||
            details.fingerprint !== fingerprint ||
            !receipt.entityId
          )
            throw new AppError(
              409,
              "OPERATION_USED",
              "This save request has already been used. Reload the record.",
            );
          return cmsManager(tx, section).read(receipt.entityId);
        }
        const row = await cmsManager(tx, section).create(data);
        await validateRelations(tx, section, row, false);
        await tx.auditLog.create({
          data: {
            actorId,
            action: "CONTENT_CREATE",
            entity: section,
            entityId: row.id,
            details: { operation, fingerprint },
          },
        });
        return row;
      });
    },
    async change(
      section: CmsSection,
      id: string,
      expected: string,
      actorId: string,
      action: "update" | "publish" | "unpublish" | "remove",
      input?: unknown,
      contactConsent = false,
    ) {
      return db.$transaction(
        async (tx) => {
          await lockRow(tx, cmsModels[section], id);
          const manager = cmsManager(tx, section);
          const old = await manager.read(id);
          checkVersion(old, expected);
          if (action === "remove" && section === "profile")
            throw new AppError(
              400,
              "INVALID_OPERATION",
              "Unpublish your profile instead of removing it.",
            );
          if (
            action === "update" &&
            section === "projects" &&
            input &&
            typeof input === "object" &&
            "slug" in input &&
            input.slug !== old.slug
          )
            throw new AppError(
              409,
              "STABLE_SLUG",
              "The project address stays the same. Create a new project to use another address.",
            );
          if (action === "publish")
            await validateRelations(tx, section, old, true);
          const row =
            action === "update"
              ? await manager.update(id, input)
              : await manager[action](id);
          if (action === "update")
            await validateRelations(tx, section, row, false);
          if (action !== "remove") {
            if (section === "profile" && action === "publish") {
              await tx.profile.update({
                where: { id },
                data: {
                  showPublicContact: contactConsent,
                  contactApprovedAt: contactConsent ? new Date() : null,
                },
              });
              if (contactConsent)
                await audit(tx, actorId, "PUBLIC_CONTACT_CONSENT", section, id);
            }
            await touch(tx, section, id, old.updatedAt);
          }
          await audit(
            tx,
            actorId,
            "CONTENT_" + action.toUpperCase(),
            section,
            id,
          );
          return action === "remove" ? null : manager.read(id);
        },
        { timeout: 15000 },
      );
    },
    async reorder(
      section: CmsSection,
      items: { id: string; expectedUpdatedAt: string; sortOrder: number }[],
      actorId: string,
    ) {
      if (section === "profile")
        throw new AppError(
          400,
          "INVALID_OPERATION",
          "Profile cannot be reordered",
        );
      await db.$transaction(async (tx) => {
        for (const item of [...items].sort((a, b) =>
          a.id.localeCompare(b.id),
        )) {
          await lockRow(tx, cmsModels[section], item.id);
          const row = await cmsManager(tx, section).read(item.id);
          checkVersion(row, item.expectedUpdatedAt);
          const delegate = tx[cmsModels[section]] as unknown as {
            update(args: unknown): Promise<unknown>;
          };
          await delegate.update({
            where: { id: item.id },
            data: {
              sortOrder: item.sortOrder,
              updatedAt: nextVersion(row.updatedAt),
            },
          });
        }
        await audit(tx, actorId, "CONTENT_REORDER", section);
      });
    },
  };
}
