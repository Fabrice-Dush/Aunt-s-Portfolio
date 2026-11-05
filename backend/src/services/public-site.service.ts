import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getDatabase } from "../config/database.js";
import type { PrismaClient } from "../generated/prisma/client.js";
import { portfolioService, type Collection } from "./portfolio.service.js";
import { AppError } from "../utils/AppError.js";
const repository = resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
export const publicDirectory = resolve(
  repository,
  process.env.NODE_ENV === "test"
    ? "frontend/.cache/test-public"
    : "frontend/dist",
);
export async function publicSnapshot(db = getDatabase()) {
  return db.$transaction(
    async (tx) => {
      const portfolio = portfolioService(tx as unknown as PrismaClient);
      const profile = await portfolio.profile().catch((error) => {
        if (error instanceof AppError && error.status === 404) return null;
        throw error;
      });
      const content: Record<string, unknown> = { profile };
      for (const collection of [
        "experience",
        "education",
        "skills",
        "projects",
        "achievements",
        "certifications",
      ] as Collection[]) {
        const rows: unknown[] = [];
        for (let page = 1; page <= 200; page++) {
          const result = await portfolio.list(collection, {
            page,
            limit: 50,
            sort: "asc",
          });
          rows.push(...result.data);
          if (!result.pagination.hasMore) break;
          if (page === 200)
            throw new AppError(
              503,
              "CONTENT_LIMIT",
              "The public content snapshot needs maintenance.",
            );
        }
        content[collection] = rows;
      }
      content.settings = await tx.siteSettings.findUnique({
        where: { id: "site" },
        select: { siteTitle: true, description: true, allowIndexing: true },
      });
      return {
        data: content,
        revision: createHash("sha256")
          .update(JSON.stringify(content))
          .digest("hex"),
      };
    },
    { isolationLevel: "RepeatableRead", timeout: 20000 },
  );
}
let build: Promise<void> | undefined;
let lastBuild: { state: string; finishedAt?: string } = {
  state: "Not run in this process",
};
export async function verifiedPublicPage(revision: string) {
  const receipt = JSON.parse(
    await readFile(resolve(publicDirectory, ".publication.json"), "utf8"),
  );
  const page = await readFile(resolve(publicDirectory, "index.html"), "utf8");
  if (
    receipt.revision !== revision ||
    receipt.htmlHash !== createHash("sha256").update(page).digest("hex")
  ) throw new Error("Public page requires rebuilding");
  return page;
}
export async function synchronizationStatus() {
  const current = await publicSnapshot();
  let verified = false;
  try {
    await verifiedPublicPage(current.revision);
    verified = true;
  } catch {
    /* no build */
  }
  return {
    current: verified,
    build: lastBuild,
    website:
      verified
        ? "Synchronized"
        : "Rebuild required; stale HTML is blocked",
    productionAutomation: "Hosting integration pending",
  };
}
export function rebuildPublicWebsite() {
  if (process.env.NODE_ENV === "test")
    throw new AppError(
      409,
      "TEST_BUILD_DISABLED",
      "Use the isolated publication harness for test builds.",
    );
  if (build) return;
  lastBuild = { state: "Building" };
  build = new Promise<void>((resolveBuild, reject) => {
    const child = spawn(
      process.execPath,
      [resolve(repository, "scripts/rebuild-public.mjs")],
      {
        cwd: repository,
        env: { ...process.env, NODE_ENV: "production" },
        stdio: "ignore",
        windowsHide: true,
      },
    );
    child.once("error", () => reject(new Error("Build failed")));
    child.once("exit", (code) =>
      code === 0 ? resolveBuild() : reject(new Error("Build failed")),
    );
  })
    .then(() => {
      lastBuild = {
        state: "Build completed; freshness checked separately",
        finishedAt: new Date().toISOString(),
      };
    })
    .catch(() => {
      lastBuild = {
        state: "Build failed. Retry or ask the maintainer for help.",
        finishedAt: new Date().toISOString(),
      };
    })
    .finally(() => {
      build = undefined;
    });
}
