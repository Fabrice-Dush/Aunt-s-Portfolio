> **Current normal development access - 2026-11-17:** Two authorized synthetic temporary accounts are ready at http://localhost:5173/login. Use the distinct owner-only ignored .cache/development-dashboard-private/credentials.json and [current login/removal guide](DEVELOPMENT_DASHBOARD_TESTING.md). Both role redirects/logout passed focused Chromium checks; original 17 records, migration ledger and environment preserved. The old isolated session has been cleaned and its lock released. Historical isolated-only/no-development-account statements below describe the earlier checkpoint.

# Temporary isolated dashboard testing — 2026-11-16

The representative authorized one disposable ADMIN and one disposable SUPER_ADMIN in the existing XAMPP test schema. These are synthetic test identities, not client accounts. Phase 9 owner/launch approval remains pending; Phase 10 has not started.

## Log in

Use **http://127.0.0.1:5186/login** for both roles. Use `127.0.0.1` exactly: it matches mandatory Origin validation and separates test cookies from normal `localhost:5173` development.

| Role | Email | Dashboard |
| --- | --- | --- |
| ADMIN | `manual-studio@example.invalid` | http://127.0.0.1:5186/admin — light Portfolio Studio |
| SUPER_ADMIN | `manual-operations@example.invalid` | http://127.0.0.1:5186/super-admin — dark System Operations |

Open `.cache/manual-dashboard-private/credentials.json` **locally in your editor** to retrieve the corresponding passwords. The ignored folder has inheritance disabled and permits only your Windows identity and SYSTEM. Each role has a unique random 32-byte password. No password, signing key or session token is printed in reports or stored in tracked files. Do not paste the file into chat or share screenshots of it.

Enter the email and corresponding password, then select **Sign in**. ADMIN's mandatory first-password change was completed during setup through the protected endpoint; the initial temporary password was discarded. Use the current password in the private file. Authentication rules remain active.

Sign out before switching roles in one browser profile. To compare dashboards simultaneously, use separate profiles or a normal window and an InPrivate/Incognito window. Two ordinary tabs share cookies and one role/session.

The test schema starts without portfolio content, so empty profile/inventory/messages states are expected. Use disposable content/uploads only. The normal development website remains separately configured for `http://localhost:5173`; `npm run dev` does not start this test instance.

## Confirm isolation

Open **http://127.0.0.1:5186/__manual-test-environment**. It must show `environment: isolated-test`, database `seraphine_portfolio_test_x3306_20261116`, MySQL port `3306`, API port `4416`, and frontend origin `http://127.0.0.1:5186`.

The API binds only to `127.0.0.1:4416`. Vite binds only to `127.0.0.1:5186` and proxies `/api` exclusively to that API. The launcher sets test DB URLs, a fresh signing key, test media storage and isolated build/cache settings in its own process. It never rewrites `backend/.env`, normal Vite configuration, production settings, schemas or migration SQL.

It reuses exact account/schema/port/instance/recovery-mode guards, the shared exclusive `.cache/phase08-testdb.lock`, initially-empty refusal and captured-ID cleanup. **Do not run database/browser/consistency suites against the shared test schema while this fixture is active. Never delete a live lock.**

Provisioning calls the existing audited `accountsService().bootstrap` implementation used by the trusted-local CLI, with generated private credentials. It does not directly insert privileged users. ADMIN creation uses authenticated `/api/v1/administrators` with maintainer password reauthentication. Forced replacement uses `/auth/change-password` and verifies session invalidation. Argon2id, JWT, CSRF, cookies, role guards, rate limits and auditing remain unchanged.

Preparation records read-only all-field fingerprints of development tables and the full migration ledger. Development currently has **17 rows**: the 16 recovered records plus one pre-existing contact message. All are preserved; message contents are not printed. Cleanup compares those full fingerprints and the exact environment-file hash again.

## Remove the temporary accounts

From the repository root in your own terminal:

```powershell
node --import tsx scripts/manual-dashboard-test.mjs cleanup
```

The running fixture closes its frontend/API, captures owned IDs, then removes only captured rows in the exact test schema: both accounts, sessions/audits and disposable content created during the exclusive manual session. It removes captured test uploads and private credential/state files, verifies all 13 application tables are empty, then releases the shared lock. Both migration rows remain; development is untouched. Close the manual-test browser windows afterward.

Do not reset/truncate databases, manually delete users with SQL, or delete a lock to bypass cleanup. Ctrl+C in the fixture's own interactive terminal requests the same cleanup. After abrupt termination, the cleanup command supports guarded offline removal of recorded IDs only. Unknown rows, a mismatched lock or changed preservation evidence cause refusal; preserve the lock/state and inspect instead of forcing deletion. Accounts persist until cleanup; no automatic account expiry is implied.

To start a fresh session after cleanup, with XAMPP MySQL running:

```powershell
node --import tsx scripts/manual-dashboard-test.mjs start
```

Keep that terminal open. Startup requires the owner-restricted private directory, refuses occupied ports/nonempty test tables/a held lock, and generates new credentials. If the private directory was removed, recreate it and restrict its ACL to your Windows identity and SYSTEM; the launcher refuses unrestricted permissions.

Optional status and focused verification:

```powershell
node --import tsx scripts/manual-dashboard-test.mjs status
node scripts/manual-dashboard-verify.mjs
```

The default verification checks Chromium only, leaving more of the unchanged login-rate budget for manual testing. `--all-browsers` also checks installed Chrome and Edge; avoid repeatedly running automated sign-ins during manual testing. Focused verification passed both roles in all three fresh profiles: frontend proxy/test identity, correct dashboard, role guards, cookies and logout. Credentials are blocked from HTTP filesystem serving. Non-secret reports are `.cache/manual-dashboard-verification.json` and `.cache/manual-dashboard-verification-all-browsers.json`. Native browser control was unavailable; your actual open browser profile was not controlled. This focused verification does not replace the historical migration compatibility report or establish a complete new browser/accessibility pass.
