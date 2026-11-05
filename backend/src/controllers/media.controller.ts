import type { RequestHandler } from "express";
import { z } from "zod";
import {
  changeMedia,
  listMedia,
  mediaEditSchema,
  mediaFile,
  uploadMedia,
  uploadSchema,
} from "../services/media.service.js";
import { actionSchema, pageSchema } from "../validators/cms.js";
import { emptyQuerySchema, idSchema } from "../validators/content.js";

export const uploadFile: RequestHandler = async (req, res) => {
  const input = uploadSchema.parse(req.query);
  res
    .status(201)
    .json({
      data: await uploadMedia(
        input,
        Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0),
        (req.headers["content-type"] ?? "").split(";")[0]!,
        res.locals.auth.user.id,
      ),
    });
};
export const getMediaList: RequestHandler = async (req, res) => {
  const { page } = pageSchema.parse(req.query);
  const rows = await listMedia(page);
  res.json({
    data: rows.slice(0, 20),
    pagination: { page, hasMore: rows.length > 20 },
  });
};
export function mediaAction(
  action: "approve" | "revoke" | "edit" | "delete",
): RequestHandler {
  return async (req, res) => {
    emptyQuerySchema.parse(req.query);
    const body =
      action === "edit"
        ? mediaEditSchema.parse(req.body)
        : actionSchema
            .extend(action === "approve" ? { confirmed: z.literal(true) } : {})
            .parse(req.body);
    res.json({
      data: await changeMedia(
        idSchema.parse(req.params.id),
        body.expectedUpdatedAt,
        res.locals.auth.user.id,
        action,
        "altText" in body
          ? { altText: body.altText, projectId: body.projectId }
          : undefined,
      ),
    });
  };
}
export function serveMedia(privateAccess: boolean): RequestHandler {
  return async (req, res) => {
    const query = z
      .strictObject({ size: z.enum(["small"]).optional() })
      .parse(req.query);
    const file = await mediaFile(
      idSchema.parse(req.params.id),
      privateAccess,
      query.size === "small",
    );
    res.set({
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Content-Disposition":
        file.mime === "application/pdf"
          ? 'attachment; filename="document.pdf"'
          : "inline",
    });
    res.type(file.mime).send(file.bytes);
  };
}
