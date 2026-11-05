import type { RequestHandler } from "express";
import { z } from "zod";
import { getDatabase } from "../config/database.js";
import type { PrismaClient } from "../generated/prisma/client.js";
import { privateServices } from "../services/private.service.js";
import {
  audit,
  checkVersion,
  lockRow,
  nextVersion,
} from "../services/cms.service.js";
import { emptyQuerySchema, settingsSchema } from "../validators/content.js";
import { versionSchema } from "../validators/cms.js";
const select = {
  siteTitle: true,
  description: true,
  allowIndexing: true,
  updatedAt: true,
} as const;
export const getSettings: RequestHandler = async (req, res) => {
  emptyQuerySchema.parse(req.query);
  res.json({
    data: await getDatabase().siteSettings.findUnique({
      where: { id: "site" },
      select,
    }),
  });
};
export const saveSettings: RequestHandler = async (req, res) => {
  emptyQuerySchema.parse(req.query);
  const body = z
    .strictObject({
      expectedUpdatedAt: versionSchema.nullable(),
      data: settingsSchema.omit({ allowIndexing: true }),
    })
    .parse(req.body);
  const result = await getDatabase().$transaction(async (tx) => {
    await lockRow(tx, "siteSettings", "site");
    const old = await tx.siteSettings.findUnique({ where: { id: "site" } });
    if (old) checkVersion(old, body.expectedUpdatedAt ?? "");
    await privateServices(tx as PrismaClient).saveSettings({
      ...body.data,
      allowIndexing: old?.allowIndexing ?? false,
    });
    if (old)
      await tx.siteSettings.update({
        where: { id: "site" },
        data: { updatedAt: nextVersion(old.updatedAt) },
      });
    await audit(
      tx,
      res.locals.auth.user.id,
      "SETTINGS_UPDATE",
      "settings",
      "site",
    );
    return tx.siteSettings.findUnique({ where: { id: "site" }, select });
  });
  res.json({ data: result });
};
