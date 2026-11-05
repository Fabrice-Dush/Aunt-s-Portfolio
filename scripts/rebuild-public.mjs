// Deployment-independent, fixed-command build interface. No caller-supplied commands/paths.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const code = await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, ["frontend/scripts/build.mjs"], {
    cwd: root,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "inherit",
    windowsHide: true,
  });
  child.once("error", reject);
  child.once("exit", resolve);
});
if (code !== 0) process.exitCode = 1;
