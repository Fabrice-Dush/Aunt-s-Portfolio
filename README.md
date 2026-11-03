> **Verification (2026-11-02):** Read [`PROJECT_STATUS.md`](PROJECT_STATUS.md) and [`docs/PHASE_03_VERIFICATION.md`](docs/PHASE_03_VERIFICATION.md) for current evidence. The original handoff prompt is historical; do not restart Phase 3 from its old blockers.

# Nyirarukundo Seraphine — Professional Portfolio

**Project phase:** Phase 3 and 3.1 COMPLETE. Phase 4 frontend implementation and automated/HTTP verification finished; **browser acceptance BLOCKED, phase IN PROGRESS**. Current evidence and manual checklist: [`docs/PHASE_04_VERIFICATION.md`](docs/PHASE_04_VERIFICATION.md).

This is a bespoke professional portfolio and a future two-role content-management system for **Nyirarukundo Seraphine**, Water Treatment Plant Engineer in Kigali, Rwanda. The light, portrait-led homepage, light `ADMIN` Studio, and dark `SUPER_ADMIN` Operations interface are the approved design direction.

> **What this package is:** the implemented React/Vite public portfolio with build-time HTML, the Express/TypeScript API foundation and proposed Prisma/MySQL schema, carrying all Phase 2 designs and project memory. This is a local review snapshot, not a deployed site or working CMS. Auth, dashboards, CMS, database integration and contact delivery remain future work.

## Prerequisites

- Node.js **22.12+** (or another version compatible with Vite 7 and Prisma 7), npm 10+
- MySQL 8+ for database work in Phase 5; not needed to view the frontend or run the API health endpoint
- Terminal, modern browser, VS Code (optional)

## Local installation — do this on a machine with internet access

```bash
# 1. Extract the ZIP and open the project folder
cd seraphine-portfolio

# 2. Install workspace dependencies (requires internet)
npm ci

# 3. Configure a local API origin. You may start the frontend without MySQL.
cp backend/.env.example backend/.env
# On Windows PowerShell: Copy-Item backend/.env.example backend/.env

# 4. Start both development services
npm run dev
```

- Frontend: **http://localhost:5173**
- Backend health: **http://localhost:4000/api/v1/health**
- If `npm run dev` cannot manage both terminals on your OS, use `npm run dev:frontend` and `npm run dev:backend` in separate terminals.
- The public frontend currently renders local, client-approved questionnaire details from `frontend/src/features/portfolio/data/profile.ts`. It **does not yet fetch content from the API**.

## Checks to perform after installation

```bash
npm run typecheck
npm run build
npm test
npm run test:build -w frontend
node scripts/verify-phase04.mjs
```

Prisma validation and generation require `DATABASE_URL` to be defined, but do **not** require a running MySQL server or working credentials. The example URL is enough for these two schema-only commands:

```bash
npm run prisma:validate
npm run prisma:generate
```

Live MySQL connectivity and migrations require real local credentials in Phase 5. Do not run migration/reset commands until the proposed schema and target database have been reviewed.

### Verified setup and limitations

- Verified on Windows with Node 24.11.1 / npm 11.6.2. The existing lockfile is included; `npm ci` reproducibly installs both workspaces from root.
- Stop this project's development servers before `npm ci` on Windows; esbuild can otherwise be locked. Do not delete the lockfile to fix that lock.
- `npm run dev` starts both services. `npm run dev:frontend`, `npm run dev:backend`, and `npm run dev` from either workspace directory are supported. The current combined runner emits Node 24's shell-argument deprecation warning; its fixed workspace names are not user input. Both services started and stopped in verification.
- Typechecks, production builds, six structure tests, ten frontend/SEO tests, three build-artifact tests and seven HTTP scenarios passed. `npm start -w backend` serves the compiled API; `npm run preview -w frontend -- --port 4173 --strictPort` serves the frontend build. The HTTP harness starts/stops its own servers; port 4402 must be free.
- Prisma 7.10.0 schema validation and Client generation passed. Generated files are ignored and omitted from delivery. Local MySQL refused the connection and the local URL still contains example credentials. No migrations or data writes were performed.
- The ZIP omits dependencies, build outputs, real environment files, private handoff material and caches. Python 3 is needed only to rerun `scripts/package-project.py` for the release ZIP.
- The portrait is an **AI-generated concept based on the owner-provided photograph**. Seraphine's likeness/public-use approval remains required before launch.
- Full cross-browser, Lighthouse, accessibility and production security QA remain Phase 8 work. See the verification report for the exact scope of browser smoke checks.

