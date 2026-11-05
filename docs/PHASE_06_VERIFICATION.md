# Phase 6 — authentication, authorization and dashboards

> **Final acceptance - 2026-11-05:** Phase 6 COMPLETED following separately authorized dedicated development cutover. Actual configured port-13312 connections, migrations/drift/shadow replay, all restored records/constraints, real DB/auth suites, final source/type/build/API/artifact checks and two normal workload shutdown/restarts passed. Original shared XAMPP/backup/export files remain untouched; only four local database URL lines changed, preserving JWT and all other bytes. No real accounts. Browser QA remains explicitly deferred; Phase 7 NOT STARTED. See the final cutover section in PHASE_06_DATABASE_INCIDENT.md and current lifecycle in XAMPP_SETUP.md.

**Date:** 2026-11-05 (Europe/Paris). **Status: COMPLETED - critical automated acceptance and authorized development cutover verified; manual browser QA deferred.** Nothing deployed; Phase 7 not started.

The explicit Phase 6 request authorized this work and supersedes older instructions saying Phase 6 has not started. The inherited working tree was clean. Required startup/memory files, README, Phase 4/5 evidence, actual source/tests/schema, dashboard prototypes and approved light/dark dashboard screenshots were reviewed before implementation. No public redesign or invented client content.

## Final actual development acceptance - 2026-11-05

A complete stopped instance snapshot, configuration, private service credentials and original `backend/.env` were preserved and hash-verified in owner-restricted `C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-pre-cutover-01` before configuration changed. Snapshot: **229 files / 187,752,520 bytes**, plus exact original environment backup; all snapshot hashes were verified again after acceptance. Snapshot-manifest SHA256: `65B830893F0BB242745937993A8B6AFF8FDE3A6C782B1EA16EC6FA01F1289EF1`.

The adopted fresh normal-mode instance uses the existing MariaDB 10.4.32 binary and `C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-rehearsal-02/data` at loopback port **13312**, recovery mode **0**. Only DATABASE_URL, MIGRATION_DATABASE_URL, TEST_DATABASE_URL and SHADOW_DATABASE_URL changed in local `.env`; all unrelated bytes and the JWT signing configuration are preserved. All four actual configured service-account connections verified the exact private datadir/port/version/mode and retained access after both final workload restarts.

Final Prisma validate, dev/test migration status, live-to-model drift on all three schemas and migration-directory-to-live replay through the known empty disposable shadow passed. Both completed dev/test migration checksums match source; fresh deployment history is retained. Shadow is rebuilt from migrations, not recovered damaged files; its ephemeral replay state has 13 empty application tables without a deployment ledger.

Final integration: **11 database scenarios** (runner 12 including parent) and **18 auth/authorization/session/dashboard HTTP scenarios** (runner 19), zero failures/skips, recorded fixtures cleaned. Final source suites passed: **6 structural, 14 frontend and backend runner 22** (14 service/unit + 7 HTTP + parent), zero failures/skips. Both TypeScript checks/builds, real prerender, four production artifact/privacy/budget tests, runtime account scopes, eight compiled public/health endpoints, seven compiled private guest denials and seven neutral private route shells/assets passed.

After the DB/auth workload and again after all compiled/application checks, privilege tables checked OK and normal shutdown completed without forced termination. Each restart retained all four accounts and all recovered dev/test data. Final validation confirms **14 dev + 14 test tables**, **16 unchanged development records**, zero test application rows, two completed migrations per dev/test, six foreign keys/five explicit domain checks per schema and no duplicate unique/primary-key groups. Every portfolio table remained readable without #1932. No first-rehearsal privilege error recurred in the adopted instance.

The actual configured application passed seven recovered-content public routes and eight read-only dashboard content services, publication/privacy filtering and guest denial. Authenticated role/API acceptance used synthetic users only in the isolated test schema; no real development administrator/login was created. Public portfolio and dashboard source/assets hash-match the pre-cutover baseline. The public React portfolio remains static-first; Phase 7 API/content integration is not implied.

Private evidence: `pre-cutover-01/acceptance/` contains final test/build/API logs, configuration/connection reports, unchanged public-source report and `final-acceptance.json`; adopted instance directory contains `validation-cutover-*`, checkpoint/startup logs and `protection-cutover.json`. All original XAMPP/preservation/config hashes and 176 private extraction-file hashes remain unchanged. The dedicated database is left running after final acceptance. Secrets, data, backups and these private logs remain outside the ZIP.

