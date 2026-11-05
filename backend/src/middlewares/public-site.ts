import express, { Router } from "express";
import { resolve } from "node:path";
import {
  publicDirectory,
  publicSnapshot,
  verifiedPublicPage,
} from "../services/public-site.service.js";
export const publicSiteRouter = Router();
publicSiteRouter.get(["/", "/index.html"], async (_req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const current = await publicSnapshot();
    const page = await verifiedPublicPage(current.revision);
    res.type("html").send(page);
  } catch {
    res
      .status(503)
      .set({ "Retry-After": "30", "X-Robots-Tag": "noindex" })
      .type("html")
      .send(
        '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Portfolio temporarily unavailable</title><h1>Portfolio temporarily unavailable</h1><p>Please try again shortly.</p></html>',
      );
  }
});
publicSiteRouter.get(/^\/(login|admin|super-admin)(\/|$)/, (_req, res) => {
  res
    .set("Cache-Control", "no-store")
    .sendFile(resolve(publicDirectory, "login/index.html"));
});
publicSiteRouter.use(
  "/assets",
  express.static(resolve(publicDirectory, "assets"), { index: false }),
);
publicSiteRouter.use(
  "/images",
  express.static(resolve(publicDirectory, "images"), { index: false }),
);
publicSiteRouter.get(["/favicon.svg", "/robots.txt"], (req, res) =>
  res
    .set("Cache-Control", "no-store")
    .sendFile(resolve(publicDirectory, req.path.slice(1))),
);