## Repository layout

```
seraphine-portfolio/
├── frontend/                   # React + Vite + TypeScript
│   ├── public/images/          # Optimized concept portrait
│   └── src/                    # app/, features/ and shared/; see ARCHITECTURE.md
├── backend/                    # Express 5 + TypeScript
│   ├── src/                    # routes/, controllers/, middlewares/, config/
│   └── prisma/schema.prisma    # Proposed MySQL data models; not yet migrated
├── design/                     # ALL previous Phase 2 HTML prototypes and screenshots
├── docs/                       # Review, assets, setup and verification notes
├── scripts/                    # Offline structural checks and dual-server runner
├── AGENTS.md                   # Start here for Codex/ChatGPT
├── PROJECT_STATUS.md           # Accurate phase tracking and known blockers
├── DESIGN_SYSTEM.md            # Approved visual identity
├── DECISIONS.md                 # Project decisions
├── ARCHITECTURE.md              # Boundaries and future work
├── BACKLOG.md                   # Pending tasks and launch content
├── CHANGELOG.md                # Work history
└── HANDOFF.md                  # How to continue without losing context
```

## Safety and content accuracy

- Confirmed name: **Nyirarukundo Seraphine** (not Nyirakundo).
- Confirmed professional title: **Water Treatment Plant Engineer**. Do not replace with “Environmental Engineer.”
- 11 years is from her form and must be verified at launch.
- 2015–2021 and 2022–present roles are **editorial placeholders**, not verified employment history.
- Do not invent project metrics, visitor counts, testimonials, or credentials.
- No direct phone/email links are published until the owner approves contact exposure.
- `SUPER_ADMIN` and `ADMIN` exist in the **proposed database schema only**; authentication and functional dashboards are Phase 6.
- Professional custom email setup is deferred until after the website is complete.

## Project continuation

Read `AGENTS.md` then `PROJECT_STATUS.md` and `HANDOFF.md` before modifying any feature. Before a coding phase is marked completed, run relevant tests, update all memory files and deliver a complete updated project ZIP.

## Phase 3.1 architecture and delivery

The backend uses MVC with a service-layer boundary for future business logic; health and metadata are simple controllers. The frontend uses feature modules with shared layout/UI and application composition. See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full source tree and ownership rules, and [`docs/PHASE_03_1_VERIFICATION.md`](docs/PHASE_03_1_VERIFICATION.md) for moved/created files, compatibility evidence and remaining manual browser checks.

The Phase 3.1 ZIP is historical. The current Phase 4 source review snapshot is `C:\Users\HP\Pictures\Aunt nyirarukundo\seraphine-portfolio-phase-04-review-snapshot.zip`; it excludes dependencies, generated/build/cache outputs, secrets and private materials. No live MySQL/auth/CMS/dashboard implementation is included.

## Phase 4 rendering and review

Run the full `npm run build`; plain `vite build` does not run static rendering. The frontend build creates client assets, compiles a build-only SSR entry into ignored `.cache/prerender`, writes complete portfolio HTML into `frontend/dist/index.html`, then React hydrates that same tree in the browser. No backend is required to read the page. Rebuild after content changes.

`frontend/site.config.mjs` defaults to no canonical domain and indexing disabled. Keep those settings until launch review. Noindex is not access control; do not deploy the review preview. Contact config has no values, project data is empty, and portrait consent remains pending. No invented credentials/projects or fake form is displayed.

Real browser automation is unavailable in this session. Responsive layout, menu/keyboard/touch behavior, hydration/console, reduced motion, cross-browser compatibility and Lighthouse are **not verified**. Complete the exact seven-viewport checklist in the Phase 4 verification report before calling the phase complete. Build-size figures are not Core Web Vitals.
