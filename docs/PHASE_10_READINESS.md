# Phase 10 preparation — no deployment authorized

Prepared 2026-11-07. This is a handoff checklist, not evidence of production readiness. Phase 10 has not started. Preserve pre-launch noindex, the review banner and private dashboards/previews. Personalized email remains postponed.

## Required decisions and evidence

| Gate | Required before launch | Current state |
|---|---|---|
| Owner approval | Complete [content register](OWNER_APPROVAL_REGISTER.md), portrait likeness/public-use and independent contact/media consent. | Pending |
| Accounts | Explicit authorization, then private hidden-input provisioning in [authentication guide](AUTHENTICATION.md). | No real accounts provisioned |
| Hosting/domain | Select Node/Express-compatible hosting, canonical HTTPS origin and domain; budget and access approved. | Pending |
| Production database | Create a clean normal-mode production MariaDB environment with distinct scoped runtime/migration accounts; review migrations, import approved data through a controlled export/import, validate counts/relations/DTOs and test rollback. | Pending; never use recovery-origin development directory as production |
| Secrets | Generate dedicated production JWT and DB credentials privately; secret store/access owners/rotation plan. Never copy development credentials into Git or reports. | Pending |
| HTTPS/proxy | Same trusted frontend/API origin, exact FRONTEND_ORIGIN/CORS, Secure HttpOnly Strict cookies; reviewed proxy trust and real client-address behavior. | Pending deployed validation |
| Public serving | Run the complete production build; serve verified HTML through the freshness/hash/revision gate. Atomically coordinate publish, rebuild, media and cache invalidation; stale/missing builds must fail closed. | Local mechanism exists; hosting automation pending |
| Private routes | Neutral shells for login/admin/operations, backend auth/roles, no-store/noindex; no private HTML or snapshots in code assets. | Local checks required again on host |
| Rate limits | Decide shared limits for multiple instances; current stores are per process. Verify real proxy addresses and ordinary budgets. | Production work pending |
| Media | Persistent private original/optimized storage, permissions, capacity, transactional references and backup; public serving only through approval/current-publication guards. | Provider/restore pending |
| Upload processing | Existing image/PDF limits and active-content rejection remain; consider isolated PDF worker before accepting untrusted production workloads. Review processed PDFs. | Hosting isolation decision pending |
| Monitoring | Restricted operational logs, safe error codes, availability checks, publish/rebuild failure alerts and named incident owner; no raw payloads/tokens/credentials in logs. | Provider/runbook pending |
| Indexing | After explicit launch permission configure canonical HTTPS URL, reviewed metadata, sitemap/robots, approved social preview image and indexing; keep private paths and previews excluded. | Deliberately disabled |
| Human QA | Actual Safari/macOS/iOS, touch device/keyboard/file picker, browser zoom, text resizing/spacing, NVDA/VoiceOver and owner appearance review. | Pending; Playwright WebKit is not Safari hardware |
| Rollback | Rehearse prior application release + schema-compatible data/media restore and fail-closed serving; record timing and operator. | Pending |

## Stable development and backups

The actual configuration contract is small; there is no frontend `.env.example` and no configurable media-provider integration to assume:

| Setting/location | Preparation |
|---|---|
| `NODE_ENV`, `PORT` | Production mode and the host's internal listener; expose only through the reviewed HTTPS proxy. |
| `FRONTEND_ORIGIN` | Exact public HTTPS origin, shared by browser frontend and `/api`; verify credentialed CORS and Origin checks. |
| `JWT_SECRET` | Dedicated 64 random bytes encoded as 128 hex characters, distributed privately; never reuse the development key in production. |
| `DATABASE_URL` | Separately scoped production DML runtime identity and clean production schema. |
| `MIGRATION_DATABASE_URL` | Separate migration identity available only to authorized release operations. |
| `TEST_DATABASE_URL`, `SHADOW_DATABASE_URL` | Local isolated tools; never point either at production or copy production credentials into test jobs. Existing workstation tests deliberately pin port/account/schema/instance. |
| `backend/.private-media` | Current non-test media root is fixed in the service; arrange persistent protected storage/mounts and coordinated backups. It must not become a static public directory. |
| `frontend/site.config.mjs` | Public-only canonical URL/indexing configuration; not a secret store. Retain null canonical/disabled indexing until launch authorization. |

Phase 9 corrected the tracked example's historical port-3306 placeholders to the documented dedicated local port 13312, with explicit preservation warnings. The real ignored environment was not rewritten. Do not copy the example over an existing environment or treat the workstation's recovery-origin setup as production provisioning.

The separately authorized 2026-11-16 local migration now uses standard XAMPP MariaDB 10.4.32 on port 3306 with new development/test/shadow schema names; see [current setup](XAMPP_SETUP.md) and [migration evidence](XAMPP_3306_MIGRATION.md). Start MySQL through XAMPP Control Panel normally. The damaged historical schemas remain untouched, and the recovered port-13312 data/config remain a stopped fallback. All 16 records, JWT and separate private backups are preserved. The tracked example now describes the new port-3306 schemas; never copy it over an existing environment. This local development change does not authorize production. Recovery level 6 did not prove historical transaction freshness; the first rehearsal's Aria failure remains unexplained.

The preserved pre-cutover offline snapshot is historical preservation, not a current production backup. Before production, choose owners, recovery-point and recovery-time targets. Proposed operational baseline for owner approval: encrypted daily logical DB backup plus coordinated private originals/optimized media and a deployment/schema/config inventory; keep seven daily and four weekly copies, with a separate access-controlled off-machine copy. Adjust after sizing and obligations are known. Do not include secrets or backup contents in Git. A backup is accepted only after checksum validation and an isolated restore rehearsal verifying migrations, all expected records/relations, authentication policy, media references, public DTOs and publication gates. Record restore duration, exceptions and retention; never restore over the recovered development database to test it.

## Contact-message retention proposal

For owner consideration: remove ordinary enquiries 90 days after resolution; retain only messages needed for an ongoing professional matter, review them every six months, and honor verified deletion requests. Confirm applicable obligations locally before adoption. Account for private backups aging out under their separate schedule. This is an unapproved proposal; no scheduler or automatic deletion is installed and no real messages were removed.

## Secure account setup when separately authorized

The operator verifies the intended database privately, preserves the current key, then runs `npm run auth:bootstrap -w backend` in their own interactive terminal. It refuses an existing maintainer and hides password input. Never send credentials to an assistant. Sign in at the exact configured origin; create Seraphine's ADMIN via Administrator access using current-password confirmation and a privately shared unique temporary passphrase. She must replace it before any content access, then sign in again. Review active sessions and test recovery using the documented private procedures. No public signup/reset/email workflow exists. Automated readiness uses disposable isolated accounts only.

Proceed to deployment only after an explicit Phase 10 instruction and recorded resolution of applicable gates. A verified Phase 9 implementation tag is not launch permission.
