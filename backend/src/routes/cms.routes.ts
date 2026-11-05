import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authenticate, csrf, noStore } from "../middlewares/auth.js";
import {
  actionCms,
  createCms,
  listCms,
  previewCms,
  reorderCms,
  updateCms,
} from "../controllers/cms.controller.js";

export const cmsRouter = Router();
cmsRouter.use(noStore, authenticate(), csrf);
cmsRouter.use(
  rateLimit({
    windowMs: 60000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);
cmsRouter.get("/:section", listCms);
cmsRouter.post("/:section", createCms);
cmsRouter.post("/:section/reorder", reorderCms);
cmsRouter.get("/:section/:id/preview", previewCms);
cmsRouter.patch("/:section/:id", updateCms);
cmsRouter.delete("/:section/:id", actionCms("remove"));
cmsRouter.post("/:section/:id/publish", actionCms("publish"));
cmsRouter.post("/:section/:id/unpublish", actionCms("unpublish"));
