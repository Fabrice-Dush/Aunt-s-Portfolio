> **Codex handoff (2026-11-02):** Read [`CODEX_START_HERE.md`](CODEX_START_HERE.md) and [`CODEX_PROMPT.md`](CODEX_PROMPT.md). Phase 3 remains IN PROGRESS; local Vite/Babel startup error is unresolved.

# Nyirarukundo Seraphine — Professional Portfolio

**Project phase:** Phase 3 / 10 — architecture and codebase setup (scaffold delivered for review; final install/build verification pending).

This is a bespoke professional portfolio and a future two-role content-management system for **Nyirarukundo Seraphine**, Water Treatment Plant Engineer in Kigali, Rwanda. The light, portrait-led homepage, light `ADMIN` Studio, and dark `SUPER_ADMIN` Operations interface are the approved design direction.

> **What this package is:** the first real React/Vite and Express/TypeScript project scaffold plus a proposed Prisma/MySQL schema, carrying all Phase 2 designs and handoff memory files. It is not yet a deployed, fully working CMS. The initial frontend has a source-coded React page, but a production Vite build has **not been verified in this execution environment** because the npm registry is inaccessible here.

## Prerequisites

- Node.js **22.12+** (or another version compatible with Vite 7 and Prisma 7), npm 10+
- MySQL 8+ for database work in Phase 5; not needed to view the frontend or run the API health endpoint
- Terminal, modern browser, VS Code (optional)

## Local installation — do this on a machine with internet access

```bash
# 1. Extract the ZIP and open the project folder
cd seraphine-portfolio

# 2. Install workspace dependencies (requires internet)
npm install

# 3. Configure a local API origin. You may start the frontend without MySQL.
cp backend/.env.example backend/.env
# On Windows PowerShell: Copy-Item backend/.env.example backend/.env

# 4. Start both development services
npm run dev
```

- Frontend: **http://localhost:5173**
- Backend health: **http://localhost:4000/api/v1/health**
- If `npm run dev` cannot manage both terminals on your OS, use `npm run dev:frontend` and `npm run dev:backend` in separate terminals.
- The public frontend currently renders local, client-approved questionnaire details from `frontend/src/data/profile.ts`. It **does not yet fetch content from the API**.

## Checks to perform after installation

```bash
npm run typecheck
npm run build
npm run check:offline
```

When MySQL is configured for Phase 5, do the following separately:

```bash
# Edit backend/.env to use actual local MySQL credentials
npm run prisma:validate
npm run prisma:generate
# Only AFTER the schema is reviewed in Phase 5: npm run prisma:migrate -w backend -- --name init
```

### Current environment limitations

- The ZIP intentionally does **not** contain `node_modules`, real `.env` secrets, a production build, or a generated package lockfile. This environment could not reach `registry.npmjs.org` to install dependencies and generate the lockfile. `npm install` on your machine will create `package-lock.json` for reproducible subsequent installs; commit it to Git.
- TypeScript/TSX **syntax** and the included offline `node --test` suite were checked in this session. Full TypeScript type checking, actual Vite bundling, launching Express, Prisma schema validation, MySQL migration, browser runtime validation, and Lighthouse remain unverified.
- The approved portrait is an **AI-generated concept based on the owner-provided photograph**. It must be shown to Seraphine for likeness approval before the public launch.

## Repository layout

```
seraphine-portfolio/
├── frontend/                   # React + Vite + TypeScript
│   ├── public/images/          # Optimized concept portrait
│   └── src/                    # Initial public homepage components and content
├── backend/                    # Express 5 + TypeScript
│   ├── src/                    # CORS, Helmet, rate limit, /api/v1/health
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
