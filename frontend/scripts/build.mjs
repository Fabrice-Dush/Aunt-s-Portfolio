import { spawnSync } from "node:child_process";
import { mkdir, open, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const frontend = fileURLToPath(new URL("../", import.meta.url));
const root = resolve(frontend, "..");
const output =
  process.env.PORTFOLIO_BUILD_TEST === "1" ? ".cache/test-public" : "dist";
await mkdir(resolve(frontend, ".cache"), { recursive: true });
const lockPath = resolve(frontend, ".cache/public-build.lock");
const lock = await open(lockPath, "wx");
try {
  for (const [cwd, args] of [
    [root, ["--import", "tsx", "backend/scripts/export-public.ts"]],
    [frontend, [resolve(root, "node_modules/typescript/bin/tsc"), "-b"]],
    [
      frontend,
      [
        resolve(root, "node_modules/vite/bin/vite.js"),
        "build",
        "--outDir",
        output,
      ],
    ],
    [frontend, ["scripts/prerender.mjs"]],
  ]) {
    const run = spawnSync(process.execPath, args, {
      cwd,
      env: { ...process.env, NODE_ENV: "production" },
      stdio: "inherit",
      windowsHide: true,
    });
    if (run.status !== 0)
      throw new Error(
        "Public build failed; existing HTML must pass the freshness gate before serving.",
      );
  }
} finally {
  await lock.close();
  await unlink(lockPath);
}
