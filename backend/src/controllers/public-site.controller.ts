import type { RequestHandler } from "express";
import {
  publicSnapshot,
  rebuildPublicWebsite,
  synchronizationStatus,
} from "../services/public-site.service.js";
import { emptyQuerySchema } from "../validators/content.js";
import { z } from "zod";
import { getDatabase } from "../config/database.js";
export const getPublicContent: RequestHandler = async (req, res) => {
  emptyQuerySchema.parse(req.query);
  res.set("Cache-Control", "no-store").json(await publicSnapshot());
};
export const getSynchronization: RequestHandler = async (req, res) => {
  emptyQuerySchema.parse(req.query);
  res.json({ data: await synchronizationStatus() });
};
export const rebuildWebsite: RequestHandler = async (req, res) => {
  emptyQuerySchema.parse(req.query);
  z.strictObject({}).parse(req.body);
  rebuildPublicWebsite();
  await getDatabase().auditLog.create({
    data: {
      actorId: res.locals.auth.user.id,
      action: "WEBSITE_REBUILD_REQUEST",
      entity: "website",
    },
  });
  res
    .status(202)
    .json({
      data: {
        state: "Building",
        message:
          "Website update started. Check synchronization status for the result.",
      },
    });
};
