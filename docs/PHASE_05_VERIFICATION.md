# Phase 5 — backend and database verification

**Date:** 2026-11-03 (Europe/Paris). **Result: COMPLETED**, subject to verified source ZIP delivery recorded by the packager/final report. Phase 6 has not started. Nothing deployed.

The project representative explicitly accepted Phase 4 for progression in the Phase 5 request, with browser/performance checks deferred. This supersedes the earlier instruction to block Phase 5. It does not turn those deferred checks into passes. The frontend, approved designs and dependency lockfile remain unchanged.

## Environment and safe database setup

Initial Git working tree was clean. Required startup/memory files, README, prior verification, actual frontend/backend/tests and the provisional Prisma schema were inspected. Existing Windows Node/npm/dependencies were retained. No server/framework/version replacement.

XAMPP process: `C:\xampp\mysql\bin\mysqld.exe`; config: `C:\xampp\mysql\bin\my.ini`; actual SQL server version **10.4.32-MariaDB**, actual port **3306**. MariaDB was already running and accepted TCP connections. Inspection found no pre-existing seraphine databases/accounts, so no existing data required conversion or deletion. Apache and other services/configurations were untouched.

Created utf8mb4/utf8mb4_unicode_ci databases `seraphine_portfolio_dev`, `seraphine_portfolio_test`, `seraphine_portfolio_shadow`. Runtime `seraphine_dev` has exactly SELECT/INSERT/UPDATE/DELETE on dev. `seraphine_migrate` has scoped DML/DDL on dev/shadow; `seraphine_test` on test only. Account hosts are 127.0.0.1. Underscores are escaped in GRANT scope names to prevent wildcard privileges. No global grants or grant option. Generated independent 32-byte secrets remain only in ignored backend/.env; original placeholder URL was replaced, unrelated env settings retained.

`db:verify` connected through Prisma and checked actual server/DB/port, runtime privileges, migration grant scopes, completed migration history and record counts. This is real connectivity evidence, separate from Client generation.

## Implemented scope

Twelve models: User, Profile, Experience, Education, Skill, Project, Achievement, Certificate, MediaAsset, ContactMessage, SiteSettings, AuditLog. Native foreign keys, unique constraints, list indexes, singleton and period CHECKs. Portrait/certificate/project media and achievement-project relationships use restrictive deletion; audit actor deletion preserves history. Null/year-only dates are supported. See DATABASE_SCHEMA.md for all model decisions.

Prisma 7.10.0 CLI/Client/MariaDB adapter unchanged; shared lazy runtime client, URL credential decoding/validation, stable env loading, bounded pool timeouts, separate migration credentials, shadow safety checks and disconnect on server shutdown. Production backend build and backend pretest generate the omitted Client automatically.

Eight public content GET routes plus preserved health/metadata: profile, experience, education, skills, projects, project/:slug, achievements, certifications. Explicit public selects/DTOs, DRAFT/ARCHIVED exclusion, verified-content filtering, safe nested media and contact consent. Bounded deterministic pagination. Internal validated CRUD/draft/publish/unpublish/reorder services; private media/contact/settings foundations. No administrative HTTP mutation, fake auth, upload, account provisioning, public message submission/retrieval or email feature.

## Migrations and seed

Generated initial migration with `prisma migrate dev --create-only`, reviewed its create-table/index/FK SQL, added explicit singleton/period/positive-byte CHECKs, then applied `20261103183624_phase05_foundation` to the new dev database. Applied the same migration independently to test with `migrate deploy`. A subsequent `migrate dev` shadow replay reported **already in sync; no pending migration or schema change**. No reset, destructive data conversion, drop database or truncate was used.

Development seed succeeded. Actual counts: profile 1, provisional jobs 2, education 3, skills 6, training 3, site settings 1; users/projects/achievements/messages/media/audit events 0. Profile and supported skills published; unverified employment/qualification/training records remain drafts. No private contact values, portrait or default user credentials seeded. Real DB tests reran seed and proved no duplicates and no overwrite of a deliberate editor change.

## Executed checks

