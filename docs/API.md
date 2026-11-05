# Phase 6 API continuation — 2026-11-04

Public Phase 5 routes/contracts below are preserved. Authentication and private administrative APIs now exist; see [AUTHENTICATION.md](AUTHENTICATION.md#api) for every route, permission, body, cookie/CSRF and pagination contract. `/auth`, `/administrators` and `/dashboard` are mounted under `/api/v1`; all private responses are no-store. No public signup/bootstrap/reset, SUPER_ADMIN mutation, CMS write, media upload or contact-submission route. Older statements below that auth has not started describe Phase 5 history.

---

# Phase 5 REST API

Base: `http://localhost:4000/api/v1`. JSON, UTF-8. No authentication or administrative HTTP routes exist yet. The frontend still uses its approved static content; API integration belongs to Phase 7.

## Public read contract

| Method/path | Success | Data |
|---|---|---|
| GET `/` | 200 | Historical metadata contract retained unchanged, including its old planning message |
| GET `/health` | 200 | `{status:"ok", service:"seraphine-portfolio-api", timestamp:ISO8601}`; liveness only, no DB claim |
| GET `/profile` | 200 / 404 | `{data: ProfileDTO}`; only published singleton `owner` |
| GET `/experience` | 200 | Paginated verified published positions |
| GET `/education` | 200 | Paginated verified published education |
| GET `/skills` | 200 | Paginated verified published skills |
| GET `/projects` | 200 | Paginated verified published projects |
| GET `/projects/:slug` | 200 / 404 | `{data: ProjectDTO}`; drafts and nonexistent slugs both return 404 |
| GET `/achievements` | 200 | Paginated verified published achievements; linked projects must also be verified/published |
| GET `/certifications` | 200 | Paginated verified published training/certificates |

List query: `page` integer 1–9999 (default 1), `limit` integer 1–50 (default 20), `sort=asc|desc` (default asc). Order is `sortOrder`, then unique `id`, in the requested direction. Offset pagination is deterministic for an unchanged dataset; live editing can shift subsequent pages. No client-selected database columns. Unknown/repeated/array query parameters fail 400. Profile/detail endpoints accept no query parameters. Slugs are 1–191 lowercase ASCII letters/digits separated by single hyphens.

Lists return `{data: [...], pagination: {page, limit, hasMore}}`. Empty lists are 200 with `data:[]`. No total-count scan is needed. Detail responses return 404 for unavailable content. HEAD follows Express GET behavior. CORS preflight is handled by the shared middleware.

Example:

```powershell
Invoke-RestMethod 'http://localhost:4000/api/v1/skills?page=1&limit=10&sort=asc'
```

## Public DTO fields

All nullable fields remain `null` when unknown. No exact date is inferred from a year. Text is plain content, not trusted HTML; future clients must escape it and must not inject it with `innerHTML`.

| DTO | Returned fields |
|---|---|
| Profile | fullName, professionalTitle, location, city, country, motto, summary, biography, experienceDescription, contact, portrait |
| Experience | id, jobTitle, organization, startYear, endYear, isCurrent, description, responsibilities |
| Education | id, qualification, institution, country, yearCompleted, notes |
| Skill | id, name, category, description |
| Project | id, slug, title, summary, body, role, result, year, organization, startYear, endYear, featured, media[] |
| Achievement | id, title, description, year, project (`null` or `{slug,title}`) |
| Certificate | id, title, issuer, year, credentialDetails, media |
| Media | id, publicUrl, altText, mimeType |

Profile contact is `null` unless BOTH `showPublicContact` and `contactApprovedAt` are set through the internal consent operation. Approved contact is `{email,phone}`. Editing the profile revokes contact consent and returns the profile to draft. Portrait and certificate media are `null` unless explicitly approved and assigned a public URL. Project media arrays exclude all other assets. URLs approved through the service require permanent HTTPS URLs without credentials, fragments or query tokens. No storage key, original filename, account, password hash, message, audit event, private setting, status, verification flag or internal timestamp is included in these DTOs.

`DRAFT` and `ARCHIVED` never appear publicly. All collections also require `isVerified=true`. Publishing is an explicit trusted internal operation; ordinary edits always return content to draft. Profile has only owner identity and no generic verification flag; publish it only after review.

## Errors and security

Errors: `{error:{code,message}}`; fixed safe messages, no echoed input, SQL, stack or database credentials.

| HTTP | Code / use |
|---|---|
| 400 | `VALIDATION_ERROR`, `INVALID_JSON`, `INVALID_PERIOD`, `INVALID_OPERATION` |
| 401 / 403 | `AppError` support for future authentication; no auth endpoints implemented |
| 404 | `NOT_FOUND` for absent routes/records, including unpublished detail content |
| 409 | `CONFLICT` (unique value), `RELATION_CONFLICT` (FK), `UNVERIFIED_CONTENT` (internal publish) |
| 413 | `PAYLOAD_TOO_LARGE` beyond 100kb JSON |
| 429 | `RATE_LIMITED`, plus rate-limit/retry headers |
| 503 | `SERVICE_UNAVAILABLE` for mapped DB connection/pool timeouts |
| 500 | `INTERNAL_ERROR` for unexpected failures; logged as a fixed message only |

Helmet, disabled X-Powered-By, configured CORS origin/credentials, 100kb JSON parser and 120 requests/IP/15 minutes are preserved. Limiter uses in-memory state suitable for this local single-process phase; shared storage and proxy configuration need deployment review. CORS is not authorization. The health endpoint has no DB dependency. Parser errors can occur even for an otherwise missing write route.

No POST/PUT/PATCH/DELETE content endpoint, public contact submission, message retrieval, upload, user or audit-log endpoint is registered. A forged role header has no effect. Future Phase 6 routes must authenticate, authorize, apply CSRF protection and record audit events before calling internal services. Do not expose these services through generic dispatch based on a client-supplied model name.

## Internal service contract

`contentServices(db)` exposes profile, experience, education, skill, project, achievement and certificate managers. Each provides `create(input)`, `read(id)`, `list()`, `update(id,input)`, `publish(id)`, `unpublish(id)`, `remove(id)` and `reorder([{id,sortOrder}])`. Profile reordering fails 400. List is bounded at 100 records (profile 1); dashboard pagination will be added with Phase 6 UI requirements. Partial update retains unspecified fields, rejects unknown properties, validates combined dates and sets DRAFT. Reordering uses one transaction; any missing ID rolls back the whole operation. Referenced content cannot be deleted until relationships are explicitly resolved.

Writable input fields and exact limits are in `backend/src/validators/content.ts`. Status, ID, timestamps, nested relation writes and consent fields are excluded. Years are nullable integers 1900–2100, display order 0–10000, reorder batches 1–100 unique IDs. Most text fields use their DB maximum; body/description lengths are capped below column capacity. No proficiency percentages.

`privateServices(db)` provides media metadata create/approve/revoke; owner-contact approve/revoke; contact-message create/list/status/delete/expired purge; typed site-settings upsert. It sends no email and uploads no files. Messages default to NEW and a 90-day expiry; purge is an explicit internal operation, not an active scheduler. Confirm the retention policy with the owner before enabling public collection. Existing rows with null expiry are never silently deleted. No account provisioning exists yet.
