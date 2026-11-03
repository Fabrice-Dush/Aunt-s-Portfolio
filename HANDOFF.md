# Handoff — Phase 5 complete; Phase 6 awaits instruction

**Updated:** 2026-11-03 (Europe/Paris). Phase 3/3.1 complete. Phase 4 accepted for progression by the representative, with browser/performance checks deferred. Phase 5 complete with real database/API verification. Phase 6 NOT STARTED.

Read docs/PHASE_05_VERIFICATION.md, docs/XAMPP_SETUP.md, docs/DATABASE_SCHEMA.md and docs/API.md, then inspect Git changes before editing. Preserve this phase's work; no commit/reset was performed. The latest explicit Phase 5 request supersedes historical instructions forbidding Phase 5 in startup files.

## Local state

XAMPP MariaDB 10.4.32 already running at 127.0.0.1:3306. Created development, test and shadow databases; scoped runtime/migration/test accounts. Real URLs/passwords are in ignored backend/.env. Do not overwrite it, print it, or rerun the fresh-machine bootstrap. Do not alter unrelated XAMPP services. If MySQL is stopped, ask the user to start it using XAMPP Control Panel.

The initial migration is applied to dev/test. `npm run db:verify -w backend` checks connection/scopes/history/counts safely. `npm run prisma:migrate -w backend` uses the scoped migration account and dedicated shadow; runtime and migration target must match. Never use dev as shadow or reset unknown data. Database seed is safe to rerun and never overwrites existing editorial values.

## Checks

```powershell
npm test
npm run test:db -w backend
npm run db:verify -w backend
npm run prisma:validate
npm run typecheck
npm run build
npm run test:build -w frontend
node scripts/verify-phase04.mjs
node scripts/verify-phase05.mjs
```

The real DB suite refuses nonempty test application tables and never resets/truncates them. It uses seraphine_test on seraphine_portfolio_test, applies migrations, creates TEST ONLY fixtures and deletes only their IDs. On interrupted cleanup, inspect the test DB manually. Do not bypass its guard. HTTP harness ports 4402 and 4405 must be free.

## Implementation ownership

- Backend route → controller validation → service → shared Prisma adapter/client → MariaDB.
- portfolio.service.ts owns safe published DTOs; content.service.ts owns validated draft editing and publication; private.service.ts owns nonpublic media/message/settings foundations. None exposes an administrative route.
- Strict Zod schemas reject status/ID/timestamp/nested updates and private consent mass assignment. Profile editing revokes contact consent. Other content must be verified before publishing. Media require explicit approval and permanent HTTPS URL.
- Migration CHECKs enforce singleton IDs and period/media invariants beyond Prisma schema syntax; preserve them.
- Server pool is lazy so /health works without MariaDB. Root and workspace env loading match compiled paths. Build/pretest generate ignored Prisma code.
- The old API metadata message remains unchanged for compatibility; actual content routes are documented in API.md.
- Frontend architecture, CSS, data, prerendering, lockfile and approved designs are unchanged. Do not redesign it during backend/auth work.

## Phase 6 only when requested

Implement secure SUPER_ADMIN/ADMIN provisioning without default credentials/public signup; real password hashing; JWT/session lifecycle with HttpOnly cookies and CSRF; server-side role guards; authenticated mutation endpoints; audit records and edit-conflict handling. Build actual light owner Studio and dark developer Operations dashboards according to approved concepts. Internal service availability is not authentication. There are no fake role headers/tokens to preserve.

Phase 7 covers secure uploads/storage, public contact validation/anti-abuse/delivery, owner-approved retention scheduling, CMS integration and published snapshot rebuilds. The static frontend currently has no API fetches. Do not introduce personalized email before website completion.

## Deferred acceptance and delivery

Carry the exact manual browser checklist in docs/PHASE_04_VERIFICATION.md into QA: seven viewports, keyboard/touch/no-JS/reduced-motion, hydration/console, cross-browser and Lighthouse. These remain unverified despite representative acceptance for progression. Plan the comprehensive final visual/UX revamp after remaining implementation. Owner likeness/public-use approval, provisional jobs, official qualifications/certificates, contact permission and real projects/achievements are still required before launch.

Archive: `C:\Users\HP\Pictures\Aunt nyirarukundo\seraphine-portfolio-phase-05-complete.zip`. Complete source/design/docs, migrations and seed; no dependencies/build/generated code/real env/private originals/dumps. Packager checks extraction and all source hashes plus local credential exclusion. Delivery hash is outside the archive. No deployment performed and no Phase 6 work started.
