# Final Phase 7 review decisions — 2026-11-05

- Treat actual page existence/hash plus live revision as authoritative for synchronization and serve the checked bytes. Share the backend verifier; retain fail-closed delivery and pending provider integration.
- Validate/normalize creates before idempotency hashing. Resolve indirect PDF annotation subtypes without traversing cyclic page trees. Set media cache policy before errors can occur.
- Reorder the complete collection within the existing 100-item transaction limit, preserving other pages and selected versions. Keep numeric Display order for larger collections/cross-page moves; no new schema/endpoints.
- Mark Phase 7 COMPLETED only for its implemented/automated scope after fresh passing checks. Record browser unavailability, native-history unsaved-edit limitation and operational/content dependencies explicitly. Phase 8 remains not started.
- Preserve the existing ZIP as a historical checkpoint; no automatic replacement or retroactive commit/tag/push. Keep current corrections in the existing workspace and apply the documented Git policy from Phase 8.

---

# Backup/version control decision — effective Phase 8

On 2026-11-05 the representative replaced automatic future phase ZIPs with Git commits, successfully verified phase tags and pushes to the configured private GitHub repository. Verify remote privacy/access before pushing. Continue memory/verification updates and separate verified database backups; exclude secrets/private files from Git. ZIPs are now only for explicit requests or final handover. Earlier ZIPs and completed-phase backup arrangements remain unchanged. This decision starts with Phase 8 and does not authorize beginning that phase or retroactively changing Phase 7 delivery. Full policy: [docs/VERSION_CONTROL_POLICY.md](docs/VERSION_CONTROL_POLICY.md).

---

# Phase 7 decisions — 2026-11-05

- Explicit Phase 7 authorization accepted; existing stack, bespoke design, feature/MVC boundaries and Phase 6 auth extended. Phase 8 remains not started.
- Reuse all thirteen models and two migrations without DDL. Keep single-version editing: save returns to DRAFT and withdraws the public version, with explicit UI guidance. No unnecessary revision schema.
- Wrap existing managers in transactional row/version locks and audits; monotonic updatedAt prevents same-millisecond conflicts. UUID create receipts serialize identical retries. Keep immutable project slugs and restrictive relationships.
- Single-owner support permission: both roles manage portfolio/media/messages; technical account/log/status permissions remain SUPER_ADMIN-only. No validation/consent bypass.
- Private local media provider with real image decoding/metadata stripping, processed variants, conservative PDF parsing, explicit public approval plus live published-reference checks. Original/private bytes excluded from serving/source archives. No email.
- Database public DTOs are canonical. Export consistent public data at build time, render/embed the same hydration snapshot, and refresh it at runtime. Remove conflicting independent frontend arrays.
- Use no-store and a dynamic revision/HTML gate for supported Express/preview serving; fail closed on stale HTML/build failure/DB downtime. This requires DB availability for production pages but avoids runtime React SSR. Ungated static hosting unsupported. Provide fixed local rebuild API/CLI; provider deployment automation remains pending.
- New public messages have null expiry and a clear storage notice; owner-approved automatic retention remains pending. Metadata settings exclude secrets/domain/indexing writes.
- Keep exact recovered data, dedicated port 13312, .env/JWT, grants, recovery caveats, manual browser debt and deferred final visual revamp. No real accounts.

Earlier decisions below retain their historical phase boundaries.

---

# Current Phase 6 decisions - COMPLETED 2026-11-05

> **Authorized cutover decision:** Adopted the verified dedicated normal-mode instance at port 13312, using existing XAMPP binaries and private rehearsal-02 data/config. Complete offline snapshot and original .env backup verified first; only four database URLs changed, preserving JWT/unrelated bytes. Final DB/auth/schema/shadow/content/build/API/constraint and restart gates passed. Shared XAMPP originals/unrelated databases were not repaired or modified. Retain level-6 freshness uncertainty and unexplained failed first-rehearsal Aria evidence. Phase 6 COMPLETED with manual browser QA deferred; Phase 7 and real administrator creation remain unauthorized.

