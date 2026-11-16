<!-- xampp3306-current -->
# XAMPP development database checkpoint - 2026-11-16

The representative explicitly authorized moving normal local development to XAMPP **127.0.0.1:3306**. The real environment now uses new `seraphine_portfolio_{dev,test,shadow}_x3306_20261116` schemas and new narrowly scoped service accounts. Read [current setup](docs/XAMPP_SETUP.md) and [migration verification](docs/XAMPP_3306_MIGRATION.md). Start MySQL through XAMPP Control Panel normally; `npm run dev` starts the application.

All 16 recovered records and full two-row migration history were imported and verified before switching only the four DB URL lines. JWT/all other environment bytes, schema/migrations, old damaged schemas, unrelated project databases and prior backups remain preserved. A fresh private logical export/environment backup is in the owner-restricted `2026-11-16-xampp3306-01` directory under the existing external recovery root. No credentials/data backups in Git.

The recovered normal-mode port-13312 instance is a **stopped, preserved fallback**, not required for normal development. Its exact profile remains supported by the test guards. Do not drop old databases, copy engine files, reset/seed development, repeat recovery, or run the historical pre-Phase-6 rollback. Use this migration's private pre-change environment for an intentional rollback; later XAMPP edits are not mirrored to the fallback.

DB/auth/CMS suites, Prisma/schema/shadow/constraint checks, normal XAMPP restart, builds/artifacts, compiled serving and real frontend content retrieval passed. Preserve exact target/instance guards, exclusive test lock, initially-empty refusal and captured-ID cleanup. Phase 9 implementation remains complete with owner/launch approval pending; Phase 10 not started. No real dashboard accounts, new publication permissions, deployment, public push or automatic ZIP.
The migration browser run passed 17/19 groups, including complete Chromium ADMIN/SUPER_ADMIN workflows plus Firefox/WebKit. Installed Chrome/Edge UI timeouts persisted in focused reruns; all runs cleaned their fixtures. Record this compatibility limitation separately; do not claim a complete new cross-browser pass. Final database/record/backup/environment/inventory checks passed.
<!-- /xampp3306-current -->

---

> **Phase 9 verified implementation — 2026-11-07:** **PHASE 9 IMPLEMENTATION COMPLETE — FINAL OWNER/LAUNCH APPROVAL PENDING.** Phase 10 NOT STARTED. Read PROJECT_STATUS.md, HANDOFF.md and docs/PHASE_09_VERIFICATION.md. Local tag phase-09-verified; owner/launch/device/account/production gates pending. No public push, automatic ZIP or deployment. Preserve recovered data and all private backups. Older checkpoints below are historical.

> **Phase 8 final checkpoint — 2026-11-07:** Local implementation and acceptance verified; annotated local tag phase-08-verified identifies the delivery. Read PROJECT_STATUS.md, HANDOFF.md and docs/PHASE_08_VERIFICATION.md. Private push blocked by public/read-only origin. No Phase 9, automatic ZIP or real accounts. Preserve dedicated port 13312 and recovery backups. Historical instructions below are superseded.

> **Latest checkpoint — 2026-11-05: Phase 7 CMS implemented and automated acceptance passed.** Read PROJECT_STATUS.md, HANDOFF.md and docs/PHASE_07_VERIFICATION.md. All seven editors, guarded CRUD, media, messages, publication and database-canonical public content are integrated. Use the explicit local rebuild and fail-closed public serving contract in docs/CONTENT_PUBLISHING.md; never deploy an ungated dist. Dedicated port 13312 and recovered records preserved; no real accounts. Browser QA/hosting/content approvals remain open. Phase 8 NOT STARTED. Older instructions below are historical.

> **Latest completed checkpoint - 2026-11-05:** Phase 6 COMPLETED after explicitly authorized dedicated development cutover and final acceptance. Actual backend/.env now targets normal-mode MariaDB 10.4.32 at 127.0.0.1:13312, private 2026-11-05-rehearsal-02/data; only four database URL lines changed, with JWT and all unrelated bytes preserved. Complete owner-restricted offline snapshot and original .env backup verified at C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-pre-cutover-01. All 28 dev/test tables and 16 recovered records, migrations/drift/shadow replay, 11 DB + 18 auth scenarios, TypeScript/tests/production builds/API/artifact checks and two post-cutover workload restarts passed. Shared XAMPP data/data-old, unrelated databases, original backups and 176 private export files remain unchanged. Dedicated instance left running; XAMPP Control Panel does not manage it. Level-6 freshness remains unproven; first-rehearsal Aria failure remains unexplained and retained. No real administrator accounts. Manual browser QA remains deferred. Phase 7 NOT STARTED. See docs/PHASE_06_DATABASE_INCIDENT.md, docs/PHASE_06_VERIFICATION.md and docs/XAMPP_SETUP.md. Do not repeat recovery, initialization or cutover; use documented start/stop commands.

