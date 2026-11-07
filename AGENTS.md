<!-- phase08-current -->
> **Latest checkpoint — 2026-11-07: Phase 8 COMPLETED locally; private GitHub backup BLOCKED. Phase 9 NOT STARTED.** Read [Phase 8 verification](docs/PHASE_08_VERIFICATION.md) and [manual follow-up](docs/PHASE_08_MANUAL_ACCEPTANCE.md). This checkpoint supersedes historical phase/browser/ZIP instructions below. Phase 7 already exists in b39ca42; the Phase 8 delivery is identified by local annotated tag phase-08-verified. Origin is public/read-only: no push until a private writable destination is verified. No automatic ZIP or real accounts. Preserve historical archives, dedicated MariaDB on port 13312, all 16 recovered records, environment/JWT and separate private backups.

## Permanent Phase 8 conventions

- Preserve native private document navigation and same-URL guard. Dirty editors use beforeunload; keep real Back/Forward/refresh/cancel tests. Prompts require user activation and cannot guarantee mobile process termination protection.
- Workspace owns authentication redirects. Login/logout/session callbacks update state only; keep real expired-session, forced-password and cross-role navigation checks to prevent competing document replacements.
- Contact POST requires UUID Idempotency-Key. Identical normalized retries reuse a receipt while the message exists, with CSRF/timing/rates retained. Keep synchronous submit guard, failure values and SSR-disabled/no-JS POST privacy.
- Only verified public HTML and generated code assets are compressed. Only hashed code assets are immutable; preserve HTML/API/media no-store/freshness and private/auth compression exclusion. Code assets contain no CMS snapshots.
- Copy validated PDF pages/resources into a clean metadata-free context; retain active-content/private-original protections. Review processed PDFs before approval. Keep keyed media forms, dialog invoker focus and measured contrast.
- Browser and real DB suites share an exclusive test lock, exact test schema/account/port/instance guards, initially-empty refusal and captured-ID cleanup. Never overlap them or delete a live test/build lock. SSR tests use separate per-suite/process Vite caches.
- New commands: npm run test:browser, npm run verify:database, npm run measure:performance -- final. Tooling requires Node 22.19+ (verified 24.11.1). Ignored .cache reports/screenshots are QA evidence, not backups.
- Record versions/throttling/build fingerprints, valid-run provenance and before/after metrics. TBT is not INP; WebKit is not actual Safari; axe and CSS reflow do not prove complete WCAG or actual zoom acceptance.
- Continue Git commits/annotated verified phase tags and conditional private pushes under docs/VERSION_CONTROL_POLICY.md. No automatic future phase ZIP, Phase 9, final revamp, deployment or real provisioning without authorization.
<!-- /phase08-current -->

---

Historical checkpoints below are superseded by this Phase 8 checkpoint.

# Final Phase 7 review checkpoint — 2026-11-05

Phase 7 remains **COMPLETED for implementation and automated acceptance** after independent source/database/build review and safe corrections. Phase 8 is **NOT STARTED**. Read docs/PHASE_07_VERIFICATION.md for reproduced failures, fixes and exact evidence. Final source suites: 6 structure, 18 frontend, 20 backend unit/service + 7 HTTP cases; real DB/auth/CMS: 11/18/14 scenarios; all passed with zero skips. Both typechecks/builds, four artifact tests, compiled serving and dev/test schema/constraint checks passed; all 16 recovered rows match and test tables are empty.

Synchronization must verify actual HTML bytes/existence as well as revision; serving sends those checked bytes. Validate CMS create input before fingerprinting. Resolve indirect PDF annotation subtypes. Ordering arrows preserve the complete collection up to 100 records and reject stale versions; larger/cross-page moves use Display order. Public-media errors must also be no-store.

Browser host/native pipe remain unavailable. Preserve exact manual checklists, hosting/content/account/retention dependencies and recovery caveats. Native Back/Forward currently bypasses unsaved-change prompts; save/cancel first. No new archive/commit/tag/push was made. Historical ZIP remains unchanged and predates these corrections. Preserve all uncommitted work and the current Phase 8 version-control policy.

---

# Backup and version control policy — effective Phase 8

The project representative approved [docs/VERSION_CONTROL_POLICY.md](docs/VERSION_CONTROL_POLICY.md) on 2026-11-05. Starting with Phase 8, develop in the existing project folder, preserve changes with Git commits, create a tag after each successfully verified phase, and push completed commits/tags to the configured private GitHub repository after verifying its privacy/access. Keep project memory and phase verification reports current. Never commit secrets, private files or sensitive database backups; preserve the MariaDB recovery environment and maintain separate verified database backups.

