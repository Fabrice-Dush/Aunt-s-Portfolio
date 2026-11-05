import type { RequestHandler } from "express";
import { cmsService, cmsManager } from "../services/cms.service.js";
import { getDatabase } from "../config/database.js";
import {
  actionSchema,
  editSchema,
  orderSchema,
  pageSchema,
  publishSchema,
  sectionSchema,
} from "../validators/cms.js";
import { emptyQuerySchema, idSchema } from "../validators/content.js";
import { z } from "zod";

const publicUpdate =
  "Public API updated. Update the public website to regenerate its HTML.";
export const listCms: RequestHandler = async (req, res) => {
  const section = sectionSchema.parse(req.params.section);
  const { page } = pageSchema.parse(req.query);
  const rows = await cmsService().list(section, page);
  res.json({
    data: rows.slice(0, 20),
    pagination: { page, hasMore: rows.length > 20 },
  });
};
export const previewCms: RequestHandler = async (req, res) => {
  emptyQuerySchema.parse(req.query);
  const section = sectionSchema.parse(req.params.section);
  const id = idSchema.parse(req.params.id);
  res.json({ data: await cmsManager(getDatabase(), section).read(id) });
};
export const createCms: RequestHandler = async (req, res) => {
  emptyQuerySchema.parse(req.query);
  res
    .status(201)
    .json({
      data: await cmsService().create(
        sectionSchema.parse(req.params.section),
        req.body,
        res.locals.auth.user.id,
        z.uuid().parse(req.headers["idempotency-key"]),
      ),
    });
};
export const updateCms: RequestHandler = async (req, res) => {
  emptyQuerySchema.parse(req.query);
  const { expectedUpdatedAt, data } = editSchema.parse(req.body);
  res.json({
    data: await cmsService().change(
      sectionSchema.parse(req.params.section),
      idSchema.parse(req.params.id),
      expectedUpdatedAt,
      res.locals.auth.user.id,
      "update",
      data,
    ),
    synchronization: publicUpdate,
  });
};
export function actionCms(
  action: "publish" | "unpublish" | "remove",
): RequestHandler {
  return async (req, res) => {
    emptyQuerySchema.parse(req.query);
    const body =
      action === "publish"
        ? publishSchema.parse(req.body)
        : actionSchema.parse(req.body);
    const data = await cmsService().change(
      sectionSchema.parse(req.params.section),
      idSchema.parse(req.params.id),
      body.expectedUpdatedAt,
      res.locals.auth.user.id,
      action,
      undefined,
      "contactConsent" in body && body.contactConsent === true,
    );
    res.json({ data, synchronization: publicUpdate });
  };
}
export const reorderCms: RequestHandler = async (req, res) => {
  emptyQuerySchema.parse(req.query);
  await cmsService().reorder(
    sectionSchema.parse(req.params.section),
    orderSchema.parse(req.body).items,
    res.locals.auth.user.id,
  );
  res.json({ data: null, synchronization: publicUpdate });
};
