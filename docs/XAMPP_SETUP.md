# Local XAMPP database setup (Windows)

> **Verified restored development environment - 2026-11-05:** Phase 6 COMPLETED. The user-authorized dedicated normal-mode instance at 127.0.0.1:13312 passed all configured connection, migration/shadow, content/constraint, DB/auth/API/build and restart checks. It is left running. Shared XAMPP data/data-old, unrelated databases, preservation backups and exports remain unchanged. No Windows service installed. See the current workstation lifecycle below; historical port-3306 provisioning is not its startup procedure. Level-6 recovery freshness and first-rehearsal failure limits remain in the incident report.

## Dedicated database on this workstation

The user authorized adopting the clean second rehearsal as the actual local development database. It uses the existing `C:/xampp/mysql/bin/mysqld.exe` binary, loopback **127.0.0.1:13312**, normal mode **innodb_force_recovery=0**, and `C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-rehearsal-02/rehearsal.ini` with its own `data` directory. The directory keeps its rehearsal name to avoid moving verified system/tablespace files. It is a freshly initialized normal-mode instance, not the level-6 recovery clone. No Windows service was installed; XAMPP Control Panel does not manage this dedicated process.

The four local database URLs now use the existing scoped dev/migration/test accounts on this port. The JWT signing key and every unrelated environment setting are preserved. Never copy private credentials from the backup into documentation or command arguments. Shared XAMPP `data`/`data-old`, unrelated databases, preservation backups and extraction exports remain untouched. Keep the shared XAMPP MySQL instance stopped during this development workflow.

Before cutover, the complete stopped instance (229 files / 187,752,520 bytes), config, private service credentials and exact original environment were copied into the owner-restricted directory `C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-pre-cutover-01`. Its `data` is a full offline snapshot; `backend.env.private` is the original environment. All copied hashes and directory membership were verified. `snapshot-manifest.json` SHA256: `65B830893F0BB242745937993A8B6AFF8FDE3A6C782B1EA16EC6FA01F1289EF1`. This directory and all recovery data stay outside source/ZIP.

From the repository root, start only when the dedicated process is stopped:

```powershell
$label = 'dev-' + (Get-Date -Format 'yyyyMMddHHmmss')
.\scripts\restart-database-rehearsal.ps1 -Attempt 02 -Label $label
npm run db:verify -w backend
npm run dev
```

The start script refuses running database processes, occupied ports, unexpected config and existing output names. It uses a hidden process and private timestamped console logs. Status is verified through the scoped `db:verify` command rather than the XAMPP panel.

Stop application clients first. To verify privilege-table health and request normal database shutdown:

```powershell
$env:SERAPHINE_REHEARSAL_ATTEMPT = '02'
node scripts/checkpoint-database-rehearsal.mjs ('dev-stop-' + (Get-Date -Format 'yyyyMMddHHmmss'))
```

Wait for the MariaDB process to exit before making an offline backup or restarting. Do not force-terminate it or delete/regenerate InnoDB/Aria files if shutdown/startup fails. Preserve logs and stop for diagnosis. The first discarded rehearsal's unexplained privilege-table failure remains documented in [the rehearsal report](PHASE_06_RESTORATION_REHEARSAL.md).

Rollback stops application clients, verifies the saved snapshot/environment hashes, restores the exact original environment via `node scripts/cutover-database.mjs rollback`, and stops only the verified dedicated instance normally. This restores the old configuration, not the damaged shared database's health. Never merge files or overwrite retained evidence to roll back data.

A source ZIP deliberately cannot recreate private local data/credentials. On another machine, review the fresh-machine procedure below and provision a separate healthy database with private credentials; the hardcoded incident/cutover scripts are for this workstation only. Do not rerun `setup-local-db.mjs`, recovery extraction, snapshot initialization or seeding against this restored workstation merely to start it.

## Historical shared-XAMPP / fresh-machine setup

The following describes the earlier port-3306 setup and fresh-machine provisioning. It must not be used to replace the configured dedicated workstation above.

Verified 2026-11-03: `C:\xampp\mysql\bin\mysqld.exe`, MariaDB **10.4.32**, TCP **127.0.0.1:3306**, configuration `C:\xampp\mysql\bin\my.ini`. Existing server already running; no additional server, PHP, Apache or XAMPP service/configuration changes were made. Initial inspection found no project databases/accounts. Local root access was used only to provision scoped accounts; Express never runs as root.

