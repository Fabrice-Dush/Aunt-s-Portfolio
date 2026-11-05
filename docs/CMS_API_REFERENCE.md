# CMS API reference

Base `/api/v1`. All private responses use no-store/noindex. JSON errors retain `{error:{code,message}}`. Every protected route uses Phase 6 cookies/session checks; no role headers or bearer-token substitute are accepted. Both roles share this single owner's CMS. Existing technical-only endpoints remain technical-only.

Mutations require exact configured Origin and `X-Portfolio-Request: 1`. JSON bodies are strict allowlists, limited to 100 KB. The binary upload route checks Origin/header before its own bounded parser. No absent-Origin exception exists.

## Content

Sections: `profile`, `experience`, `education`, `skills`, `projects`, `achievements`, `certifications`. Input fields/lengths are the existing content schemas in `backend/src/validators/content.ts`; status, IDs, timestamps, nested writes and consent flags are never ordinary editable fields.

| Method / path | Contract |
|---|---|
| GET `/cms/:section?page=1` | 20 records and `pagination:{page,hasMore}`, ordered by display order then ID |
| POST `/cms/:section` | Validated content object; requires UUID `Idempotency-Key`; 201 draft record |
| GET `/cms/:section/:id/preview` | Authenticated current record only; no public preview URL |
| PATCH `/cms/:section/:id` | `{expectedUpdatedAt:ISO,data:{...editable fields}}`; returns draft, preserves unspecified fields |
| POST `/cms/:section/:id/publish` | `{expectedUpdatedAt:ISO,confirmed:true,contactConsent?:boolean}`; explicit publication |
| POST `/cms/:section/:id/unpublish` | `{expectedUpdatedAt:ISO}`; immediate public withdrawal |
| DELETE `/cms/:section/:id` | `{expectedUpdatedAt:ISO}`; restrictive relationships; profile removal refused |
| POST `/cms/:section/reorder` | `{items:[{id,expectedUpdatedAt,sortOrder}]}`; 1–100 distinct IDs, one atomic transaction |

Collections require `isVerified:true` to publish. Profile identity is fixed to the client's required name/title. Contact consent is independently applied only during profile publishing; subsequent edits revoke it. All attached media must exist and be approved before content publication. Related achievement projects must be published/verified. Project slugs cannot change after creation.

409 responses include EDIT_CONFLICT, CONFLICT, OPERATION_USED, STABLE_SLUG, RELATION_CONFLICT, UNVERIFIED_CONTENT and MEDIA_NOT_APPROVED. Reload after a version conflict; never retry using an invented timestamp. Create retries must retain the same idempotency key and payload. Changed forms after a successful create need a new request or an edit of the returned record.

## Media

| Method / path | Contract |
|---|---|
| GET `/cms-media?page=1` | Private metadata, 20/page; no storage keys or private server paths |
| POST `/cms-media?fileName=...&altText=...` | One raw JPEG/PNG/WebP/PDF body with matching Content-Type; maximum 8,000,000 bytes; no multipart upload |
| GET `/cms-media/:id/file?size=small` | Authenticated processed file; `size` optional, only `small` supported |
| PATCH `/cms-media/:id` | `{expectedUpdatedAt,altText:string|null,projectId:string|null}`; edits revoke approval |
| POST `/cms-media/:id/approve` | `{expectedUpdatedAt,confirmed:true}`; explicit public-use authorization |
| POST `/cms-media/:id/revoke` | `{expectedUpdatedAt}`; public access withdrawn |
| DELETE `/cms-media/:id` | `{expectedUpdatedAt}`; refuses any portrait/certificate/project attachment |
| GET `/media/:id?size=small` | Public only while approved AND referenced by published eligible content; otherwise 404 |

Portraits and certificates attach through their own forms. Project media attach through the library. Replacement uploads get new identifiers; no filename-based overwrite. Original uploads are never returned by an HTTP route. PDFs download as attachments with a sandbox CSP.

## Messages, settings and synchronization

| Method / path | Contract |
|---|---|
| POST `/contact` | Public, exact Origin/header, JSON, limiter; `{senderName,senderEmail,subject?:string|null,content,website:'',startedAt:milliseconds}`; 201 only after storage |
| GET `/cms-messages?page=1` | Private correspondence, newest first, 20/page |
| PATCH `/cms-messages/:id` | `{expectedUpdatedAt,status:'NEW'|'READ'|'ARCHIVED'}` |
| DELETE `/cms-messages/:id` | `{expectedUpdatedAt}` |
| GET `/cms-settings` | Page title, description, launch-indexing flag and version; nullable before first save |
| PATCH `/cms-settings` | `{expectedUpdatedAt:ISO|null,data:{siteTitle,description?:string|null}}`; no secret/URL/indexing changes |
| GET `/public-content` | One sanitized, transactionally consistent aggregate of existing public DTOs plus public metadata and SHA256 revision |
| GET `/cms-sync` | Actual built/current comparison and local build state; hosting automation remains pending |
| POST `/cms-sync` | `{}`; fixed local build command, 202 means started, not published/deployed; polls reveal actual result |

The aggregate reuses `portfolioService`; the existing eight public content endpoints and pagination contracts remain. It avoids separate browser calls for every homepage section. All public content and media responses use no-store.

Contact submission allows five requests/IP/15 minutes, a blank honeypot and a 3-second–24-hour form age. Uploads allow twelve/IP/minute; CMS routes have 100/IP/minute. The existing global 120/IP/15-minute limiter remains in force. These in-process stores require shared storage/proxy review before scaled deployment. Message bodies never enter audit logs. No email is sent, and no automatic retention purge is enabled; public submissions have null expiry until an owner-approved policy is established.
