# Phase 7 — CMS and full portfolio integration

Date: 2026-11-05 (Europe/Paris). **COMPLETED — implementation and critical automated application/database/build acceptance passed; manual browser QA remains deferred.** No Phase 8 work, deployment or real account provisioning is included. Browser interaction remains unverified because the browser host and native pipe are unavailable.

## Final independent review — 2026-11-05

**Final status: COMPLETED for Phase 7 implementation and automated acceptance. Phase 8 NOT STARTED.** Actual source, dirty Git state, memory, CMS/API/publishing/media documentation, schemas and tests were inspected again. The existing uncommitted implementation was preserved. This review made targeted Phase 7 corrections; it did not rebuild the application or redesign either dashboard.

The first integration rerun reproduced two failures: an empty authenticated create returned 500, and synchronization reported current after HTML tampering. A separate PDF regression reproduced acceptance of an active annotation whose subtype used an indirect reference. These failures were fixed and all affected suites rerun successfully; none were skipped or suppressed.

| Finding | Cause, correction and evidence |
|---|---|
| Incorrect synchronization status | Status compared only the receipt revision. A shared backend verifier now reads the HTML and checks its hash and revision for both status and serving. Real HTTP/database tests cover altered HTML, missing HTML and missing receipt, restoring only isolated test artifacts. |
| Preview check/serve race | Preview checked a page, then delegated to static serving for another read. It now sends the exact checked bytes. An isolated real Vite preview test proves no downstream reread, valid GET/HEAD, and denial for tampering, missing files, stale revisions and API outage. |
| Empty CMS create returned 500 | Idempotency hashing preceded schema validation. Validate/normalize first; real authenticated empty-body requests now return 400 while concurrent idempotent creates still produce one row/receipt. |
| Indirect active PDF subtype | The annotation check examined direct PDF names only. Resolve the subtype reference before checking; the regression now rejects it. Existing decoding, plain-PDF, nested-action and metadata tests still pass. |
| Ordering disturbed other pages | Page-local renumbering could move untouched records with tied default orders. Arrows now load the bounded complete collection, validate selected versions/adjacency and submit global ranks through the existing atomic/versioned API. Tests preserve all 25 tied-order records across both pages and reject stale input/collections over 100. Larger collections use the existing Display order field. |
| Cacheable public-media errors | File lookup could fail before no-store was set. Public media routing now sets it before validation/lookup, including 404 responses; integration assertion passes. |

Canceling an editor also reloads its list so a conflict can be resolved against current versions. Contact coverage now explicitly exercises read, unread and archived states before deletion.

Final fresh evidence is in the table below. Both dev and test Prisma comparisons returned **no differences, exit 0**. Read-only metadata checks verified all six foreign keys/deletion rules and five named domain CHECK constraints on both schemas. The recovered-field comparison passed for all 16 development records, and all thirteen test application tables were empty afterwards. No recovery, server restart, seed/reset, schema migration, real-account creation or development-record mutation was performed.

**Blocked/untested:** browser inventory was retried: no apps/browsers, browser host unavailable and native pipe error 2. Real browser hydration/console, clicks, focus, responsiveness, screenshots, accessibility interactions and performance measurements remain untested. Matching server-rendered/embedded snapshots and bundle budgets passed; they do not establish a browser pass. The exact Phase 4/6 manual lists and Phase 7 list below remain outstanding.

**Known noncritical UX limitation:** unsaved-change prompts cover refresh and application navigation, but native browser Back/Forward currently changes the route without that prompt. Save/cancel before using browser history; this remains a browser QA/follow-up item. No unresolved critical server, database or privacy defect was found by the completed checks. This statement does not establish production readiness or absence of all bugs.

**Production dependencies:** provider deployment/rebuild integration and cache behavior are unconfigured and untested; use the documented Express gate, never an ungated static host. HTTPS/origin/proxy/shared rate storage, private media/database backup operations, owner content/portrait/contact consent, real private account provisioning and approved message retention remain prerequisites. No personalized email or automatic purge was added.