| Database | Purpose | Account |
|---|---|---|
| seraphine_portfolio_dev | Development content | seraphine_dev: SELECT, INSERT, UPDATE, DELETE |
| seraphine_portfolio_dev + seraphine_portfolio_shadow | Development migration/replay | seraphine_migrate: DML plus CREATE, ALTER, DROP, INDEX, REFERENCES on these two schemas only |
| seraphine_portfolio_test | Isolated integration fixtures/migration replay | seraphine_test: same migration privileges, test schema only |

All accounts are limited to `127.0.0.1`; no GRANT OPTION or global administrative privilege. Schema grants escape underscores as literal characters, preventing wildcard scope. Three independent cryptographically random 32-byte passwords are saved only in ignored `backend/.env`. utf8mb4 and utf8mb4_unicode_ci are set on all databases/tables. Do not print SHOW GRANTS: MariaDB can include an authentication hash.

## On this configured machine

From repository root:

```powershell
npm run db:verify -w backend
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate -w backend
npm run prisma:seed -w backend
npm run test:db -w backend
npm run dev
```

Do not rerun the bootstrap: it intentionally refuses configured environments/existing project databases/accounts. Do not copy `.env.example` over this machine's real `.env`. The seed may be rerun: existing data is untouched. `db:verify` safely reports version, target, privilege names, migration IDs and counts, never passwords or grant hashes.

## Reproduce on a fresh local machine

1. Use the installed XAMPP Control Panel. If MySQL is stopped, click **Start** beside MySQL and wait for running status. Apache is unnecessary. Inspect `mysql/bin/my.ini` and confirm port/process before connecting. The bootstrap intentionally targets the verified standard local address/port; adapt its explicit constants only after inspecting another machine.
2. Run `npm ci`. Create `backend/.env` from `.env.example` only if no real environment file already exists. The bootstrap refuses non-placeholder DATABASE_URL.
3. With local DB administration authority, run `node backend/scripts/setup-local-db.mjs`. It checks all three names and accounts before changing anything, creates schemas/accounts, assigns exact grants, and writes generated credentials privately. It never drops/resets existing data. Existing names require inspection and explicit reconciliation, not rerunning blindly. On failure, credentials may already have been saved before DDL; inspect state without printing secrets.
4. If the administrator account requires a password, enter it via a hidden prompt for this process, never a command-line argument or committed file:

```powershell
$adminSecret = Read-Host 'Local MariaDB root password' -AsSecureString
$secretPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminSecret)
try {
  $env:LOCAL_DB_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($secretPointer)
  node backend/scripts/setup-local-db.mjs
} finally {
  Remove-Item Env:LOCAL_DB_ADMIN_PASSWORD -ErrorAction SilentlyContinue
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($secretPointer)
}
```

5. Validate/generate; review `backend/prisma/migrations/*/migration.sql`; verify target and any existing tables before applying `npm run prisma:deploy -w backend`. For developing subsequent migrations use `prisma:migrate`, which uses the dedicated shadow database. Seed, verify connectivity/privileges, then test/build. Never run migrate reset against development or an unknown database.

If root administration is unavailable, the local administrator should run the same reviewed bootstrap privately. Do not send credentials in chat. Usernames/host/port/database can be shared for diagnosis; passwords and full URLs cannot.

The CLI selects MIGRATION_DATABASE_URL and runtime selects DATABASE_URL. They must target the same database; only account privileges differ. SHADOW_DATABASE_URL must target a different dedicated disposable schema. URL-encode reserved password characters (`@` → `%40`, `:` → `%3A`, etc.); runtime explicitly decodes credentials. Current local parser rejects URL query options rather than silently ignoring them. Generated hex passwords need no extra escaping.

## Integration-test safety

`npm run test:db -w backend` requires TEST_DATABASE_URL with local host, exact `seraphine_portfolio_test` database and `seraphine_test` username, different from runtime URL. It applies migrations with the test account and supplies isolated environment variables to the child process. It never uses the development or shadow database for fixtures. The suite independently checks the target and refuses nonempty application tables; it never resets/truncates anything. Teardown removes only IDs created by that run in dependency order. An interrupted run may require manual inspection of leftover TEST ONLY fixtures; do not automate a broad cleanup to bypass the guard. No fixture is a client claim.

## Reference guidance checked

- [Prisma 7 MySQL/MariaDB and official adapter](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql)
- [Prisma 7 shadow database configuration](https://www.prisma.io/docs/orm/v7/prisma-migrate/understanding-prisma-migrate/shadow-database)
- [MariaDB GRANT documentation](https://github.com/mariadb-corporation/mariadb-docs/blob/main/server/reference/sql-statements/account-management-sql-statements/grant.md)

The existing pinned Prisma versions and lockfile were preserved. XAMPP is a development environment; production hosting, TLS, backups and account hardening are later deployment work.