- Explicit Phase 6 authorization accepted; Phase 7 not started. Keep Phase 4 browser/performance debt and final visual/UX revamp.
- Argon2id 19 MiB/2/1, JOSE HS256 with 64-byte random environment secret, five-minute access/seven-day absolute refresh, strict claims, server sessions and immediate DB revocation checks. Refresh replay fails closed; Web Locks reduces cross-tab races, with re-login fallback on unsupported browsers.
- Mandatory exact Origin + custom header CSRF, same-origin frontend/API, Strict HttpOnly cookies, production Secure/HTTPS origin. No wildcard, token storage, fake auth or public reset.
- Reauthenticate technical account actions. Regular ADMIN only through API; all SUPER_ADMIN changes remain local CLI. Unique bootstrap slot prevents races. Temporary passwords force replacement; password change/recovery revoke sessions transactionally with audits. No real accounts provisioned by the agent.
- At most ten active sessions. Retain revoked rows until expiry; explicit expiry-only cleanup CLI. No fabricated device/IP telemetry.
- Keep read-only portfolio management in Phase 6; real publication states/messages/counts, no mock analytics or decorative edit buttons. Distinct approved Studio/Operations identities; monogram avoids implying portrait approval.
- Patch pinned Prisma 7.10.0 family to 7.10.1 after six inherited dependency advisories; zero reported afterward. Preserve stack and updated lockfile.
- Private UI loaded only on its routes; neutral shells never prerender private data. Preserve public App and artifact budgets.
- Browser host unavailable; manual acceptance remains documented. Clean isolated shadow/auth/persistence acceptance now passes. Authorized cutover and final acceptance now passed; do not restart/reset shared XAMPP or infer the cause of the first rehearsal privilege-table failure.

---

# Decisions — approved and provisional

## Current Phase 5 decisions — 2026-11-03

- The representative explicitly accepted Phase 4 for progression, with browser/performance checks deferred. Proceeded with Phase 5; no redesign. Comprehensive visual/UX revamp follows major implementation.
- Use existing XAMPP MariaDB 10.4.32 at 127.0.0.1:3306. Separate dev/test/shadow schemas and local runtime/migration/test accounts; exact escaped schema grants, no global admin privilege. Keep pinned Prisma 7.10.0 and existing lockfile.
- Preserve useful model names and add Achievement/SiteSettings, nullable year-based dates, media relations, explicit singleton CHECKs, restrictive content deletion and audit actor SetNull. DRAFT default; verified collections plus approved media and separately consented contacts.
- Public DTO allowlists and strict Zod input; edits unpublish content. Internal services have no HTTP mutation exposure until Phase 6 auth/authorization/CSRF/audits. Retain existing health and metadata contract, including historical metadata wording.
- Create-only stable-ID transactional seed preserves editorial edits. Uncertain jobs/education/training remain drafts; no accounts, private contacts or fabricated projects. Separate real DB tests refuse preexisting test content and clean only their fixture IDs.
- Typed nonsecret settings, media metadata only, private message service with provisional 90-day expiry and explicit purge. Public collection/uploads/provider/email integration remain later work.
- See docs/PHASE_05_VERIFICATION.md and docs/DATABASE_SCHEMA.md for current evidence. Earlier implementation-status statements below are historical.

## Product and creative direction (approved)

- Owner: **Nyirarukundo Seraphine**, Kigali, Rwanda. Professional title **Water Treatment Plant Engineer**, work with WASAC Group, experience described as 11 years in the questionnaire.
- Phase 2 revision 02 **approved by developer on 2026-10-30**: identity-first, large serif name on a bright white/light-blue homepage, high-contrast navy + blue, optional restrained orange, optimized standing portrait on the right. Website should feel premium and individually art-directed, never like a generic AI-generated template.
- Dashboard designs (approved direction): light clean and simple **Portfolio Studio** for nontechnical owner (`ADMIN`), dark navy technical **System Operations** for developer (`SUPER_ADMIN`). Dashboards remain design prototypes until Phase 6.
- Responsive on mobile/tablet/desktop; test Chrome, Firefox, Edge, Safari later. Use subtle CSS motion, accessible focus, `prefers-reduced-motion`, optimize images and minimal JS; keep optional 3D lightweight.
- React + Vite + TypeScript frontend; Node.js + Express + TypeScript API; Prisma + MySQL backend; JWT auth in Phase 6.
- User wants complete **project ZIP after every completed implementation phase**, including project memory/handoff docs, full prior work, and source. Track honest acceptance tests in `PROJECT_STATUS.md`.
- Full user-facing custom email setup deliberately deferred until the website is finished.

## Phase 3 technical choices

