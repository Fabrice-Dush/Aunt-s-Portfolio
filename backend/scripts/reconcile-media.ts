// Explicit local maintenance only. Never serves or prints private storage names.
import { lstat, readdir, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { getDatabase, disconnectDatabase } from "../src/config/database.js";
import { mediaRoot } from "../src/services/media.service.js";
try {
  const db = getDatabase();
  const referenced = new Set(
    (await db.mediaAsset.findMany({ select: { storageKey: true } })).map(
      (row) => row.storageKey,
    ),
  );
  const root = await lstat(mediaRoot).catch(() => null);
  if (root?.isSymbolicLink())
    throw new Error("Storage directory must not be a symbolic link");
  const orphaned: string[] = [];
  let missing = 0;
  for (const key of referenced)
    if (!(await lstat(resolve(mediaRoot, key)).catch(() => null))) missing++;
  for (const name of root ? await readdir(mediaRoot) : []) {
    if (!/^[0-9a-f-]{36}\.(?:pdf|webp)(?:\.original|\.small)?$/.test(name))
      continue;
    const info = await lstat(resolve(mediaRoot, name));
    const key = name.replace(/\.(original|small)$/, "");
    if (
      !info.isSymbolicLink() &&
      info.isFile() &&
      Date.now() - info.mtimeMs > 86400000 &&
      !referenced.has(key)
    )
      orphaned.push(name);
  }
  if (process.argv.includes("--remove-orphans")) {
    for (const name of orphaned) await unlink(resolve(mediaRoot, name));
  }
  console.log(
    JSON.stringify({
      missingFiles: missing,
      orphanedFilesOlderThanOneDay: orphaned.length,
      removed: process.argv.includes("--remove-orphans") ? orphaned.length : 0,
    }),
  );
} catch {
  console.error('Media reconciliation did not complete. Review storage and database availability.');
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
