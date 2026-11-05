import { Router, raw } from "express";
import { rateLimit } from "express-rate-limit";
import { authenticate, csrf, noStore } from "../middlewares/auth.js";
import {
  getMediaList,
  mediaAction,
  serveMedia,
  uploadFile,
} from "../controllers/media.controller.js";
export const privateMediaRouter = Router();
privateMediaRouter.use(noStore, authenticate(), csrf);
privateMediaRouter.get("/", getMediaList);
// CSRF runs before the binary parser, preserving exact Origin/header checks.
privateMediaRouter.post(
  "/",
  rateLimit({
    windowMs: 60000,
    limit: 12,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  raw({
    type: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    limit: "8mb",
  }),
  uploadFile,
);
privateMediaRouter.get("/:id/file", serveMedia(true));
privateMediaRouter.patch("/:id", mediaAction("edit"));
privateMediaRouter.post("/:id/approve", mediaAction("approve"));
privateMediaRouter.post("/:id/revoke", mediaAction("revoke"));
privateMediaRouter.delete("/:id", mediaAction("delete"));
export const publicMediaRouter = Router();
publicMediaRouter.use(noStore);
publicMediaRouter.get("/:id", serveMedia(false));
