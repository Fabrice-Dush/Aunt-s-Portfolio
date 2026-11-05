# Current Phase 7 — content-managed portfolio

Phase 7 implementation and automated acceptance are complete. [Full verification/report](docs/PHASE_07_VERIFICATION.md), [owner guide](docs/CMS_USER_GUIDE.md), [CMS API](docs/CMS_API_REFERENCE.md), [media](docs/MEDIA_MANAGEMENT.md), [publishing](docs/CONTENT_PUBLISHING.md), [current status](PROJECT_STATUS.md). Phase 8 NOT STARTED. Browser QA and hosting automation remain pending.

Run the existing dedicated MariaDB at port 13312 using docs/XAMPP_SETUP.md, preserve backend/.env/JWT, then `npm run dev`. Real accounts require the private CLI procedure in docs/AUTHENTICATION.md; none were created. The owner can now edit all content, upload/approve/attach media, preview/publish, handle messages and update page metadata without source edits.

`npm run build` requires a reachable database and exports only published public DTOs before Vite/prerender. Supported production serving is the compiled Express application under the same HTTPS origin as the API. It gates HTML against current public data; **do not deploy frontend/dist on an ungated static host**. `npm run preview -w frontend` also requires the API for freshness checking. The guarded dashboard Update public website control and `node scripts/rebuild-public.mjs` provide a local rebuild interface; they do not deploy to a provider.

Verify with `npm test`, `npm run test:db -w backend`, `npm run typecheck`, `npm run build`, `npm run test:build -w frontend`, and `node scripts/verify-phase07.mjs`. The latter is this restored workstation's read-only preservation/compiled check. Test DB suites run sequentially and refuse existing application data. Media source files are private; use the maintenance instructions in MEDIA_MANAGEMENT.md for reconciliation and private backups.

All thirteen models/two migrations and all recovered development fields are preserved. No real users, new migration, recovery/cutover or .env rewrite. Level-6 freshness remains unproven and the first-rehearsal failure remains unexplained. Keep manual Phase 4/6/7 checklists and the agreed later visual/UX revamp. Personalized email postponed.

Delivery: `C:/Users/HP/Pictures/Aunt nyirarukundo/seraphine-portfolio-phase-07-complete.zip`, full eligible latest repository with verified extraction/hashes and private/secret/generated exclusions.

---

## Retained Phase 6 setup/history

# Nyirarukundo Seraphine — professional portfolio

> **Phase 6 COMPLETED:** Authorized dedicated normal-mode development database at 127.0.0.1:13312 passed final migration/shadow/auth/API/integrity/build and restart acceptance. [Lifecycle/setup](docs/XAMPP_SETUP.md), [verification](docs/PHASE_06_VERIFICATION.md), and [incident/remaining recovery limits](docs/PHASE_06_DATABASE_INCIDENT.md). Shared XAMPP data and private backups/exports remain preserved. Level-6 freshness uncertainty and the first failed rehearsal remain documented. Manual browser QA is deferred; Phase 7 NOT STARTED.

Phase 6 authentication, dashboards and authorized development database cutover are complete; critical automated and configured-environment acceptance passed. Phase 4 browser/performance QA remains deferred. Nothing is deployed; Phase 7 has not started. Read [PROJECT_STATUS.md](PROJECT_STATUS.md), [HANDOFF.md](HANDOFF.md), [Phase 6 verification](docs/PHASE_06_VERIFICATION.md) and [administrator setup](docs/AUTHENTICATION.md).

The project preserves the approved bright portrait-led portfolio, prominent navy/blue name, light ADMIN Studio and dark SUPER_ADMIN Operations design directions. Both dashboards now have real authenticated interfaces; browser visual/interaction acceptance remains pending. The working React frontend is static-first with build-time HTML; the new Express content API is verified but not yet connected to the frontend (Phase 7).

## Stack and prerequisites

- Node.js 22.12+ compatible with the locked dependencies; verified Windows Node 24.11.1/npm 11.6.2.
- React/Vite/TypeScript, Express 5/TypeScript, Prisma CLI/Client/official MariaDB adapter pinned to 7.10.1 (compatible security patch).
- Existing XAMPP MariaDB 10.4.32 binaries; this restored workstation uses its dedicated normal-mode instance at 127.0.0.1:13312. See docs/XAMPP_SETUP.md for lifecycle and fresh-machine distinctions. Apache/PHP are unnecessary.
- Python 3 only for complete-project ZIP packaging.

## Run locally

On this configured workstation, preserve backend/.env, start the dedicated database using [the lifecycle commands](docs/XAMPP_SETUP.md), then run `npm run db:verify -w backend` and `npm run dev`. The installation/provisioning steps below are for fresh checkouts; do not reinitialize or seed the restored database just to start development.

```powershell
npm ci
# Fresh checkout only, and only when backend/.env does not already exist:
Copy-Item backend/.env.example backend/.env
```

Do not overwrite this configured machine's real backend/.env. Follow [XAMPP setup](docs/XAMPP_SETUP.md) to provision a fresh machine safely. It explains hidden administrative credential input, scoped accounts, database names, migration review and configuration. Real secrets never belong in Git or an archive.

