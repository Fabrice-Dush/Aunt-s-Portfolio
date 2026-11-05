# Phase 7 CMS architecture

Updated 2026-11-05 (Europe/Paris). Phase 7 is explicitly authorized. This extends the existing React/Vite/Express/Prisma application; it introduces no replacement framework, public registration, real accounts or deployment.

## Data and permissions

All thirteen Phase 6 models and both reviewed migrations are reused without schema changes. Saving an edit changes that record to DRAFT and withdraws its public version. This deliberately avoids simultaneous draft/published revisions; the editor and confirmation explain the interruption. Publishing again requires an explicit authorized action, verified collection data, valid dates and approved media. Unverified WASAC, education and training records remain drafts. No development content was automatically published by the implementation.

Both authenticated roles manage the same single-owner portfolio. This is an explicit support permission, not a multi-tenant system: ADMIN and SUPER_ADMIN can manage its content, media and messages. Technical account administration, security logs and system status retain their SUPER_ADMIN guards. Guests receive only public DTOs. Temporary-password accounts cannot use CMS endpoints. IDs never grant permission by themselves.

`routes → controllers/input schemas → services → shared Prisma` remains the backend boundary. The CMS service wraps the existing content managers; private foundations remain internal. Controllers allowlist supported sections and reject unknown fields. Content is plain text; React escapes it. There is no raw HTML editor.

## Writes, conflicts and audits

Every protected mutation requires the existing exact configured Origin and `X-Portfolio-Request: 1`, a current session, and a replaced temporary password. Content actions require `expectedUpdatedAt`. Within a transaction the server locks the selected row, checks that version, performs the operation and records an audit event. Explicit monotonically increasing timestamps protect even changes occurring in the same millisecond. Stale or overlapping writes return 409; form values remain available after failures. Reorder batches lock IDs in a deterministic order and roll back together.

Content creation also requires a UUID `Idempotency-Key`. A user-row lock serializes retries, and the transaction stores the key and payload fingerprint in the audit receipt. Repeated identical requests return the existing record. Reusing the key for different content fails. No sensitive content is copied into audit details. Publish/unpublish/delete repetitions fail version checks rather than silently changing newer data.

The profile singleton cannot be deleted through HTTP. Its required identity remains Nyirarukundo Seraphine / Water Treatment Plant Engineer. Profile edits revoke public-contact consent. Publishing offers independent explicit contact consent, records its date and audits approval. Project slugs are immutable after creation. Title edits preserve the public API address and the homepage project fragment.

## Frontend

The existing light Studio and dark Operations now include all content editors, Media Library, Messages and Portfolio Settings. Labelled native forms, publication badges, private previews, confirmations, page controls and real error/success/loading/empty states use the existing design tokens. Draft forms warn before document unload or internal route navigation. Refresh never discards a failed save automatically. Collection display order can be changed with arrows or the numeric field. Unknown years remain empty.

Private UI and CSS remain lazy-loaded only on workspace routes. Static private route shells contain no authenticated information. Public composition consumes only published database DTOs. The old independent frontend profile/career/education/skill/project/training arrays were removed. Empty unpublished sections and their navigation are omitted. The existing portrait concept remains the clearly labelled review fallback until a replacement is explicitly approved and published; this does not authorize launch use.

Read [publishing](CONTENT_PUBLISHING.md), [API contracts](CMS_API_REFERENCE.md), [media storage](MEDIA_MANAGEMENT.md), [owner guide](CMS_USER_GUIDE.md), and [verification](PHASE_07_VERIFICATION.md).