> **Current continuation — 2026-11-03:** Phase 5 is complete with real XAMPP MariaDB, migrations, seed and secure public APIs. Read `docs/PHASE_05_VERIFICATION.md`, `PROJECT_STATUS.md` and `HANDOFF.md`. The representative accepted Phase 4 for progression with browser/performance checks deferred. Phase 6 has not started; wait for its instruction. Notes below are historical and do not override this continuation.

> **Latest continuation — 2026-11-03:** Phase 3.1 architecture refactoring is complete; Phase 4 has not started. Read `docs/PHASE_03_1_VERIFICATION.md`, `PROJECT_STATUS.md`, `HANDOFF.md` and `ARCHITECTURE.md` before the retained historical notes below. Browser verification limitations are explicitly recorded.

> **Current verification update — 2026-11-03:** Phase 3 is complete. The historical takeover notes below are retained for context. Read `PROJECT_STATUS.md`, `HANDOFF.md` and `docs/PHASE_03_VERIFICATION.md` for current results. Phase 4 has not started, and no database migration was performed.

# Start here — Codex transition (2026-11-02)

This is the **complete source handoff snapshot** from ChatGPT to Codex for **Nyirarukundo Seraphine's professional portfolio**. It contains all previously authored React/Vite and Express/Prisma sources, Phase 2 design prototypes and screenshots, developer-approved references, project memory, and private client source material.

## Codex reading order
1. `AGENTS.md` — non-negotiable development rules.
2. `PROJECT_STATUS.md` — factual state; Phase 3 IN PROGRESS.
3. `CODEX_PROMPT.md` — detailed first instruction to paste into Codex.
4. `HANDOFF.md`, `BACKLOG.md`, `DECISIONS.md`, `DESIGN_SYSTEM.md`, `ARCHITECTURE.md`, `CHANGELOG.md`.
5. `docs/PHASE_03_LOCAL_ERROR.md` — latest local runtime blocker and diagnosis plan.
6. `design/previews/` and `docs/visual-approval/` — approved look (visual references only).
7. `frontend/` and `backend/` — actual current code; do not confuse with `design/prototype/` (static design reference).

## Important
- The approved look is the **light bright editorial identity-first homepage** with very large **Nyirarukundo Seraphine** headline, an optimized *synthetic* standing portrait, a **light ADMIN** content dashboard and a **dark navy SUPER_ADMIN** technical operations dashboard.
- User reported **`[plugin:vite:react-babel] _lruCache is not a constructor`** after installing npm packages and running `npm run dev` on Windows. This is the immediate first bug to investigate. It has **not** been reproduced/fixed in this snapshot. Earlier assistant suggested reinstalling dependencies and possibly SWC, neither is confirmed successful.
- Phase 3 must not be considered complete until dependency install, typechecking, build and frontend/backend runtime are confirmed. No functional login/admin dashboards, migrated DB, or public CMS exist yet.
- `handoff-private/` holds the client-provided answered questionnaire, template, and original photo. **Sensitive. DO NOT commit, deploy, publish, or upload this folder to public repositories.** `.gitignore` excludes it. Reference portrait and contact data require client consent for public use.
- `docs/visual-approval/` includes a collage/screenshots with illustrative (not factual) dashboards, metrics, job labels and project figures. **Never turn any example metric, project, claim or visitor count in mockups into live content.**
- The source in this ZIP is from the previous authored scaffold. If the developer has made further local edits, use the latest locally updated files or merge changes thoughtfully; do not overwrite blindly.
- Website custom email setup is explicitly out of scope until after the portfolio is finished.
- After every *completed phase that includes code*, make a ZIP of the **whole current project** (no `.env`, secrets, `node_modules`, build caches, or private client documents in any public/deployment ZIP), and update memory and handoff files.

## How to begin
Extract the ZIP, open `seraphine-portfolio/` as the Codex workspace, then paste `CODEX_PROMPT.md` into Codex. If Codex can directly use the files, do not ask it to recreate them from scratch.
