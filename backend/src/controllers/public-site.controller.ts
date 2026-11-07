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
export async function requestWebsiteRebuild(
  actorId: string,
  recordRequest: (actorId: string) => Promise<unknown> = actor => getDatabase().auditLog.create({
    data: { actorId: actor, action: "WEBSITE_REBUILD_REQUEST", entity: "website" },
  }),
  startBuild: () => void = rebuildPublicWebsite,
) {
  await recordRequest(actorId);
  startBuild();
}
export const rebuildWebsite: RequestHandler = async (req, res) => {
  emptyQuerySchema.parse(req.query);
  z.strictObject({}).parse(req.body);
  await requestWebsiteRebuild(res.locals.auth.user.id);
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