Do not automatically generate phase ZIPs from Phase 8 onward. ZIPs require an explicit request or final handover. Do not delete earlier ZIPs without permission or revise completed phases solely to change their backup arrangements. This future policy overrides older automatic-ZIP instructions below without changing historical deliveries. Phase 8 remains NOT STARTED.

---

# Latest Phase 7 checkpoint — 2026-11-05

Phase 7 is explicitly authorized and now IMPLEMENTED with automated CMS/database/build acceptance. Read PROJECT_STATUS.md, HANDOFF.md and docs/PHASE_07_VERIFICATION.md first. These current instructions override older Phase 7-not-started checkpoints retained below. Phase 8 is NOT STARTED and needs a new instruction.

Preserve all Phase 6 authentication rules and the dedicated normal-mode MariaDB at 127.0.0.1:13312. No Phase 7 schema change, recovery/cutover/restart/reset, .env/JWT/URL rewrite or real account creation was needed. All 16 recovered development records still match the private exports field-for-field; test fixtures are cleaned. Keep level-6 freshness uncertainty and the unexplained first-rehearsal Aria evidence.

CMS edits return to DRAFT and withdraw the old public version. Row locks, expectedUpdatedAt, transactional audits, create idempotency receipts, immutable project slugs, verification and separate contact/media consent are mandatory. Both roles support the same single-owner CMS; technical-only access rules remain.

Public content is database canonical. Retain matching prerender/hydration snapshots, live DTO refresh and fail-closed HTML freshness gates. Never deploy dist to an ungated static host. Hosting automation remains pending. Private original uploads, cache inputs and test releases must stay ignored and excluded from archives.

Browser/native hosts remain unavailable; exact Phase 4/6 checklists and Phase 7 manual additions remain open. No visual/browser/CWV pass is implied. Real accounts require private hidden-input CLI setup. Final visual/UX revamp and personalized email remain deferred.

---

# Current Phase 6 completion - 2026-11-05

> **Latest completed checkpoint - 2026-11-05:** Phase 6 COMPLETED after explicitly authorized dedicated development cutover and final acceptance. Actual backend/.env now targets normal-mode MariaDB 10.4.32 at 127.0.0.1:13312, private 2026-11-05-rehearsal-02/data; only four database URL lines changed, with JWT and all unrelated bytes preserved. Complete owner-restricted offline snapshot and original .env backup verified at C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-pre-cutover-01. All 28 dev/test tables and 16 recovered records, migrations/drift/shadow replay, 11 DB + 18 auth scenarios, TypeScript/tests/production builds/API/artifact checks and two post-cutover workload restarts passed. Shared XAMPP data/data-old, unrelated databases, original backups and 176 private export files remain unchanged. Dedicated instance left running; XAMPP Control Panel does not manage it. Level-6 freshness remains unproven; first-rehearsal Aria failure remains unexplained and retained. No real administrator accounts. Manual browser QA remains deferred. Phase 7 NOT STARTED. See docs/PHASE_06_DATABASE_INCIDENT.md, docs/PHASE_06_VERIFICATION.md and docs/XAMPP_SETUP.md. Do not repeat recovery, initialization or cutover; use documented start/stop commands.

Phase 6 is COMPLETED. The latest completed checkpoint above overrides historical phase/restart restrictions below. Preserve all current modifications, private configuration, scoped grants, authentication conventions and deferred manual checklists. Phase 7 still requires explicit authorization.

## Permanent authentication/dashboard conventions

- Prisma CLI/Client/official MariaDB adapter now locked together at 7.10.1 (security patch). Keep current lockfile and Prisma 7; old 7.10.0 references are historical.
- Tokens only in HttpOnly/Strict cookies, Secure in production; no localStorage/sessionStorage or JSON token responses. Exact configured Origin + X-Portfolio-Request header required for ALL mutations including login/refresh/logout. No exceptions for absent Origin.
- Validate JWT algorithm/issuer/audience/expiry/purpose/session identity and read current DB session/account/role on every protected request. Temporary-password users cannot access dashboard data. No role header, mock token or auth bypass.
- User-row locks and transactions protect credential/session mutations and audits. Refresh rotation stores hashes only, replay revokes session, absolute seven-day expiry never extends. Password change/recovery/deactivation invalidate sessions. Never log credentials, raw tokens or driver errors.
- Maintainer bootstrap/emergency recovery are explicit local hidden-input CLI workflows. No public signup/reset/bootstrap or SUPER_ADMIN HTTP changes; ADMIN account operations require current SUPER_ADMIN password. No real credentials in commands, docs, tests or archive.
- Keep authenticated data out of public source/prerender. Private route modules lazy-load, neutral shells contain no private HTML. Light owner Studio and dark Operations remain distinct. Real read-only summaries/messages in Phase 6; all CMS editing/publishing stays Phase 7.
- Auth tests use only exact isolated test DB/account, refuse application data, run sequentially and clean recorded IDs. Keep seed account-free. Preserve local backend/.env and JWT key; ZIP secret scan includes signing secrets as well as DB passwords.
- Browser host/native pipe unavailable in this session; no visual/interaction pass implied by SSR/API tests. Carry exact Phase 4 and Phase 6 manual lists and final visual/UX revamp forward. Personalized email remains postponed.