Level 6 skipped redo: successful import, constraints and tested persistence cannot prove all original committed transactions were recovered. The first rehearsal's new mysql.db Aria failure remains unexplained and retained as evidence. Shared XAMPP itself remains preserved/unrepaired. These limits and deferred manual browser acceptance are explicitly carried forward; no full external security-audit or visual-pass claim is made.

## Implemented

Argon2id password hashing, JOSE JWT access/refresh cookies, absolute-expiry server sessions, rotation/replay revocation, logout, password replacement, live account/role/session checks, CSRF, login/action limits, safe provisioning/recovery, audit events and session cleanup. ADMIN account creation/status/recovery/session controls require current SUPER_ADMIN password. No public signup, role changes, bootstrap route, default passwords or real accounts created.

Light Portfolio Studio and distinct dark System Operations are working React feature modules backed by authenticated APIs. Read-only profile, experience, education, skills, projects, achievements, certifications and messages; true counts/publication states; empty/loading/error states; account settings and confirmations. Technical interface adds regular administrator management, audits and live on-demand database status. Content editing/publishing, uploads/contact delivery and personalized email remain out of scope. See AUTHENTICATION.md for endpoints, procedures and policies.

Public App, CSS, content, portrait assets and approved design references remain unchanged. Private code/CSS are lazy-loaded only on workspace routes. The same public tree is prerendered/hydrated; neutral generated private HTML shells contain no private data. No tokens use localStorage/sessionStorage. No owner credentials were entered by the agent; the configured local signing key is generated in ignored backend/.env and never printed.

## Database and dependencies

Verified existing XAMPP MariaDB 10.4.32 and exact runtime/migration grants before migration. `20261104090000_phase06_sessions` adds User.mustChangePassword, nullable unique bootstrapSlot and AuthSession with hash/timestamps/indexes/FK. No data deletion/reset or seeded accounts. Dev and test migrations applied successfully. Existing twelve-model data preserved; auth adds the thirteenth model.

Prisma CLI/Client/MariaDB adapter patched together from 7.10.0 to **7.10.1** because the inherited dependency tree reported six advisories. The compatible patch resolved the audit to zero; Prisma 7 and MariaDB architecture retained. Added argon2 0.45.2 and jose 6.2.15 in the lockfile. No frontend runtime dependency was added.

Pre-final dev verification: profile 1, experience 2, education 3, skills 6, certificates 3; users/projects/achievements/messages 0. All integration fixtures were isolated to the exact test schema/account and cleaned by recorded IDs; no real credentials in fixtures. Test runner refuses pre-existing application rows.

## Executed checks

| Check | Result |
|---|---|
| Baseline npm test | PASS: 6 structure, 10 frontend, 8 backend service/unit and 7 HTTP scenarios |
| Baseline local DB verification | PASS: MariaDB version, scope, migration, expected data; zero users |
| Final npm test | PASS: 6 structure, 14 frontend, 14 backend unit/service and 7 HTTP scenarios (backend runner 22 including parent) |
| Real Phase 5 DB regression | PASS: 11 scenarios, no skips |
| Real Phase 6 DB/HTTP acceptance | PASS: 18 scenarios, no skips (runner 19 including parent) |
| Both workspace TypeScript checks | PASS |
| Both production builds | PASS; real prerender and compiled Express output |
| Production frontend artifact checks | PASS: 4 scenarios, including empty private shells/lazy chunks |
| Development/production HTTP assets | PASS: 42 dev and 7 production requests |
| Compiled API liveness/parser regression | PASS: 200 health, 400 invalid JSON, 413 oversized JSON |
| Compatible patch dependency audit | PASS: zero reported vulnerabilities |
| Dev/test additive migration deployment | PASS |
| Compiled Phase 6 guards/private routes | PASS: seven guest denials/no-store, foreign-Origin rejection, seven neutral direct-route shells/assets |
| Prisma schema validation | PASS on 7.10.1 |
| Shadow replay / drift | PASS after authorized actual development cutover, including drift/replay and normal restart/data validation. Historical shared-XAMPP failure remains documented. |
| Browser host/native computer use | UNAVAILABLE; no browser or native pipe |
| Seven-viewport interaction/visual QA | NOT RUN; manual checklist below |
| Chrome/Edge/Firefox/Safari and Lighthouse | NOT RUN; no compatibility/performance scores claimed |
| Complete ZIP | Full current eligible source/design/docs/migrations/tests; CRC, exclusions, actual extraction and every source hash verified by delivery packager |

