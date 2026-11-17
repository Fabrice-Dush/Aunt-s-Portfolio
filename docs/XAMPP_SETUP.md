> **Current normal development access - 2026-11-17:** Two authorized synthetic temporary accounts are ready at http://localhost:5173/login. Use the distinct owner-only ignored .cache/development-dashboard-private/credentials.json and [current login/removal guide](DEVELOPMENT_DASHBOARD_TESTING.md). Both role redirects/logout passed focused Chromium checks; original 17 records, migration ledger and environment preserved. The old isolated session has been cleaned and its lock released. Historical isolated-only/no-development-account statements below describe the earlier checkpoint.

# Local XAMPP database setup (Windows)

Current workstation setup, 2026-11-16 (Europe/Paris). The authorized logical migration to XAMPP **127.0.0.1:3306** uses new healthy schemas. The damaged historical schemas were not reused, dropped or repaired. See [migration verification](XAMPP_3306_MIGRATION.md). Phase 9 owner/launch approval remains pending; Phase 10 has not started.

## Normal development

1. Open **XAMPP Control Panel**. Click **Start** beside **MySQL** if it is stopped. It should run on port **3306**. Apache is unnecessary for this Node/React project.
2. From this repository, run `npm run dev`. Alternatively, use `npm run dev:backend` and `npm run dev:frontend` in separate terminals.
3. Open `http://localhost:5173`. The API health endpoint is `http://localhost:4000/api/v1/health`.

Keep the existing ignored `backend/.env`; do not overwrite it with `.env.example`. No manual URL/password edits are needed. JWT and all non-database settings were preserved. The separate port-13312 process is **not required** and was stopped normally after verification.

The server uses the existing `C:/xampp/mysql/bin/mysqld.exe`, `C:/xampp/mysql/bin/my.ini` and `C:/xampp/mysql/data`. No XAMPP configuration, service registration, recovery mode or other project schema was changed. MariaDB reports its data directory as `\xampp\mysql\data\`; the inspected executable/config resolve this to the existing C: installation. A normal restart using that same configuration passed. Native Control Panel button automation was unavailable in the assistant session; the actual button clicks are not claimed as tested.

## Current isolated schemas and accounts

| Schema | Purpose | Scoped service account |
|---|---|---|
| `seraphine_portfolio_dev_x3306_20261116` | Recovered development content | `seraphine_x3306_dev`: SELECT, INSERT, UPDATE, DELETE |
| Same development schema + `seraphine_portfolio_shadow_x3306_20261116` | Reviewed Prisma migrations and disposable replay | `seraphine_x3306_migrate`: DML plus CREATE, ALTER, DROP, INDEX, REFERENCES, only these two schemas |
| `seraphine_portfolio_test_x3306_20261116` | Disposable integration/browser fixtures | `seraphine_x3306_test`: same migration privileges, only this test schema |

Accounts are restricted to `127.0.0.1`. Grants escape underscores literally, have no global administrative privileges and no GRANT OPTION. Passwords are private and are never command arguments or documentation. Express uses the DML account, never root. These are database service identities; **no real dashboard administrator was created**.

The old `seraphine_portfolio_dev`, `seraphine_portfolio_test` and `seraphine_portfolio_shadow` on port 3306 remain preserved damaged evidence. Never import into them. The diagnostic schema `seraphine_xampp_probe_20261116_a1` retains two tiny InnoDB tables/two synthetic rows as migration evidence; it is not application content. No existing database was dropped.

## Verification and migrations

```powershell
npm run db:verify -w backend
npm run prisma:validate
npm run test:db -w backend
npm run test:browser
npm run verify:database
```

Run the DB/browser/consistency suites sequentially; they share an exclusive test lock. The exact schema, account, port, MariaDB version, normal recovery mode and data-directory allowlist is in `scripts/local-database-targets.mjs`. Unknown targets and mixed profiles are refused. Fixtures refuse nonempty application tables and remove only recorded disposable IDs. Never delete a live test/build lock to bypass a refusal.

The migration CLI uses `MIGRATION_DATABASE_URL`, runtime uses `DATABASE_URL`, and both must name the same server/schema. `SHADOW_DATABASE_URL` names only the new disposable shadow. `npm run prisma:deploy -w backend` applies reviewed migrations; `npm run prisma:migrate -w backend` is for deliberately authored development migrations. Do not run a development reset, reinitialize a database, rerun the historical bootstrap, or seed merely to start this recovered workstation. No schema/model migration was changed for this move.

Production builds must use `npm run build`, followed by `npm run test:build -w frontend`. Serve built HTML through the existing freshness/integrity gate; deployment and ungated static hosting remain unauthorized.

## Backups and preserved fallback

Fresh logical SQL, original and candidate environments and private verification evidence are in the newly created owner-restricted directory:

`C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-16-xampp3306-01`

`recovered-development.sql` includes all 14 tables, all 16 development records and both full migration-history rows. Its SHA256 and import evidence are in the migration report. Private data, credentials and backups remain outside Git and source archives. Earlier preservation/export/offline backups were not overwritten; the historical 229-file offline snapshot was reverified.

The normal-mode recovered fallback remains at `127.0.0.1:13312`, using `C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-rehearsal-02/rehearsal.ini` and its existing data directory. Its records were unchanged by this migration. It is stopped, not deleted. Do not copy InnoDB/Aria files between installations or run either server against a preservation backup.

If rollback is needed, stop this project's application clients, privately verify and restore **only** `backend-before.env.private` from the **2026-11-16** directory above, and start the existing normal-mode port-13312 configuration. The allowlist retains its exact fallback profile. Never use `scripts/cutover-database.mjs rollback`: that historical command restores the pre-Phase-6 environment, not this migration's fallback. Historical rehearsal startup scripts refuse any running MariaDB process, so do not use them to bypass a concurrently running XAMPP instance; have the operator inspect/start the exact fallback configuration without changing either server's files. Rollback after new edits also needs a separately reviewed data reconciliation; the fallback does not automatically receive later XAMPP writes.

The recovery's level-6 historical freshness uncertainty and the first rehearsal's unexplained Aria failure remain documented in [the incident report](PHASE_06_DATABASE_INCIDENT.md). This move preserves the recovered state; it cannot prove transactions predating recovery were complete. Real ADMIN/SUPER_ADMIN access still requires separately authorized private provisioning under [the authentication guide](AUTHENTICATION.md); automated acceptance uses only temporary accounts in the isolated test schema.
