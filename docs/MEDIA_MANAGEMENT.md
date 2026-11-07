# Media storage and lifecycle

The local storage provider is the application's ignored `backend/.private-media/`, outside all public/static directories. Development uses the existing database; tests use only `backend/.cache/test-media/`. Storage paths and keys are never accepted from the browser, shown in dashboard DTOs, committed or archived. Windows deployment operators must restrict filesystem access to the application/authorized owner and include this directory in private backups. Local media is not part of a source-code ZIP.

## Upload processing

- One file per request, maximum 8,000,000 bytes; JPEG, PNG, WebP and PDF only. Filename, extension, declared MIME and actual signature must agree. Directory separators, control characters and drive syntax are rejected. SVG/executables and malformed files are rejected.
- Images undergo real decoding with a 32-million-pixel bound, rotation, resize inside 1600×2000, WebP re-encoding and a 640px variant. Informative images require alt text. Metadata, including EXIF/GPS, is not copied. This follows [Sharp's documented default metadata removal](https://sharp.pixelplumbing.com/api-output/), and tests inspect generated outputs.
- PDFs must parse, contain 1–100 pages, have a complete ending and no encryption or active action/script/embedded-file/form dictionaries, including nested dictionaries and escaped key names. Reviewed pages/resources are copied into a clean document without source Info, XMP Metadata or unrelated orphan objects; metadata updates are disabled. Regression tests retain page geometry, rotation, text/font resources and remove decoded metadata sentinels. Document-level outlines/labels are not preserved; review the processed file before approval. [pdf-lib](https://pdf-lib.js.org/docs/api/classes/pdfdocument) supplies parsing and serialization. This conservative filter is not a malware-scanner claim; PDFs are always served as sandboxed downloads, never trusted inline application HTML. Hard worker memory/time isolation remains an operational improvement before accepting untrusted high-volume uploads.
- UUID storage identifiers and exclusive writes prevent filename collisions. The original, main processed file and optional thumbnail remain private. Only processed variants are served; no original-download route exists.

## Authorization and attachment

Upload does not grant public access. Use View file to inspect the processed file privately. Approve public use only after verifying rights, portrait likeness consent and personal information. An approved file becomes publicly reachable only while attached to a published profile, verified published certificate, or verified published project. Approval of an unattached file alone still yields public 404.

Portrait and certificate forms choose library files by readable names. The library attaches/detaches project files. Editing metadata or project attachment withdraws approval. Replace by uploading a new file, assigning it, then detaching/removing the old file. Approval and content publication are separate explicit controls. SUPER_ADMIN uses the same conditions as ADMIN.

Public and private file handlers use no-store, nosniff, noindex and a restrictive sandbox CSP. Manipulating an ID cannot bypass authentication for private files or the publication predicate for public files. Both roles are authorized support users for the one portfolio; there is no unrelated-owner media namespace.

## Removal and failure handling

Files cannot be deleted while ANY content still references them, including drafts. Detach all profile/certificate/project references first. Removal transactionally deletes the database row and audit event before disk cleanup, making remaining bytes unreachable even if disk cleanup fails. Upload errors roll back the database/audit transaction and remove files written by that attempt. A process crash can leave private orphan files; they are never automatically made public.

The explicit maintenance tool reports missing main files and orphan files older than one day without printing paths or names:

```powershell
npm run media:reconcile -w backend
```

After reviewing storage health/backups, an authorized local operator can remove only recognized, unreferenced UUID files older than one day:

```powershell
npm run media:reconcile -w backend -- --remove-orphans
```

No automated deletion scheduler runs. Unknown files/symlinks are ignored; the root cannot be a symlink. The grace period protects in-progress uploads. Database metadata remains the authority. The dashboard's byte count is the recorded main processed-file size; it does not claim total disk usage including originals/thumbnails.

The source repository's existing synthetic portrait derivatives retain their explicit review disclaimer and owner-approval debt. This phase neither silently publishes a replacement portrait nor authorizes production use of that concept.