Tests exercise real password hashing, signature/algorithm/issuer/audience/purpose/expiry validation, weak input/role injection, production cookie configuration, mandatory CSRF Origin/header, generic failed logins, successful login, forced replacement, all role boundaries, current DB role changes, stored private drafts/messages, actual counts, refresh rotation/replay/concurrency, logout, own session ownership, account disable/reactivation/recovery, absolute DB expiry, local maintainer recovery, audits and login rate limiting. Frontend tests execute login/dashboard rendering, distinct navigation/temporary-password restriction, coalesced refresh and rejection without replay of wrong reauthentication passwords. They do not execute browser layout, focus or pointer interaction.

Build sizes at verification: public HTML **12,526 bytes**; public entry JS **75.39 kB gzip**, public CSS **4.58 kB gzip**; private workspace JS **8.59 kB gzip**, CSS **3.35 kB gzip**, loaded only on workspace routes. These are artifact transfer-size estimates, not LCP/INP/CLS measurements.

## Issues detected and addressed

- Windows sandbox blocked Node subprocesses (EPERM). Approved execution outside it passed; no unrelated process/service/config changes.
- Prisma create-only command declined interactive unique-constraint confirmation in noninteractive mode. Wrote/reviewed the additive DDL explicitly, then deployed it normally; no db push/reset.
- Argon2 options inferred an overly broad numeric type; narrowed with as const, then typechecks passed.
- Added no-discovery/no-WebSocket settings to independent Vite SSR test servers to prevent shared-port noise and dependency-scan teardown errors. All 14 frontend tests then passed without those warnings.
- Wrong reauthentication passwords initially triggered an unnecessary session retry; client now retries only UNAUTHENTICATED session errors, verified by a targeted test.
- Clean private URLs initially received Vite preview's public SPA fallback. Added private-shell preview mapping; the compiled/static HTTP harness then passed. Hosting must use the documented private shell mapping too.
- Historical shared-XAMPP shadow replay lost its connection and port 3306 became unavailable. Subsequent extraction and two clean rehearsals are documented separately. Rehearsal 02 now passes shadow replay and restart/data validation. The first rehearsal privilege-table failure remains unexplained; do not infer an application cause or reset active databases. The separately authorized dedicated development cutover and final acceptance subsequently passed; shared XAMPP remains untouched.

## Manual browser acceptance to carry forward

Keep the exact Phase 4 checklist in PHASE_04_VERIFICATION.md. In addition, at **320, 375, 390, 768, 1024, 1440 and 1920px**:

1. Compare the light owner Studio and dark technical Operations with docs/visual-approval. Check long names, empty states, every content area, account forms, security list and dialogs for clipping/overflow.
2. Verify login, direct `/admin/account` and `/super-admin/security` navigation/reload, role redirect, history back/forward, protected loading, expired-access refresh and revoked-session redirect. Check Console for exceptions/hydration errors.
3. Verify temporary-password restriction and replacement, private manual account provisioning/recovery, activation/deactivation, own/other session revocation and logout with disposable test accounts only. Do not capture real passwords.
4. Keyboard: labels, tab order, focus indication, heading focus after navigation, menu open/select, modal focus trap/Escape/return focus, form errors and success announcements. Check touch targets, zoom/text spacing, reduced motion and screen-reader output.
5. Verify no dashboard network chunks on the public homepage; private routes show a neutral no-JS message. Inspect cookies/no-store responses. Repeat security-sensitive flows in actual HTTPS staging before launch.
6. Record available browser/device versions; cross-tab refresh with/without Web Locks and multiple device/session revocation; Lighthouse and Phase 4 public checks remain separate debt.

## Remaining boundaries

No real accounts provisioned; maintainer/owner setup must be performed privately with AUTHENTICATION.md. Browser acceptance is explicitly outstanding, allowed by the Phase 6 request but not passed. In-process rate limits, proxy/TLS hosting, key distribution/rotation, message retention policy and stronger optional MFA/breach-password integration need later review. No external security audit claim.

Owner portrait/contact/date/credential approvals, genuine projects/achievements and the planned final comprehensive visual/UX revamp remain in BACKLOG.md. Phase 7 should implement CMS editing/concurrency/publishing, media/contact integration and fast approved public snapshots only after authorization. Personalized email stays postponed.
