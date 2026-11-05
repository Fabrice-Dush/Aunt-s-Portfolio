import { randomUUID } from "node:crypto";
import { lstat, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  PDFDocument,
  PDFDict,
  PDFArray,
  PDFRawStream,
  PDFInvalidObject,
  PDFName,
  type PDFObject,
} from "pdf-lib";
import { z } from "zod";
import { getDatabase } from "../config/database.js";
import { audit, checkVersion, lockRow, nextVersion } from "./cms.service.js";
import { AppError } from "../utils/AppError.js";
import { idSchema } from "../validators/content.js";
import { versionSchema } from "../validators/cms.js";

export const mediaRoot = resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
  process.env.NODE_ENV === "test" ? ".cache/test-media" : ".private-media",
);
const dto = {
  id: true,
  fileName: true,
  mimeType: true,
  bytes: true,
  altText: true,
  approved: true,
  projectId: true,
  createdAt: true,
  updatedAt: true,
} as const;
export const uploadSchema = z.strictObject({
  fileName: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[^\\/\x00-\x1f:]+$/),
  altText: z.string().trim().min(3).max(255).optional(),
});
export const mediaEditSchema = z.strictObject({
  expectedUpdatedAt: versionSchema,
  altText: z.string().trim().min(3).max(255).nullable(),
  projectId: idSchema.nullable(),
});
let processing = 0;
export async function processUpload(buffer: Buffer, fileName: string, mime: string) {
  if (processing >= 2) throw new AppError(429, 'MEDIA_BUSY', 'Other files are being processed. Please try again shortly.');
  processing++;
  try { return await transformUpload(buffer, fileName, mime); }
  finally { processing--; }
}
async function transformUpload(
  buffer: Buffer,
  fileName: string,
  mime: string,
) {
  if (!buffer.length || buffer.length > 8_000_000)
    throw new AppError(
      413,
      "PAYLOAD_TOO_LARGE",
      "Choose a file smaller than 8 MB.",
    );
  const extension = fileName.split(".").pop()?.toLowerCase();
  const actual = buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
    ? "image/jpeg"
    : buffer
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      ? "image/png"
      : buffer.toString("ascii", 0, 4) === "RIFF" &&
          buffer.toString("ascii", 8, 12) === "WEBP"
        ? "image/webp"
        : buffer.toString("ascii", 0, 5) === "%PDF-"
          ? "application/pdf"
          : null;
  const extensions: Record<string, string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "application/pdf": ["pdf"],
  };
  if (
    !actual ||
    actual !== mime ||
    !extensions[actual]!.includes(extension ?? "")
  )
    throw new AppError(
      400,
      "INVALID_FILE",
      "The file content, type and extension must match JPEG, PNG, WebP or PDF.",
    );
  try {
    if (actual === "application/pdf") {
      if (!buffer.subarray(-1024).includes(Buffer.from("%%EOF")))
        throw new Error("Incomplete PDF");
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: false });
      if (!pdf.getPageCount() || pdf.getPageCount() > 100)
        throw new Error("Page limit");
      const blocked = new Set([
        "JS",
        "JavaScript",
        "OpenAction",
        "AA",
        "A",
        "EmbeddedFiles",
        "EF",
        "Launch",
        "RichMedia",
        "XFA",
        "AcroForm",
      ]);
      const inspect = (obj: PDFObject, depth = 0) => {
        if (depth > 100) throw new Error("PDF nesting limit");
        if (obj instanceof PDFInvalidObject) throw new Error('Invalid PDF object');
        if (obj instanceof PDFRawStream) inspect(obj.dict, depth + 1);
        if (obj instanceof PDFDict) {
          for (const key of obj.keys()) {
            if (blocked.has(key.decodeText())) throw new Error("Active PDF");
            // Names may be indirect objects; resolve this value without following cyclic page trees.
            const value = key.decodeText() === "Subtype" ? pdf.context.lookup(obj.get(key)) : obj.get(key);
            if (key.decodeText() === 'Subtype' && value instanceof PDFName && ['3D','RichMedia','Movie','Sound','Screen','Widget','FileAttachment'].includes(value.decodeText())) throw new Error('Active PDF annotation');
            inspect(obj.get(key)!, depth + 1);
          }
        }
        if (obj instanceof PDFArray)
          for (let i = 0; i < obj.size(); i++) inspect(obj.get(i), depth + 1);
      };
      for (const [, obj] of pdf.context.enumerateIndirectObjects())
        inspect(obj);
      pdf.setAuthor("");
      pdf.setCreator("");
      pdf.setProducer("");
      pdf.setSubject("");
      pdf.setKeywords([]);
      return {
        main: Buffer.from(await pdf.save()),
        small: null,
        mimeType: actual,
        suffix: "pdf",
      };
    }
    const image = sharp(buffer, {
      limitInputPixels: 32_000_000,
      animated: false,
      failOn: "warning",
    });
    const metadata = await image.metadata();
    if ((metadata.pages ?? 1) > 1) throw new Error("Animated image");
    // Re-encoding strips EXIF/GPS and all original metadata. Never serve the original.
    const main = await image
      .rotate()
      .resize({
        width: 1600,
        height: 2000,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
    const small = await sharp(main)
      .resize({ width: 640, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    return { main, small, mimeType: "image/webp", suffix: "webp" };
  } catch {
    throw new AppError(
      400,
      "INVALID_FILE",
      "This file could not be processed. Use a valid still image or a PDF without active content.",
    );
  }
}
function assetPath(key: string, variant = "") {
  if (
    !/^[0-9a-f-]{36}\.(webp|pdf)$/.test(key) ||
    !["", ".small", ".original"].includes(variant)
  )
    throw new AppError(404, "NOT_FOUND", "Media not found");
  return resolve(mediaRoot, key + variant);
}
export async function uploadMedia(
  input: { fileName: string; altText?: string },
  buffer: Buffer,
  mime: string,
  actorId: string,
) {
  const processed = await processUpload(buffer, input.fileName, mime);
  if (processed.mimeType.startsWith("image/") && !input.altText)
    throw new AppError(
      400,
      "ALT_REQUIRED",
      "Describe this image for visitors who cannot see it.",
    );
  const key = `${randomUUID()}.${processed.suffix}`;
  const written: string[] = [];
  await mkdir(mediaRoot, { recursive: true });
  if ((await lstat(mediaRoot)).isSymbolicLink())
    throw new AppError(
      503,
      "STORAGE_UNAVAILABLE",
      "Media storage is unavailable.",
    );
  try {
    for (const [suffix, data] of [
      [".original", buffer],
      ["", processed.main],
      [".small", processed.small],
    ] as const)
      if (data) {
        const path = assetPath(key, suffix);
        await writeFile(path, data, { flag: "wx", mode: 0o600 });
        written.push(path);
      }
    return await getDatabase().$transaction(async (tx) => {
      const row = await tx.mediaAsset.create({
        data: {
          storageKey: key,
          fileName: input.fileName,
          mimeType: processed.mimeType,
          bytes: processed.main.length,
          altText: input.altText,
        },
        select: dto,
      });
      await audit(tx, actorId, "MEDIA_UPLOAD", "media", row.id);
      return row;
    });
  } catch (error) {
    await Promise.all(written.map((path) => unlink(path)));
    throw error;
  }
}
export async function listMedia(page: number) {
  return getDatabase().mediaAsset.findMany({
    skip: (page - 1) * 20,
    take: 21,
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    select: dto,
  });
}
export async function changeMedia(
  id: string,
  expected: string,
  actorId: string,
  action: "approve" | "revoke" | "edit" | "delete",
  data?: { altText: string | null; projectId: string | null },
) {
  let deletedKey: string | null = null;
  const row = await getDatabase().$transaction(async (tx) => {
    await lockRow(tx, "mediaAsset", id);
    const old = await tx.mediaAsset.findUnique({
      where: { id },
      include: {
        profiles: { select: { id: true } },
        certificates: { select: { id: true } },
      },
    });
    if (!old) throw new AppError(404, "NOT_FOUND", "Media not found");
    checkVersion(old, expected);
    if (action === "delete") {
      if (old.projectId || old.profiles.length || old.certificates.length)
        throw new AppError(
          409,
          "MEDIA_IN_USE",
          "Detach this file from all content before removing it.",
        );
      await tx.mediaAsset.delete({ where: { id } });
      deletedKey = old.storageKey;
    } else {
      if (action === "approve") {
        if (old.mimeType.startsWith("image/") && !old.altText)
          throw new AppError(
            400,
            "ALT_REQUIRED",
            "Describe the image before approving it.",
          );
        await readFile(assetPath(old.storageKey));
      }
      if (
        data?.projectId &&
        !(await tx.project.findUnique({ where: { id: data.projectId } }))
      )
        throw new AppError(409, "RELATION_CONFLICT", "Project not found");
      // Editing media withdraws its public approval, including attachments and alt text.
      await tx.mediaAsset.update({
        where: { id },
        data: {
          ...(data ?? {}),
          approved: action === "approve",
          publicUrl: action === "approve" ? `/api/v1/media/${id}` : null,
          updatedAt: nextVersion(old.updatedAt),
        },
      });
    }
    await audit(tx, actorId, "MEDIA_" + action.toUpperCase(), "media", id);
    return action === "delete"
      ? null
      : tx.mediaAsset.findUnique({ where: { id }, select: dto });
  });
  // Database deletion first makes bytes unreachable. Failed disk cleanup leaves a private orphan,
  // retried by the explicit reconciliation command; never undo a committed delete.
  if (deletedKey)
    await Promise.all(
      ["", ".small", ".original"].map((suffix) =>
        unlink(assetPath(deletedKey!, suffix)).catch(() => undefined),
      ),
    );
  return row;
}
export async function mediaFile(
  id: string,
  privateAccess: boolean,
  small: boolean,
) {
  const row = await getDatabase().mediaAsset.findFirst({
    where: {
      id,
      ...(privateAccess
        ? {}
        : {
            approved: true,
            publicUrl: { not: null },
            OR: [
              { profiles: { some: { status: "PUBLISHED" } } },
              {
                certificates: {
                  some: { status: "PUBLISHED", isVerified: true },
                },
              },
              { project: { status: "PUBLISHED", isVerified: true } },
            ],
          }),
    },
    select: { storageKey: true, mimeType: true },
  });
  if (!row) throw new AppError(404, "NOT_FOUND", "Media not found");
  try {
    return {
      bytes: await readFile(
        assetPath(
          row.storageKey,
          small && row.mimeType.startsWith("image/") ? ".small" : "",
        ),
      ),
      mime: row.mimeType,
    };
  } catch {
    throw new AppError(404, "NOT_FOUND", "Media not found");
  }
}