No new ZIP, Git commit/tag or push was performed. The existing Phase 7 ZIP is a preserved historical checkpoint and does not contain these review corrections. The Phase 8 version-control policy remains effective for future work, without retroactive release operations.

## Scope and implementation report

| Area | Delivered behavior |
|---|---|
| Baseline | Clean inherited Git state; required memory, actual source/schema/services/tests and recovery documentation inspected. Existing source, isolated DB/auth and connection checks passed before major CMS work. |
| Database | Existing normal-mode MariaDB 10.4.32 at loopback 13312. Original thirteen models and two migrations reused; no Phase 7 migration, reset, seed or recovery/cutover repeated. |
| Authentication prerequisite | Real login, refresh, logout, session revocation, roles and temporary-password restrictions verified with synthetic accounts in the isolated test database only. Existing hidden-input real-account procedure retained. |
| Profile | Current data, full validated editing, draft saving, private preview, portrait selection, publish/unpublish, independent dated public-contact consent and audit. Required name/title preserved. |
| Experience | CRUD, nullable year periods, current-position validation, responsibilities, verification, drafts/preview, publish/unpublish, order and restrictive removal. Existing provisional jobs stay draft. |
| Education | CRUD, qualification/institution/country/year/notes, verification/publication/order. Unverified official titles stay draft. |
| Skills | CRUD, categories/descriptions, verification/publication/order. No invented proficiency percentages. |
| Projects | CRUD, summary/body/role/organization/results/year ranges, immutable unique slug, featured flag, library attachments, private preview/publication/order. Public API URLs and homepage fragments remain stable. No fictional owner projects. |
| Achievements | CRUD, year/description, optional project with publication relationship checks, drafts/preview/publication/order. No fabricated owner achievements. |
| Certifications | CRUD, issuer/year/credential details and approved document attachment, drafts/preview/publication/order. Missing official metadata stays private. |
| Media | Binary signatures/extension/MIME/size and real decoder validation; private originals; optimized metadata-free main/thumbnail variants; conservative PDF parsing; explicit approval; guarded public/private serving; attachment/replacement/detach/restrictive removal; rollback and orphan reconciliation tooling. |
| Lifecycle | Editing returns content to draft and withdraws its public version. Explicit publish confirmation/verification; atomic audits, row locks, version conflicts, monotonic versions, transactional order changes and idempotent content creation. |
| Public integration | Existing public DTO services/endpoints reused. One transactionally consistent aggregate drives all homepage sections and contacts. Independent frontend professional-content arrays removed. Unpublished/empty sections and navigation omitted. |
| Prerender/SEO | Same React/Vite build-time rendering and hydration. Exact embedded public snapshot; escaped text/JSON; updated page/social metadata and Person JSON-LD; noindex/default absent canonical retained. No runtime React SSR. |
| Synchronization | Guarded local fixed-command rebuild API/CLI and genuine current/built status. Express and Vite preview block stale/tampered/missing HTML or DB downtime. Hosting-specific automation is pending; ungated static hosting is unsupported. |
| Contact | Real validated/rate-limited/honeypot/time-checked public submission; success only after database storage. Private list/view/read/unread/archive/remove with version checks/audits. No email delivery or automatic retention purge. |
| ADMIN | Existing light Studio extended with seven editors, library, messages, settings, previews, ordering, confirmations, feedback and actual synchronization. |
| SUPER_ADMIN | Existing dark Operations extended with the same guarded owner-support CMS, actual publication breakdowns/activity, recorded main-media byte counts and sync state. Technical-only account/log/status restrictions retained. |
| Security | Existing HttpOnly/Strict/production Secure cookies, exact Origin/header, live session/account/role checks, allowlisted DTOs/inputs and rates preserved. No raw HTML, credentials, storage paths, drafts or messages in public artifacts. |
| Audit | Create/update/remove/publish/unpublish/reorder; media upload/edit/approve/revoke/delete; message status/delete; dated contact consent; settings and rebuild request. Transactional mutation audits omit private text and authentication material. |

## Executed automated evidence

