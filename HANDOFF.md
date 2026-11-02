# Handoff — start here after AGENTS.md and PROJECT_STATUS.md

**Latest date:** 2026-11-02
**Current task:** Codex takeover; first resolve developer-reported Vite React-Babel `_lruCache` error, then finish Phase 3 verification before Phase 4.

## What has been built

- Extracted the full Phase 2 revision 02 artifact, preserving every `design/` prototype and screenshot.
- Approved revised design: light name-first portfolio (`Nyirarukundo` in navy, `Seraphine` in blue, large hero photo), light Owner/Admin Studio, dark Super Admin Operations. This replaces earlier dark-first homepage direction.
- Created real `frontend/` React/Vite/TypeScript source scaffolding; initial public page follows the approved design. Initial page is static React content, not integrated with backend.
- Created `backend/` Express/TypeScript API health foundation and proposed Prisma/MySQL schema. **No auth, live DB, migrations, CRUD, dashboard functionality yet.**
- Added root npm workspaces, `scripts/dev.mjs`, `scripts/structure.test.mjs`, `.gitignore`, `.editorconfig`.
- Kept the compressed concept portrait (requires Seraphine's approval) and explicit placeholders for unverified content.

## Environment limitation / next checks

The source was authored where `registry.npmjs.org` could not resolve (`EAI_AGAIN`), so no workspace packages could be installed. The source has passed syntax/structure checks but **no actual Vite or Express execution**. On an internet-enabled developer machine:

1. Run `npm install` from root; commit the resulting `package-lock.json`.
2. Copy `backend/.env.example` to `backend/.env`; no real DB needed for basic Express health route.
3. Run `npm run typecheck`, `npm run build`, `npm run check:offline`.
4. Run `npm run dev`. Check `http://localhost:5173`, mobile navbar, console; check `http://localhost:4000/api/v1/health`.
5. Configure a local MySQL URL (locally only, never ZIP secrets) and run `npm run prisma:validate`. Migrate only after Phase 5 DB review.
6. Fix defects, update `PROJECT_STATUS.md`, `CHANGELOG.md`, and ZIP; mark Phase 3 complete only after verification.

## After Phase 3 passes

Phase 4: transform the initial React source into the exact approved public portfolio with refined layouts, richer but accessible motion, responsive testing, truthful content and SEO/pre-rendering plan. Then Phase 5 backend CRUD/db, Phase 6 JWT-secured role dashboards, Phase 7 integration.

## Rules

- No fictional awards/projects/traffic stats, fake employment dates, contact exposure without consent.
- Approved **public** title: Water Treatment Plant Engineer; do not call her Environmental Engineer.
- No registration endpoint; Super Admin is developer, Admin is Seraphine; guests are unauthenticated.
- Dashboard prototypes under `design/` do not indicate implemented features.
- Keep custom email discussion postponed.
- After **every completed phase with code**, export **complete project** ZIP including all docs, assets, source and relevant test results, excluding secrets/node_modules.

## Codex takeover 2026-11-02

The developer asked to continue future coding in Codex, keeping this full project intact. Read `CODEX_START_HERE.md` and `CODEX_PROMPT.md` at repository root. The approved UI is in `docs/visual-approval/` and `design/`. The real unresolved frontend runtime error is in `docs/PHASE_03_LOCAL_ERROR.md`. Personal original questionnaire/photo are in `handoff-private/` (excluded from git; do not deploy). No new production implementation was added during packaging; Phase 3 is still in progress.