---

# AGENTS.md — mandatory instructions for ChatGPT, Codex and other agents

> **Current continuation (2026-11-03):** The project representative accepted Phase 4 for progression with browser/performance checks deferred and explicitly authorized Phase 5. Phase 5 backend/database development is complete; read `docs/PHASE_05_VERIFICATION.md`, `PROJECT_STATUS.md` and `HANDOFF.md`. Phase 6 is NOT STARTED. Historical phase notes below remain history; they do not override the latest authorization. Preserve the Phase 4 manual checklist for later QA and the planned final visual/UX revamp.

This repository is **Nyirarukundo Seraphine's** bespoke portfolio website and future CMS. The design is client-specific, elegant and exceptionally fast, not a generic AI-generated template.

## On every session

1. Start with `CODEX_START_HERE.md` and `CODEX_PROMPT.md`, then read `PROJECT_STATUS.md`, `HANDOFF.md`, `DECISIONS.md`, `DESIGN_SYSTEM.md`, `ARCHITECTURE.md`, `BACKLOG.md` and `CHANGELOG.md`.
2. Inspect actual source and test state before claiming functionality exists. The Phase 2 screenshots are concept designs, not working dashboards.
3. Honor the **approved 2026-10-30 bright, portrait-led homepage** with large navy/blue `Nyirarukundo Seraphine` heading. Maintain **light ADMIN** and **dark SUPER_ADMIN** dashboard distinction.
4. Do not jump to an unapproved redesign or invent content/metrics to populate layouts.
5. Track current phase and acceptance criteria accurately. Note blocked work honestly.

## Stack and architecture

- `frontend/`: React + Vite + TypeScript. Prioritize fast first paint, accessible mobile-first layouts, strong SEO/pre-rendering, high-quality but optimized images, lightweight animation, graceful fallbacks and `prefers-reduced-motion`.
- `backend/`: Node.js + Express + TypeScript, Prisma 7.10.0 + official MariaDB adapter. Phase 5 schema is migrated to local XAMPP MariaDB; runtime and migration accounts have separate scoped permissions.
- Authenticated roles: `SUPER_ADMIN` (developer/support) and `ADMIN` (Seraphine); GUEST is not a database account type.
- JWT/session auth, role guards, actual dashboards, CMS, database writes, and contact delivery are NOT implemented in Phase 3.
- No public admin signup, no default passwords, no privilege escalation, use HttpOnly cookie strategy + CSRF protection for future auth, keep audit trails.
- Keep deploy/infrastructure secrets outside source and ZIP. Use only `.env.example`.

## Data authenticity

- Name: **Nyirarukundo Seraphine**. Title: **Water Treatment Plant Engineer**. Kigali, Rwanda. User form says 11 years and WASAC Group.
- Dates `2015–2021` and `2022–present` are provisional, must be verified before publishing.
- Synthetic standing portrait needs Seraphine's explicit likeness/public-use approval. Do not label it a real work-site photograph.
- Projects, achievements, precise credential names, certifications, analytics, awards and traffic data MUST NOT be fabricated.
- Phone/email should not be displayed until owner authorizes public publication.
- Personalized email setup is postponed until after website completion; do not introduce it during development phases.

## Testing and delivery rule

- Use tests relevant to the phase. Syntax-only tests do not prove runtime correctness.
- Phase 3 install/build/health verification has passed on 2026-11-02; see `docs/PHASE_03_VERIFICATION.md`. The original authoring environment had no registry access; that historical limitation is resolved here.
- At end of EVERY COMPLETED phase with code, update all memory files and create a ZIP of the **entire latest repository** (including Phase 2 designs, sources, docs), excluding node_modules and secrets. Provide verified download link immediately.
- Maintain `PROJECT_STATUS.md`, `CHANGELOG.md`, `BACKLOG.md`, `HANDOFF.md` for multi-agent continuity.
- Prefer small, reviewable changes and honest limitations; distinguish visual concepts from real apps.

## Codex handoff update (2026-11-02)