The results below are reconciled with executed command output. No failing test was skipped or suppressed.

| Check | Result |
|---|---|
| `npm test` | PASS: 6 structure, 18 frontend, 20 backend unit/service + 7 HTTP scenarios (backend runner 28 including parent); zero failures/skips |
| `npm run test:db -w backend` | PASS: 11 database, 18 authentication and 14 CMS scenarios; runner counts 12/19/15; zero skips |
| TypeScript | Both workspace checks pass |
| Production build | Both workspaces and real frontend export/prerender pass |
| `npm run test:build -w frontend` | PASS: four HTML/metadata/bundle/privacy/private-shell checks |
| Development/static/compiled regression | Phase 4 harness: 46 dev + 7 production page/module/asset requests; compiled health 200 / malformed JSON 400 / oversized JSON 413 |
| Phase 5 compiled regression | Eight live public/database/health endpoints pass |
| Phase 6 compiled regression | Seven private guest denials/no-store, foreign Origin rejection, seven neutral route shells/assets pass |
| Phase 7 compiled/preservation check | 19 serving/guard/private-path checks pass; all recovered development fields match; zero test application rows; six foreign keys/rules and five domain checks verified on both schemas |
| Prisma | Fresh schema validation passed on 7.10.1; both dev/test schema comparisons show no differences; existing migration history and both source checksums verified on dev/test; no new schema/migration |
| Dependency audit | Full dependency audit and production-only audit both report zero vulnerabilities |
| Credential/preservation scan | PASS: 208 eligible source files and 39 public build files compared with actual local credential values and private-key markers, without printing secrets. Environment, schema, both migrations and historical ZIP hashes unchanged from review baseline. No archive created. |
| Browser/viewport/interaction | NOT RUN: browser host unavailable; native pipe error 2. No screenshots, layout pass, focus/interaction result, Lighthouse or CWV claimed |

The CMS acceptance suite uses only exact local `seraphine_portfolio_test` / `seraphine_test`, refuses any existing application records, executes sequentially after historical DB/auth suites, captures created IDs and removes its recorded fixtures. Test media and complete builds use ignored isolated locations; development output is not replaced with test records. Synthetic credentials are generated in memory. No real development users were created.

Representative application-level end-to-end evidence: actual authenticated ADMIN login → create/retrieve private draft → authenticated preview → verification/publication → existing public DTO retrieval → real Vite build from the isolated database → project visible in prerendered HTML with identical hydration JSON → edit withdraws it → stale HTML blocked → republish shows edited DTO → unpublish removes public API/media access → audits and persistence verified. This is real HTTP/database/build acceptance, not a browser end-to-end test. Each collection also exercises CRUD/order/publication; profile additionally verifies independent contact consent and revocation.

Media evidence includes actual image upload/processing, denied guest/private access, missing public approval, attachment/approval, published access, shared-use deletion refusal, unpublish withdrawal and safe detach/removal. Unit tests check forged content, invalid formats/size/signatures, real decoding, dimension bounds, metadata stripping and nested active PDF rejection. Concurrent content-create retries produce one record and receipt. Stale edits, duplicate slugs, invalid periods and missing reorder targets return errors without partial updates. An actual isolated build with an unavailable database fails with a safe fixed message, emits no raw driver error/URL and leaves the previous artifact unchanged; stale content is still refused by the gate.

## Preservation and runtime observations

`scripts/verify-phase07.mjs` uses read-only scoped connections and compares hashes of every field of all thirteen development application tables with the retained private logical extraction. **All 16 application records match exactly.** Development remains profile 1, jobs 2, education 3, skills 6, training 3, settings 1; zero users/messages/media/projects/achievements/sessions/audits. Both dev/test have the original two completed, source-matching migrations. Test application tables are empty. Actual server mode is normal (0), port 13312, with the adopted rehearsal-02 datadir. The check also verifies backend/.env is unchanged during execution.

