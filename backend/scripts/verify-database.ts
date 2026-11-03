import { createDatabase, databaseOptions } from '../src/config/database.js';

const runtime = createDatabase(process.env.DATABASE_URL);
const migration = createDatabase(process.env.MIGRATION_DATABASE_URL);
try {
  const options = databaseOptions(process.env.DATABASE_URL);
  if (options.database !== 'seraphine_portfolio_dev' || options.user !== 'seraphine_dev') throw new Error();
  const [identity] = await runtime.$queryRaw<{ version: string; db: string; port: number }[]>`SELECT VERSION() AS version, DATABASE() AS db, @@port AS port`;
  const privileges = await runtime.$queryRaw<{ PRIVILEGE_TYPE: string }[]>`SELECT PRIVILEGE_TYPE FROM information_schema.SCHEMA_PRIVILEGES`;
  if (privileges.map(row => row.PRIVILEGE_TYPE).sort().join(',') !== 'DELETE,INSERT,SELECT,UPDATE') throw new Error();
  // Never print SHOW GRANTS: MariaDB can include a password hash in its result.
  for (const [client, allowed] of [[runtime, ['seraphine_portfolio_dev']], [migration, ['seraphine_portfolio_dev', 'seraphine_portfolio_shadow']]] as const) {
    const grants = await client.$queryRawUnsafe<Record<string, string>[]>('SHOW GRANTS');
    for (const record of grants) {
      const grant = Object.values(record)[0];
      if (grant.startsWith('GRANT USAGE ON *.*')) continue;
      if (!allowed.some(name => grant.includes(` ON \`${name.replaceAll('_', '\\_')}\`.* TO `)) || grant.includes('WITH GRANT OPTION')) throw new Error();
    }
  }
  const history = await runtime.$queryRaw<{ migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }[]>`SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations`;
  if (!history.length || history.some(row => !row.finished_at || row.rolled_back_at)) throw new Error();
  console.log(JSON.stringify({ ...identity, port: Number(identity.port), runtimePrivileges: privileges.map(row => row.PRIVILEGE_TYPE), migrationScopesVerified: true,
    migrations: history.map(row => row.migration_name),
    counts: { profile: await runtime.profile.count(), experience: await runtime.experience.count(), education: await runtime.education.count(),
      skills: await runtime.skill.count(), certificates: await runtime.certificate.count(), projects: await runtime.project.count(),
      achievements: await runtime.achievement.count(), users: await runtime.user.count(), messages: await runtime.contactMessage.count() } }, null, 2));
} catch { console.error('Database verification failed. No credentials or grant hashes logged.'); process.exitCode = 1; }
finally { await Promise.all([runtime.$disconnect(), migration.$disconnect()]); }