- npm workspaces for `frontend/` and `backend/`; avoid monorepo tooling complexity.
- Vite 7 + React 19. TypeScript in both workspaces. Public homepage source is static-first and can load without a backend; SEO prerendering approach still to be finalized.
- Express 5 with Helmet, strict CORS origin, request limiting and small body limit. A public, no-DB health endpoint allows basic operational smoke tests.
- Prisma **7.10.0** pinned alongside `@prisma/client` and `@prisma/adapter-mariadb` to follow Prisma 7 MySQL requirements. Prisma 7 uses a JS database driver adapter; implement PrismaClient wiring only when DB is configured in Phase 5. See official Prisma v7 MySQL docs.
- MySQL data model is **provisional** and not migrated. No production auth credentials or seeded users in source. PUBLIC/GUEST is not a database role.
- Use local SVG icons/branding and compressed WebP portrait instead of expensive third-party UI/icon or WebGL runtime at this phase.

## Client and publication safeguards

- Client's attached portrait is authentic reference; generated standing image is **synthetic** and requires her consent and likeness approval before production.
- Work period `2015–2021` and `2022–Present` are provisional editorial choices per developer's instruction and NOT yet confirmed employment data.
- Education qualifications beyond client-supplied text, project case studies and measurable achievements remain unverified/missing. Avoid invented numbers.
- Public email/phone is not included in frontend until approved.

## Outstanding decisions

- How to trigger and authorize rebuilds after future CMS publishing; build-time rendering itself was selected in Phase 4 below.
- Actual MySQL/Node deployment provider, file storage, contact submission delivery, telemetry privacy, role auth/JWT implementation details, backup infrastructure.
- Exact browser version support and CI runner.

## Phase 3 verification decisions — 2026-11-02

- Keep the existing dependency versions, Babel React plugin and lockfile. Clean `npm ci` and actual transforms/build/browser checks passed; no SWC switch or cache override is justified. Preserve the developer's existing Express range correction in the lockfile.
- Use safe fixed JSON error responses for invalid JSON (400) and excessive request bodies (413); keep unexpected errors private (500).
- A valid, generated Prisma schema completes the setup gate. Live MySQL/migrations are explicitly Phase 5 and remain unverified because the configured local port refuses connections and credentials are placeholders.
- Deliver the entire source/design/docs repository as a local ZIP excluding `handoff-private`, secrets, dependencies and generated outputs. This is a developer handoff, not publication permission for the synthetic portrait.

## Phase 3.1 architecture decisions — 2026-11-03

- Adopt pragmatic MVC with a service layer for the REST backend: routes bind endpoints, controllers handle HTTP, future services implement business rules/data access. JSON responses replace traditional views. Health/metadata are intentionally simple controllers; creating artificial services or repositories now would add no value.
- Adopt feature-based React organization with `app/` composition, public feature modules and `shared/` layout/UI/styles. Portfolio page composition passes career/education data to leaf features, while shared Footer receives its name through props. This keeps content ownership explicit without a CMS or global state library.
- Keep relative imports and existing compiler conventions. No dependency, router, schema, API contract, CSS or approved asset changes.
- Preserve JSX exactly and verify rendered output equality, unchanged CSS/assets and real HTTP behavior. Browser control is unavailable in this session; disclose the limitation and carry the manual browser checklist forward rather than asserting pixel/interactive equivalence.

## Phase 4 implementation decisions — 2026-11-03

- Continue the bright approved collage and written direction; the separately named dark homepage mockup/prototype remains a historical variant. Do not copy illustrative titles, numbers or dashboard data.
- Use Vite production SSR as a build step with React renderToString/hydrateRoot, retaining the existing stack. Render the same App tree, keep the server entry outside dist, and rebuild static HTML when approved content changes. No runtime API or new dependency is needed for the homepage.
- Keep canonicalUrl null and allowIndexing false until a real domain and launch permissions exist. Emit minimal verified Person data, text social metadata and no portrait social image pending consent. Noindex is not access control.
- Use native details/summary for mobile navigation so basic interaction survives absent JavaScript. React enhances focus, dismissal and active links. Content motion never gates visibility; reduced motion disables it.
- Omit the projects section and its navigation until approved data exists. Keep reusable typed components. Contact config contains only publication-approved values, currently none, and no simulated send form.
- The actual questionnaire skills checklist is unticked; narrow expertise to written answers, rather than treating suggested skills as confirmed. Add only the three supplied training areas with missing official metadata clearly identified.
- Browser access remains unavailable. Automated/source/HTTP checks cannot satisfy visual, hydration or menu-runtime acceptance. Phase 4 stays IN PROGRESS and delivery is a review snapshot until manual/browser evidence closes the gate.
