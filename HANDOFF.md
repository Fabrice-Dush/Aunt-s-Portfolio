# Handoff — verified Phase 3 foundation

**Updated:** 2026-11-02. Read `PROJECT_STATUS.md` and `docs/PHASE_03_VERIFICATION.md` for final acceptance and delivery status.

## What works

The inherited React/Vite/TypeScript and Express/TypeScript workspaces now install, typecheck, build and run locally. Chrome rendered the page without the historical Babel overlay. Real development and compiled backend requests returned HTTP 200. Prisma 7.10.0 schema validation and Client generation passed; there is no DB integration or migration. All Phase 2 source/prototypes/approved references are retained.

Fixes are small: correct hero-period CSS selector; return 400/413 for malformed/oversized JSON; permit the documented ignored local `.env` in structure checks; improve exclusion rules. New real HTTP tests cover the API foundation. The user's pre-existing Express-range lockfile edit was preserved, and no dependency version was changed.

## Reproduce the verified setup

1. Stop this project's existing servers before a clean Windows install (esbuild may be locked).
2. From root run `npm ci`. Keep `package-lock.json`.
3. If missing, copy `backend/.env.example` to `backend/.env`; never overwrite an existing local file or package it.
4. Run `npm test`, `npm run typecheck`, `npm run build`, `npm run prisma:validate`, `npm run prisma:generate`.
5. Run `npm run dev`; open `http://localhost:5173` and request `http://localhost:4000/api/v1/health`. Alternatively use `npm run dev:frontend` / `npm run dev:backend`, or `npm run dev` inside the relevant workspace.
6. For compiled runtime use `npm start -w backend`; frontend preview: `npm run preview -w frontend -- --port 4173 --strictPort`.
7. If the agent's restricted subprocess sandbox reports `spawn EPERM`, retry with the normal approved execution permission. Do not change application dependencies to compensate for that sandbox restriction.

## Phase 4 preparation — do not implement without the next request

- Compare the current foundation to `docs/visual-approval/` and `design/prototype/`; maintain the bright, large navy/blue name and portrait-led composition.
- Refine section/component layout, typography, responsive behavior and lightweight interaction. Preserve keyboard access, reduced-motion fallback and static-first loading.
- Choose and document SEO/pre-rendering and social-preview behavior before adding a CMS dependency to first paint.
- Use existing truthful content and explicit pending states. Obtain real projects/qualifications/verified dates as needed; never copy illustrative prototype metrics.
- Keep the synthetic portrait flagged as pending consent and public contact details withheld.
- Extend browser, accessibility and performance testing for Phase 4; repeat the full current checks after changes. Deliver the entire updated repository ZIP after Phase 4 is complete.

## Deferred boundaries

MySQL is unavailable locally (placeholder credentials, connection refused). In Phase 5 review the proposed relations/model and configure a real local MySQL instance, wire PrismaClient with the MariaDB adapter, then plan migrations safely. No database reset or migration has been attempted.

Phase 6 adds real secure authentication and role guards, LIGHT ADMIN and DARK SUPER_ADMIN dashboards. Existing dashboard files are static visual prototypes. Phase 7 adds CMS integration. Custom email setup remains postponed until website completion.

## Delivery

`scripts/package-project.py` creates a source ZIP in the parent directory and verifies required entries, CRCs, exclusions and every source hash. It refuses to overwrite an existing ZIP. Exclude secrets, `handoff-private`, node_modules, generated Prisma, build/cache outputs and Git metadata. The ZIP is a local developer handoff, not a deployable authorization to publish the portrait or prototype text.