| Check | Result |
|---|---|
| Baseline `npm test` | PASS: 6 structural, 10 frontend, 7 backend HTTP scenarios |
| Final `npm test` | PASS: 6 structural, 10 frontend/SEO, 8 backend unit/service/security tests, 7 HTTP scenarios (backend runner 16 including parent) |
| `npm run test:db -w backend` | PASS: 11 real DB/HTTP scenarios (runner 12 including parent), no skips |
| `npm run db:verify -w backend` | PASS: actual connection, version/port/database, runtime/migration privilege scopes, migration history/counts |
| `npm run prisma:validate` / `prisma:generate` | PASS: pinned 7.10.0 |
| Dev migration + shadow drift replay | PASS: initial migration applied; subsequent run already in sync |
| Test `migrate deploy` | PASS: fresh replay; subsequent run no pending migrations |
| `npm run prisma:seed -w backend` | PASS: safe create-only upserts |
| `npm run typecheck` | PASS: both workspaces |
| `npm run build` | PASS: frontend prerender + compiled backend with generated Client |
| `npm run test:build -w frontend` | PASS: 3 production-artifact checks |
| `node scripts/verify-phase04.mjs` | PASS: 34 dev + 7 production HTTP requests; compiled health 200 / malformed JSON 400 / oversized JSON 413 |
| `node scripts/verify-phase05.mjs` | PASS: 8 live compiled database/health endpoint requests from repository-root working directory |
| Archive rules | PASS: allowlisted migration.sql included, unrelated SQL dumps and real env excluded |

Database suite verifies every collection, actual insert/select/update/delete, draft read/edit/publication, partial-update preservation, unverified publication rejection, stable pagination, unknown dates, slug unique conflict, FK restrictions, missing FK rejection, media and portrait approval/revocation, hidden linked private projects, explicit contact consent and revocation on edit, private message storage/status/deletion, user/audit FK behavior, strict query validation, missing/draft slug 404, absent mutation/admin routes even with forged role headers, transaction rollback, atomic reorder rollback, singleton CHECKs and idempotent seed. Fixtures are explicitly TEST ONLY and exist only in the isolated test DB. Teardown deletes only recorded IDs; the suite refuses nonempty application tables rather than resetting them.

Unit tests cover field/length/email/year/slug/pagination validation, unknown-property rejection, publication/date logic, unsafe media URL rejection, encoded DB credentials, DTO projection and fixed error mapping. Existing HTTP tests retain Helmet/CORS/health/metadata/404/400/413/500/429 evidence. Auth error mapping is preparatory, not an implemented authentication flow.

## Issues found and corrected

- Restricted Node child-process spawning initially failed EPERM; approved subprocess execution passed, without changing dependencies.
- Test CLI rejected an empty shadow URL; omitted absent shadow configuration correctly.
- Initial integration teardown disconnected the singleton before cleanup reused the old instance, leaving a pool alive; corrected ownership/cleanup and reran to clean exit. Stopped only that stale test process.
- Verification JSON could not serialize MariaDB's bigint port; converted it to Number for safe reporting.
- Scope review identified underscore wildcard semantics; narrowed the newly created account grants to exact literal database names and verified them.
- Existing ZIP exclusion omitted all SQL; added a narrow migration-path allowlist and fail-closed data/account SQL scan, retaining dump exclusion and adding local credential-value scanning.

## Deferred limitations

No new browser/UI/Lighthouse/cross-browser claims. Follow docs/PHASE_04_VERIFICATION.md in later QA. The static frontend is unchanged and does not yet consume this API; Phase 7 must integrate approved published snapshots without slowing first paint. Preserve the planned comprehensive final visual/UX revamp after the remaining implementation work.

Authentication, password hashing/provisioning, RBAC, cookies/CSRF, actual dashboards and mutation auditing remain Phase 6. Internal services are not an authorization boundary; concurrent dashboard edit conflict handling must be designed when exposed. Upload/URL storage provider, public contact abuse protection/delivery and approved retention scheduling remain Phase 7. No production remote TLS/backup/deployment verification. Owner portrait/contacts/date/credential approval and genuine projects/achievements remain outstanding. Personalized email stays postponed.

## Delivery

Target: `C:\Users\HP\Pictures\Aunt nyirarukundo\seraphine-portfolio-phase-05-complete.zip`.

The complete source/design/docs archive includes migration SQL, seed, tests and setup/API/schema documentation. It excludes dependencies, Git, generated Client/build/cache files, real env, secrets, private source materials/photos and SQL dumps. Packager verifies exact membership, required files, CRC, safe real extraction and SHA256 equality of every source file; compares local passwords against eligible files without exposing them. Final archive size/file count/SHA256 are reported externally to avoid a self-referential archive hash.
