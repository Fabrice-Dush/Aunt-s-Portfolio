# Nyirarukundo Seraphine — professional portfolio

Phase 5 backend/database development is complete. Phase 4 was accepted by the project representative for progression, with browser/performance QA deferred. Phase 6 authentication/dashboards has not started. Nothing is deployed. Read [PROJECT_STATUS.md](PROJECT_STATUS.md), [HANDOFF.md](HANDOFF.md) and [Phase 5 verification](docs/PHASE_05_VERIFICATION.md).

The project preserves the approved bright portrait-led portfolio, prominent navy/blue name, light ADMIN Studio and dark SUPER_ADMIN Operations design directions. Dashboards are still design concepts. The working React frontend is static-first with build-time HTML; the new Express content API is verified but not yet connected to the frontend (Phase 7).

## Stack and prerequisites

- Node.js 22.12+ compatible with the locked dependencies; verified Windows Node 24.11.1/npm 11.6.2.
- React/Vite/TypeScript, Express 5/TypeScript, Prisma CLI/Client/official MariaDB adapter pinned to 7.10.0.
- Existing XAMPP MariaDB 10.4.32 at 127.0.0.1:3306. Do not install a second database server. Apache/PHP are unnecessary.
- Python 3 only for complete-project ZIP packaging.

## Run locally

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
```

Backend build/typecheck/pretest generate the omitted Prisma Client. `npm run build` includes frontend prerendering; plain `vite build` does not. Built API: `npm start -w backend`. Frontend preview: `npm run preview -w frontend -- --port 4173 --strictPort`.

Real DB tests use only seraphine_portfolio_test with a dedicated account, refuse existing application data, and remove only their own fixture IDs. They apply migrations without resets. HTTP harnesses use ports 4402/4405; keep them free. Exact test counts, migration/seed results and corrected issues are in the Phase 5 report.

## Backend capabilities and limits

Public `/api/v1` GET endpoints: profile, experience, education, skills, projects, projects/:slug, achievements, certifications and health. Published/verified DTOs exclude private contacts/media, drafts, users, messages and logs. Strict input validation, bounded pagination, safe errors and existing Helmet/CORS/rate/body limits are retained. Existing metadata JSON remains unchanged for compatibility.

Internal services implement content CRUD/draft/publish/unpublish/reorder, media metadata/approval, private messages and typed site settings. No unauthenticated mutation endpoints exist. Authentication, secure account provisioning/password hashing, role guards, actual dashboards, CSRF and mutation audits are Phase 6. Uploads, public contact handling/email delivery and CMS integration are Phase 7. There are no default users/passwords or fabricated projects/achievements.

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

Complete archive: `C:\Users\HP\Pictures\Aunt nyirarukundo\seraphine-portfolio-phase-05-complete.zip`. Includes full source, approved designs, docs, migrations and tests. Excludes node_modules, Git, real env/secrets, private handoff/photos, SQL dumps, generated Client, build outputs and caches. Packager verifies required entries, exact membership, CRC, extraction, source hashes and local credential absence; final size/count/hash are reported at delivery. Existing historical Phase 3/3.1 and Phase 4 review evidence is preserved.