```powershell
npm run prisma:validate
npm run prisma:generate
npm run prisma:deploy -w backend
npm run prisma:seed -w backend
npm run db:verify -w backend
npm run dev
```

Apply migrations only after verifying target/schema/existing data. Never reset an unknown database. For a new reviewed development migration use `npm run prisma:migrate -w backend`; it uses the dedicated shadow DB. Seed may be rerun without overwriting editorial records.

Frontend: http://localhost:5173. API liveness: http://localhost:4000/api/v1/health. The frontend and liveness route can run without MariaDB; content routes require the configured database. Use `npm run dev:frontend` / `npm run dev:backend` if separate terminals are preferable. On Windows stop project development servers before a clean `npm ci` to release esbuild locks; keep the lockfile/Babel plugin.

## Verify and build

```powershell
npm test
npm run test:db -w backend
npm run db:verify -w backend
npm run typecheck
npm run build
npm run test:build -w frontend
node scripts/verify-phase04.mjs
node scripts/verify-phase05.mjs
node scripts/verify-phase06.mjs
```

Backend build/typecheck/pretest generate the omitted Prisma Client. `npm run build` includes frontend prerendering; plain `vite build` does not. Built API: `npm start -w backend`. Frontend preview: `npm run preview -w frontend -- --port 4173 --strictPort`.

Real DB tests use only seraphine_portfolio_test with a dedicated account, refuse existing application data, and remove only their own fixture IDs. They apply migrations without resets. HTTP harnesses use ports 4402/4405; keep them free. Exact current test counts and remaining checks are in the Phase 6 report; Phase 5 history is retained.

## Backend capabilities and limits

Public `/api/v1` GET endpoints: profile, experience, education, skills, projects, projects/:slug, achievements, certifications and health. Published/verified DTOs exclude private contacts/media, drafts, users, messages and logs. Strict input validation, bounded pagination, safe errors and existing Helmet/CORS/rate/body limits are retained. Existing metadata JSON remains unchanged for compatibility.

Internal services implement content CRUD/draft/publish/unpublish/reorder, media metadata/approval, private messages and typed site settings. No unauthenticated mutation endpoints exist. Phase 6 implements authentication, private account provisioning, password/session workflows, role guards, actual dashboards, CSRF and account mutation audits. See docs/AUTHENTICATION.md for the full contract and local setup. Real accounts must be provisioned privately; no default credentials exist. Uploads, public contact handling/email delivery and CMS integration are Phase 7. There are no default users/passwords or fabricated projects/achievements.

- [API contract, DTOs, validation and internal services](docs/API.md)
- [Models, relations, publication and migration integrity](docs/DATABASE_SCHEMA.md)
- [XAMPP accounts, environment and reproducible setup](docs/XAMPP_SETUP.md)
- [Architecture and phase boundaries](ARCHITECTURE.md)

## Repository

- frontend/: app composition, feature modules, shared UI/styles, prerender and tests.
- backend/: routes, controllers, services, validators, middleware, config, Prisma migrations/seed and tests.
- design/ and docs/visual-approval/: preserved Phase 2 concepts and approved references; example metrics are not client data.
- docs/: API, database, setup and historical/current verification.
- scripts/: dev runner, structure/HTTP checks and complete-project ZIP packager.
- AGENTS.md and memory files: continuity and project safety rules.

## Content and delivery

Full name Nyirarukundo Seraphine; title Water Treatment Plant Engineer; Kigali, Rwanda; WASAC Group. Eleven years is questionnaire-reported. Employment periods remain provisional; official qualification/certificate titles need confirmation. Synthetic portrait likeness/public-use and public contact permission remain outstanding. Noindex is not access control: do not publish the review frontend without owner/launch approval.

Keep the seven-viewport browser/menu/hydration/no-JS/reduced-motion/cross-browser/Lighthouse checklist in [Phase 4 verification](docs/PHASE_04_VERIFICATION.md). No new browser or performance score is claimed. The agreed comprehensive visual/UX revamp follows remaining major implementation. Personalized professional email stays postponed until website completion.

Current review-snapshot target: `C:\Users\HP\Pictures\Aunt nyirarukundo\seraphine-portfolio-phase-06-review-snapshot.zip`. Includes full source, approved designs, docs, migrations and tests. Excludes node_modules, Git, real env/secrets, private handoff/photos, SQL dumps, generated Client, build outputs and caches. Packager verifies required entries, exact membership, CRC, extraction, source hashes and local credential absence; final size/count/hash are reported at delivery. Existing historical Phase 3/3.1 and Phase 4 review evidence is preserved.

## Administrator access

Run `npm run auth:key -w backend`, then privately run `npm run auth:bootstrap -w backend` in your own interactive terminal. Open http://localhost:5173/login after `npm run dev`. The maintainer can provision the owner from Administrator access; temporary passwords must be replaced. Read [the setup and recovery guide](docs/AUTHENTICATION.md) before provisioning. Never send real credentials to Codex or commit them. Current local key is already configured; no real users were created.
