# Content publishing and public synchronization

## Editor workflow

Save draft → authenticated preview → verify details/media → explicit Publish → Update public website → check synchronization status.

Saving an edit withdraws the previously published record. The editor states this before saving. This uses the existing single-version schema deliberately; there is no hidden public copy that can retain withdrawn sensitive information. Contact consent is revoked on profile edits. Publication updates the database/public API, and returns a distinct message saying that search-visible HTML still needs rebuilding. Unpublish removes the record immediately from public APIs. It also makes its solely attached media inaccessible on new public requests.

The development Vite page fetches the same published aggregate after mounting and on focus/every 30 seconds. A refresh shows newly published content without source edits. On API failure the mounted page clears its content to a neutral unavailable state instead of retaining stale professional information. Private previews never enter this aggregate.

## Build-time HTML and hydration

`npm run build` runs the frontend's controlled build script. It first reads only `portfolioService` public DTOs within a repeatable-read transaction, then writes an ignored build input. Vite builds the existing React application; its build-only SSR entry renders that exact snapshot. The HTML embeds the same escaped JSON for initial hydration and updates the title, description, social metadata and minimal Person JSON-LD from published content. A SHA256 content revision and an HTML hash are written to `.publication.json`. Private workspace shells stay empty. No API server needs to be running for a build, but the configured database must be reachable.

The public bundle contains no independent professional-content arrays or private data. Snapshot inputs, test releases and the build-only entry stay in ignored cache. Normal public output includes only published DTOs. Indexing requires both approved site settings and the existing configured canonical/launch permission; CMS editors cannot invent a domain or enable indexing through a setting write.

## Supported serving and stale content

Synchronization status checks both the current revision and actual HTML integrity/existence, using the same backend verifier as serving. Vite preview sends the captured verified bytes directly, rather than verifying one read and delegating another to static serving. The isolated preview regression covers GET/HEAD, missing/tampered/stale artifacts and API outage.

Use the compiled Express application to serve the built public website and API under the same origin. GET `/` and `/index.html` recompute the current published revision and verify both receipt and HTML hash before serving. Stale/missing/tampered HTML, a failed build or a database outage returns a neutral 503 with no portfolio data. Static serving is narrowly limited to assets, concept images and fixed public files. It does not expose snapshots, original uploads or arbitrary HTML paths. Private workspace URLs serve the neutral login shell.

Vite preview enforces the same freshness policy using the API at port 4000; it requires that API to be running. Unknown paths do not use an unrestricted stale SPA fallback. It is a review tool, not a production host. Vite development itself is a development environment; do not publish its source server.

**Do not deploy `frontend/dist` directly to an ungated static host.** Such a host can continue serving withdrawn HTML. Hosting is undecided: production automation and global cache invalidation are explicitly pending. A future host must use the current gate or implement equivalent fail-closed publication/invalidation before serving CMS snapshots. No automatic third-party deployment is claimed.

No-store headers apply to public HTML/APIs/media. External proxies/CDNs must honor them; this phase does not prove an unknown provider's behavior. Already downloaded pages, screenshots, files and in-flight responses cannot be recalled. The guarantee is current application checks on subsequent requests, rather than erasing copies someone already received.

## Rebuild interface, failures and rollback

The dashboard Update public website button calls the guarded `/cms-sync` endpoint. It runs only the fixed `scripts/rebuild-public.mjs` interface; no user command, filesystem path or environment input is accepted. The same interface can be invoked by a reviewed future hosting job:

```powershell
node scripts/rebuild-public.mjs
```

One exclusive build lock prevents overlapping builds. A 202 response reports that work started; actual state and built/current comparison report completion or failure separately. Changes committed during a build can leave it outdated, and the gate blocks that artifact until a new build matches. The build occurs locally and requires installed build dependencies. A process restart loses transient job state; built/current comparison remains authoritative.

Export failures leave the older artifact intact. Vite/build failures can leave incomplete output; the absent/mismatched receipt blocks serving it. Retry a failed build after correcting the cause. A crashed builder can leave `frontend/.cache/public-build.lock`; an authorized maintainer must verify no project build process is running before removing that exact stale lock. Do not remove a live lock.

Rollback means restoring reviewed application artifacts and explicitly restoring/re-publishing intended content, then rebuilding. An older artifact is served only if it matches current public data. Never roll back the database by overwriting recovered files or restore a stale snapshot to bypass withdrawal. Existing database lifecycle/recovery documentation remains authoritative. No new schema migration or database cutover is part of Phase 7.

Database availability is now required for supported production page delivery. This is the deliberate privacy tradeoff for immediate withdrawal without provider-specific invalidation. The initial React HTML remains build-rendered; there is no runtime React SSR or framework migration.