- This is the real inherited codebase, not a request for a new application. Finish Phase 3 first.
- The historical Windows Vite/Babel error is no longer reproducible after a verified clean install; its original cause is not proven. Keep the lockfile and Babel plugin. See `docs/PHASE_03_LOCAL_ERROR.md`.
- The `handoff-private/` directory is included for private developer context only, ignored by Git and forbidden from public deployment.
- Preserve the exact visually-approved direction from `docs/visual-approval/` and `design/prototype/`; their illustrative text is NOT authentic client content.

## Verified continuation — 2026-11-02

- Phase 3 acceptance evidence is in `docs/PHASE_03_VERIFICATION.md`; read current status before interpreting the historical `CODEX_PROMPT.md`. Phase 4 has not been implemented.
- `npm ci`, `npm test`, `npm run typecheck`, `npm run build`, Prisma validate/generate and real local API/browser checks passed. A local ignored `.env` is expected and must never enter the ZIP.
- MySQL remains unavailable; generated Prisma Client is ignored, no migrations exist, no DB-backed application behavior is implemented.

## Phase 3.1 architecture — verified 2026-11-03

- Phase 3 and 3.1 are complete; Phase 4 remains NOT STARTED. Read `docs/PHASE_03_1_VERIFICATION.md` for current checks and browser limitations.
- Backend: route → controller → service → Prisma/data access. Routes bind endpoints; controllers handle validated HTTP input/output; services own business rules and simple Prisma access when Phase 5 begins. Current health/metadata need no service. Use `middlewares/` for shared concerns, `config/` for environment validation and `.js` import specifiers for NodeNext.
- Frontend: `src/app/` for composition, `src/features/` for feature UI/data/types, `src/shared/` for genuinely shared UI/layout/styles. Shared code must not import feature content. Pass data into leaf sections; compose sections in portfolio `HomePage`. Use explicit relative imports and type-only imports where appropriate.
- Do not create empty modules, speculative repositories, providers, router setup or a certification section to fill a folder diagram. Preserve current contracts/DOM/CSS/content during structural work.
- `npm test` now runs structural, frontend render and backend HTTP suites. Static render tests do not prove browser interaction; browser checks from Phase 3.1 remain unavailable and are documented for manual follow-up.

## Phase 4 permanent conventions — 2026-11-03

- Production frontend builds must run the prerender step, not only `vite build`. Use `npm run build`, then `npm run test:build -w frontend`. Hydrate the same App tree; keep server build entries outside public dist and avoid time-dependent SSR/client markup.
- Mobile navigation uses native disclosure semantics. Preserve no-JavaScript content/navigation and reduced-motion behavior; do not initially hide content behind observers.
- Public data/config must contain only information safe to bundle. Do not place unapproved contacts or future private CMS drafts into client code behind visibility flags. Empty project content renders no section or navigation link.
- Questionnaire checklist options are not confirmed skills unless actually selected or supported by written answers. Official training metadata remains unconfirmed.

## Phase 5 permanent conventions — 2026-11-03

- Use existing XAMPP MariaDB, not a second installed server. Current dev/test/shadow databases are separate. If stopped, ask the user to start MySQL in XAMPP Control Panel. No unrelated XAMPP configuration/service changes.
- Preserve backend/.env and never print/package credentials or MariaDB SHOW GRANTS authentication hashes. DATABASE_URL is DML runtime; MIGRATION_DATABASE_URL is scoped DDL; both target the same dev schema. SHADOW_DATABASE_URL must target a distinct disposable schema. Escape underscores in database-level grants to avoid wildcard access.
- Never reset/truncate/drop an existing or unknown database. Inspect target/schema/data before applying migrations. Keep reviewed migrations and explicit SQL CHECK constraints; do not substitute db push for migration history.
- Preserve route → controller validation → service → shared Prisma client boundaries. Strict allowlisted Zod input; explicit public selects/DTOs. Do not create PrismaClient per request or log raw driver errors/requests.
- Content edits return to DRAFT; collection publication requires verification. Contacts require explicit dated consent; profile edits revoke it. Private media/storage keys, drafts, accounts, messages and logs never belong in public responses/bundles.
- Internal CRUD/consent/media/message services are not public authorization. No mutation routes, fake auth headers/tokens, admin signup or seeded passwords before real Phase 6 auth/roles/CSRF/auditing.
- Real DB tests use only the exact local seraphine_portfolio_test database/account, refuse existing application data and clean only IDs they created. Mocks/schema validation do not count as DB verification. Seed must be create-only/idempotent and preserve editor changes.
- Package reviewed migration.sql under the narrow migrations allowlist, while excluding dumps, real env, private originals and generated Client/build outputs. Verify complete archive extraction, source hashes and local credential exclusion.
- Carry Phase 4 browser/performance debt and owner content/portrait/contact approvals forward. Final visual/UX revamp is planned after major implementation; personalized email remains postponed.
