# Phase 5 database design

XAMPP MariaDB 10.4.32; Prisma CLI/Client/adapter 7.10.0 unchanged. `mysql` provider, native foreign keys, utf8mb4/utf8mb4_unicode_ci. Initial migration: `20261103183624_phase05_foundation`.

| Model | Purpose and integrity |
|---|---|
| User | Unique email; displayName; passwordHash; ADMIN/SUPER_ADMIN only; isActive; timestamps. No seeded accounts or provisioning/auth API. Phase 6 must hash real passwords. |
| Profile | One `owner` ID enforced by SQL CHECK and service; identity, biography, city/country, experience description, private contact/consent, optional portrait, publication state. |
| Experience | Organization/title, nullable start/end year, current indicator, description/responsibilities, verification/publication/order. CHECK prevents reversed years or current+end year. |
| Education | Qualification/institution, country, nullable completion year, notes, verification/publication/order. |
| Skill | Name/category/description; verification/publication/order; no fabricated proficiency scores. |
| Project | Unique slug, title/summary/body, organization/role/results, nullable year/start/end year, featured/order/verification/publication. Period CHECK. |
| Achievement | Title/description/year, optional project, verification/publication/order. |
| Certificate | Training/certificate title, nullable issuer/year/details/document, verification/publication/order. |
| MediaAsset | Unique storage key, original filename, MIME/positive bytes/alt, approval and separate public URL; optional project. No binary blobs. |
| ContactMessage | Private name/email/subject/content, NEW/READ/ARCHIVED, timestamps and nullable expiry. |
| SiteSettings | Single `site` ID enforced by CHECK; typed title/description/indexing only. No generic secret storage. |
| AuditLog | Actor, action/entity/entityId/details/timestamp. Foundation for Phase 6; no claim that edits are already audited. |

All mutable models have updatedAt; all content models have createdAt. AuditLog is append-oriented. Content IDs are CUIDs except enforced singleton IDs and stable seed IDs. Case-insensitive collation makes unique email/slug checks case-insensitive as expected; slugs are validated lowercase.

Relations: Profile → MediaAsset (portrait); Certificate → MediaAsset (document); MediaAsset → Project; Achievement → Project; AuditLog → User. Optional relation keys are nullable. Content/media deletion uses RESTRICT to avoid silently losing associations. User deletion sets AuditLog.actorId to null, preserving the event. No cascading content deletion. Prisma generates FK indexes; list indexes cover status/sortOrder, contact status/createdAt, audit actor/createdAt and media projectId. Unique constraints cover email, slug and storageKey.

The Profile and SiteSettings singleton CHECKs, period CHECKs and positive media size CHECK are explicit SQL additions; Prisma schema syntax does not model them. Preserve them in future migrations. `migrate dev` replay/drift check was verified against the dedicated shadow DB. Migration SQL contains DDL only; it is safe to include in the source archive.

Existing useful schema names are retained (`Certificate` represents both training and certificates, `displayName` holds the administrator full/display name). Legacy `location`, project `year` and result/body fields remain compatible; city/country and year ranges add detail without destructive renaming. No precise day/month is invented. A year is not automatically advanced with the current date. ARCHIVED is retained for withdrawn content rather than deleting it.

Publishing is opt-in. Defaults are DRAFT/unverified and unapproved media. Collection reads require PUBLISHED+verified. Related private project titles and private media cannot leak through otherwise published records. Profile contact requires independent dated consent; profile edits revoke it. Private DB fields never belong in the public frontend bundle.

Seed provenance: explicit Phase 5 request and previously reviewed questionnaire. Creates one published basic profile, six published supported skill areas, two draft provisional jobs, three draft education entries, three draft training entries and default noindex settings. Education stays draft pending official titles. Jobs stay draft due overlapping/provisional dates. No portrait/media, contact information, user accounts, projects, achievements, messages or analytics are seeded. Stable-ID upserts with empty updates preserve all existing editorial changes; seed is transactional.

## Runtime and service boundaries

`loadEnv.ts` loads backend/.env independent of process working directory. `database.ts` validates and decodes the runtime URL, creates the official MariaDB adapter (five-connection pool, bounded connect/acquire timeouts) and lazily shares one PrismaClient. CLI uses MIGRATION_DATABASE_URL; config enforces the same host/port/database as runtime and a different shadow DB name. Health stays independent of connection state. Server shutdown closes HTTP first, disconnects Prisma, and has a 10-second deadline.

Route → controller validation → service → Prisma → MariaDB. Services have no Express dependency. `portfolio.service.ts` uses explicit selects and DTOs. `content.service.ts` validates internal mutation inputs, manages drafts/verification and atomic reordering. `private.service.ts` holds nonpublic foundations. `seed.service.ts` implements non-overwriting seed operations. No speculative repository layer or per-request client exists.

Phase 6 must add real account provisioning/password hashing, role authorization, sessions/cookies/CSRF, audits and concurrency handling in dashboard editing. Phase 7 adds uploads, public contact anti-abuse and delivery, content integration and rebuild publishing. Runtime currently targets local TCP development; remote production TLS, backup/restore and secret distribution require deployment configuration and verification.
