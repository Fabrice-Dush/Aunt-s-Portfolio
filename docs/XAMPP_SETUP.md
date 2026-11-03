# Local XAMPP database setup (Windows)

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
