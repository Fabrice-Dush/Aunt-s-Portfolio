import { mkdir, writeFile } from "node:fs/promises";
import { publicSnapshot } from "../src/services/public-site.service.js";
import { disconnectDatabase, databaseOptions } from "../src/config/database.js";
try {
  if (process.env.PORTFOLIO_BUILD_TEST === "1") {
    const target = databaseOptions(process.env.DATABASE_URL);
    if (
      target.database !== "seraphine_portfolio_test" ||
      target.user !== "seraphine_test" ||
      !["127.0.0.1", "localhost"].includes(target.host)
    )
      throw new Error("Refusing test snapshot outside the isolated database");
  }
  const snapshot = await publicSnapshot();
  await mkdir(new URL("../../frontend/.cache/", import.meta.url), {
    recursive: true,
  });
  await writeFile(
    new URL(
      process.env.PORTFOLIO_BUILD_TEST === "1"
        ? "../../frontend/.cache/test-public-content.json"
        : "../../frontend/.cache/public-content.json",
      import.meta.url,
    ),
    JSON.stringify(snapshot),
  );
  console.log("Exported only published public DTOs.");
} catch {
  console.error('Public content export failed. Check database availability and approved configuration.');
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
