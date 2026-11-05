> **Final independent Phase 7 review — 2026-11-05:** Phase 7 **COMPLETED for implementation/automated acceptance**; Phase 8 **NOT STARTED**. Fresh suites passed: structure 6, frontend 18, backend 20 unit/service + 7 HTTP (runner 28), DB/auth/CMS 11/18/14, four artifacts, both types/builds, 46 dev/7 preview requests and compiled API/19 Phase 7 checks. Both Prisma schema comparisons show no differences; migration checksums, six relationships/five domain checks per schema, exact 16 recovered rows and empty test tables verified. Dependency audits report zero vulnerabilities.

Review corrections: actual HTML integrity/existence determines synchronization status; preview sends the verified bytes; create validation precedes idempotency hashing; active PDF subtype references resolve before checking; arrows reorder the complete bounded collection and preserve other pages; public-media errors are no-store; cancel reloads current list versions. See docs/PHASE_07_VERIFICATION.md for original failing regressions and final results.

Browser hosts remain unavailable. Native Back/Forward bypasses unsaved-edit prompts; save/cancel first and carry into browser QA. Over 100 records/cross-page ordering uses Display order. Preserve all manual lists and hosting/HTTPS/shared limits/media backup/content consent/account/retention dependencies. No new ZIP/commit/tag/push: the old ZIP is preserved unchanged, predates corrections, and the workspace is current. Do not repeat recovery or modify secrets/backups.

---

# Handoff — Phase 7 CMS implemented and verified

Updated 2026-11-05 (Europe/Paris). **Phase 7 COMPLETED for implementation/automated acceptance; browser QA deferred. Phase 8 NOT STARTED.**

**New policy for Phase 8 onward:** Read [docs/VERSION_CONTROL_POLICY.md](docs/VERSION_CONTROL_POLICY.md). Use Git commits, tags after successful phase verification, and pushes to the configured private GitHub repository after privacy/access verification. Do not automatically generate phase ZIPs; only explicit requests/final handover require one. Preserve existing archives and historical phase arrangements. Keep secrets/private files out of Git and maintain separate verified database backups. No retroactive Phase 7 commit/tag/push or Phase 8 implementation was requested by this policy update.

Start with PROJECT_STATUS.md and docs/PHASE_07_VERIFICATION.md. The attached Phase 7 instruction authorized the implementation; historical Phase 7-not-started statements elsewhere describe earlier checkpoints. Do not recreate the project or restart recovery.

## Continue from this state

All seven owner content areas now have real guarded editors/CRUD, draft previews, verification/publication, order and safe removal. Media library, attachments, approval, processed/private/public file serving, contact submissions, message management and metadata settings are integrated into the existing light Studio/dark Operations.

The database is canonical. Old independent frontend professional-content arrays were removed. The build exports only existing public DTOs inside a transaction, prerenders the same React App, embeds the same snapshot for hydration, and writes a revision/HTML receipt. Express serves current valid HTML; stale/missing/tampered output or DB downtime returns neutral 503. Vite preview has the same gate. Never deploy dist on an ungated static host.

See docs/CMS_ARCHITECTURE.md, CMS_API_REFERENCE.md, CONTENT_PUBLISHING.md, MEDIA_MANAGEMENT.md and CMS_USER_GUIDE.md. The fixed local rebuild interface is `node scripts/rebuild-public.mjs`; the guarded dashboard control reports started/completed/failed separately. Hosting integration remains pending. Builds require a reachable DB and installed build dependencies. One exclusive lock prevents overlap.

## Permanent implementation rules

- Keep Phase 6 cookies, exact Origin/header CSRF, JWT validation, live DB sessions/roles, forced password replacement and reauthenticated technical account operations. No local/session storage tokens, public registration or role/header bypass.
- Every CMS mutation must retain its input allowlist, row/version check and transactional audit. Creates use UUID Idempotency-Key receipts. Reorder is atomic; project slugs stay fixed.
- Edits withdraw a published record until republished. No simultaneous public draft revision. Profile edits revoke contact consent; publication requires separate explicit dated consent. No automatic verification of provisional jobs/education/training.
- Original files remain outside static roots in ignored backend/.private-media; only processed variants can be served. Public files require approval plus a published eligible attachment on each request. No raw storage path input/DTO, SVG upload or referenced-file deletion.
- New contact messages have no automatic expiry/purge pending owner retention approval. No email sending. Audit logs never store private message/content bodies or credentials.
- Test DB suites run sequentially and refuse existing application rows; preserve their exact local test-schema/account guards, captured-ID cleanup and isolated test storage/build directories.

## Database protection

Dedicated MariaDB 10.4.32, normal mode 0, loopback port 13312, private rehearsal-02 datadir/config and existing scoped accounts remain. No Phase 7 schema change/migration, .env/JWT/URL change, database restart/reset, shared XAMPP repair, recovery export/backup modification or real users. Both original migrations/source checksums match; all fields of the 16 development records match the private recovery exports; test application tables are empty.

Keep level-6 skipped-redo freshness uncertainty and the unexplained first-rehearsal Aria failure. Matching recovered rows do not prove latest original transactions survived. Use documented lifecycle in docs/XAMPP_SETUP.md. XAMPP Control Panel does not manage this instance.

## Verification and next work

Passed source suites, both typechecks/builds, four artifact tests, 11 DB + 18 auth + 14 CMS scenarios, actual isolated full public build and failure/stale withdrawal checks, compiled API/shell checks and recovered-field comparison. Full report carries command/count details. Production dependency audit: zero reported vulnerabilities.

Browser host/native pipe are still unavailable. Keep exact Phase 4 and Phase 6 manual checklists and the Phase 7 additions at all seven widths. No browser interaction, screenshots, console, pixel/visual equivalence, Lighthouse or CWV pass exists for this work. Final visual/UX revamp remains later.

No real administrators: authorized people must privately follow docs/AUTHENTICATION.md. Do not ask for real credentials. Owner content/portrait/contact approvals, hosting/HTTPS/proxy/shared rate storage, private media backups and message retention remain open. Personalized email postponed.

Complete ZIP: `C:/Users/HP/Pictures/Aunt nyirarukundo/seraphine-portfolio-phase-07-complete.zip`; verified full eligible source/design/docs/migrations/tests with private/generated material excluded. Final receipt carries size/count/SHA256. Phase 8 requires a new instruction.