No URL/JWT/config rewrite, database restart/reset, shared XAMPP change, recovery export/backup modification or real-account provisioning was performed. Level-6 skipped-redo freshness remains unproven; matching recovered rows cannot prove latest original committed transactions survived. The earlier first-rehearsal Aria failure remains unexplained. See the preserved incident and rehearsal reports; their historical phase labels do not override this checkpoint.

Final normal development output at the review build: homepage 11,191 bytes; public JS approximately 76.36 kB gzip, CSS 4.69 kB gzip; lazy workspace JS 14.78 kB gzip and CSS 3.67 kB gzip. These are build transfer estimates, not measured user performance. No heavy frontend dependency was added; Sharp and pdf-lib are backend-only.

## Issues found and resolved

- A generic media update accidentally included its edit-version envelope in the Prisma data; narrowed the update payload, then real upload/attachment/approval tests passed.
- Removing draft sections revealed a hardcoded footer anchor; footer links now follow the same published sections and unique-ID/anchor tests pass.
- Node/Vite config fetch typings rejected browser-only cache options; corrected the trusted preview target/types and the actual isolated production build passed.
- Windows sandbox blocked selected Node/Prisma subprocesses with EPERM; standard approved execution passed. No application guard or test was disabled.
- Existing Vite HTTP harness now starts its isolated API before gated preview and disables unneeded dependency discovery during teardown.

## Manual acceptance and remaining dependencies

Keep the exact Phase 4 checklist in `PHASE_04_VERIFICATION.md` and exact Phase 6 checklist in `PHASE_06_VERIFICATION.md` unchanged. Add these Phase 7 checks at **320, 375, 390, 768, 1024, 1440 and 1920px**:

1. In both light Studio and dark Operations, inspect every content form, long text, field labels, mobile menu/sidebar scrolling, empty lists, project/media selection, pagination, ordering and dialogs for clipping/overflow.
2. With privately authorized disposable accounts, create/save/reload/preview/publish/edit/republish/unpublish/remove each content type. Verify checkbox/date errors, duplicate slug feedback, failed saves retaining text and two-editor conflicts. Check unsaved-change prompts during refresh/internal navigation and browser history behavior.
3. Upload valid image/PDF and reject invalid/oversized files. Inspect private preview, alt text, portrait/certificate/project attachment/replacement, public approval/revocation and restrictive removal. Confirm network denials without a session and after unpublishing.
4. Submit the contact form; verify failure/success announcements, private retrieval, read/unread/archive, delete confirmation and rate/error behavior. Verify no email delivery is implied.
5. Verify Update public website status through success/failure, stale-page 503, current public content/metadata, exact hydration, console, no-JavaScript navigation and API downtime. Confirm no private chunks/data on public first load.
6. Test keyboard labels/focus/tab order, native dialog trap/Escape/return focus, screen reader announcements, touch, zoom/text spacing, reduced motion and supported browsers. Record real results; do not infer them from SSR or source tests.

Real maintainer/owner accounts still require the private procedure in `AUTHENTICATION.md`. No account/password should be sent to the agent. Owner approval remains required for portrait, public contacts, provisional dates, official credentials and real projects/achievements. The later comprehensive visual/UX revamp and personalized email remain deferred.

Before production: choose hosting, honor the dynamic publication gate/no-store policy, integrate the fixed rebuild interface with deployment if appropriate, configure same-origin HTTPS/proxy/shared rate storage, private media backups/access and key distribution. Do not serve dist on an ungated static host. Approve a message-retention policy before scheduling deletion. No third-party deployment or global cache invalidation is claimed.

## Delivery and next phase

Historical complete-source archive: `C:/Users/HP/Pictures/Aunt nyirarukundo/seraphine-portfolio-phase-07-complete.zip`. It was verified at the original delivery and is preserved unchanged. It predates this final review and its corrections; the existing project folder is current. No replacement ZIP was requested or created. Secrets, originals/private uploads, recovery exports and preservation backups remain excluded from source control.

Phase 8 is NOT STARTED. Its prepared inputs are the preserved manual checklists, automated regression commands, deployment/content dependencies and this report. Starting Phase 8 requires a new instruction.
