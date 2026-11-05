# Handoff - Phase 6 COMPLETED; Phase 7 awaits authorization

**Resume here, before historical instructions below:** Phase 6 COMPLETED after explicitly authorized dedicated development cutover and final acceptance. Actual backend/.env now targets normal-mode MariaDB 10.4.32 at 127.0.0.1:13312, private 2026-11-05-rehearsal-02/data; only four database URL lines changed, with JWT and all unrelated bytes preserved. Complete owner-restricted offline snapshot and original .env backup verified at C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-pre-cutover-01. All 28 dev/test tables and 16 recovered records, migrations/drift/shadow replay, 11 DB + 18 auth scenarios, TypeScript/tests/production builds/API/artifact checks and two post-cutover workload restarts passed. Shared XAMPP data/data-old, unrelated databases, original backups and 176 private export files remain unchanged. Dedicated instance left running; XAMPP Control Panel does not manage it. Level-6 freshness remains unproven; first-rehearsal Aria failure remains unexplained and retained. No real administrator accounts. Manual browser QA remains deferred. Phase 7 NOT STARTED. See docs/PHASE_06_DATABASE_INCIDENT.md, docs/PHASE_06_VERIFICATION.md and docs/XAMPP_SETUP.md. Do not repeat recovery, initialization or cutover; use documented start/stop commands.

**Updated:** 2026-11-05 (Europe/Paris). The user's explicit Phase 6 request supersedes older startup restrictions. Do not restart earlier phases or overwrite current uncommitted work. Phase 7 NOT STARTED.

Read PROJECT_STATUS.md, docs/PHASE_06_VERIFICATION.md, docs/PHASE_06_DATABASE_INCIDENT.md and docs/XAMPP_SETUP.md first. Development now uses the adopted port-13312 normal-mode database; it was left running after final restart and acceptance. Do not rerun snapshot/configure/recovery operations or the suspended historical shared-XAMPP restart instructions. Next work needs Phase 7 authorization or an explicit manual-QA request.

## Historical pre-incident verification instructions - suspended

After MySQL is running, first run `npm run db:verify -w backend` from the repository root. Confirm original dev record counts and both applied migrations. For a read-only live schema comparison, run `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma` from backend/. Inspect the separate disposable shadow state before retrying replay; the failed replay is not evidence of dev data loss. Do not repeatedly run a failing reset against an unknown schema. Resolve or precisely document any remaining migration-engine/server limitation before completion.

Already passed: npm test (6 structure, 14 frontend, 14 backend unit/service, 7 HTTP), test:db (11 public + 18 authentication scenarios), both typechecks/builds, four artifact tests, dev/production HTTP 42/7 and compiled 200/400/413, additive migration deployment and zero-audit result. DB tests use exact local test schema/account, reject application data and clean only IDs created by the run. Do not run two DB suites concurrently. Synthetic test passwords are generated in memory; no real accounts exist.

## Implementation

- Backend route → controller validation → service → shared Prisma. AuthSession stores only refresh hashes. Every protected request rereads current session/account/role. Short JWTs do not permit continued access after revocation.
- Exact trusted Origin plus X-Portfolio-Request header protects all mutations including login/refresh/logout. HttpOnly/Strict/production Secure cookies. No wildcard/missing-Origin exception or localStorage tokens.
- Credential/session mutations lock the target user and transactionally audit changes. Refresh replay revokes the whole session; no grace window. Session cap ten, absolute lifetime seven days. Password changes revoke all sessions and force sign-in again.
- SUPER_ADMIN local CLI bootstrap only; ADMIN account workflows require maintainer reauthentication. No role changes or SUPER_ADMIN management through HTTP. New/recovered accounts must change password before seeing protected content.
- CLI: auth:key, auth:bootstrap, auth:recover, auth:cleanup. Existing backend/.env is preserved; key is already configured. Never print/package it or real credentials. Real account setup is left to the authorized people using a private TTY.
- Frontend features/auth owns login/API/route gate; features/dashboard owns read-only views, account controls, administrator management and isolated CSS. Public App unchanged. Private module dynamic import; public prerender remains. Generated route shells contain no authenticated data. Same-origin deployment required.
- Prisma CLI/Client/adapter now pinned together at 7.10.1, compatible security patch after six advisories in inherited 7.10.0 tree. Do not move to Prisma 8; preserve the updated lockfile.

## Browser and deployment debt

Browser/native hosts were unavailable. No interactive/visual responsive passes, cross-browser results or Lighthouse scores. Follow the seven-viewport Phase 6 checklist and preserve the exact Phase 4 manual checklist. Maintain light owner Studio and dark Operations; synthetic portrait not newly inserted into private views. Final comprehensive visual/UX revamp is still planned.

Production needs trusted HTTPS same-origin frontend/API, proxy/rate-limit review, secret distribution, browser cookie/CSRF verification, deployment backups and monitoring. In-process rate limits are for the current single-process application; shared hosting scaling needs shared storage. No email setup or infrastructure-secret dashboard.

## Phase 7 next, only after authorization

Build validated CMS editing/concurrency/publishing on these guards; keep edits draft and explicit owner consent rules. Add approved media/contact workflows and safe public snapshot rebuilds without hurting first paint. No fake editing controls are shipped in Phase 6. Preserve owner portrait/contact/credential/date approvals, genuine projects/achievements and retention-policy review.

## Delivery

Phase 6 delivery is `seraphine-portfolio-phase-06-complete.zip` in the repository parent. The full-source packager verifies required files, credential exclusions, CRC, extraction and every source hash. Private receipt and final response carry exact count/size/SHA256. The old review snapshot is retained. No deployment, real account provisioning or Phase 7 authorization is implied.
