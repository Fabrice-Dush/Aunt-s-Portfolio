# Architecture — current source and future boundaries

## Source tree as of Phase 3

```
frontend/                         React 19 + Vite 7 + TypeScript
  src/App.tsx                     first real public portfolio React page
  src/components/                 Brand, Header, SectionHeading, ExpertiseIcon
  src/data/profile.ts             centralized client-supplied content and provisos
  src/styles.css                  responsive tokens, layout, states and accessible motion
  public/images/                  approved-design synthetic WebP concept portrait (pending consent)
backend/                          Node.js + Express 5 + TypeScript
  src/app.ts                      Helmet, CORS, rate limiting, JSON limit, health route
  src/server.ts                   HTTP server start/stop
  src/config/env.ts               validation of public server configuration
  src/middleware/errorHandler.ts  common 404 / safe 500 handling
  src/routes/health.ts            no-database `/api/v1/health`
  prisma/schema.prisma            PROPOSED future MySQL data model; not migrated
  prisma.config.ts                Prisma 7 schema + datasource config
backend/test/http.test.mjs         real HTTP foundation regression tests
scripts/                          structure tests, dual dev runner, source ZIP packaging
 design/                           preserved Phase 2 HTML/CSS design prototyping
```

## API boundaries (planned)

- Public: `GET /api/v1/health` (implemented), public profile/projects read APIs (not implemented), future contact form submission (not implemented).
- `ADMIN`: profile, work experience, education, certificates, projects, skills, media editing (not implemented).
- `SUPER_ADMIN`: same content privileges plus user management, session revocation, configuration and audit review (not implemented).
- Role authorization must be server-side. No public registration, no default passwords, avoid secrets in client code.
- Plan JWT access tokens with secure HttpOnly cookie sessions/refresh-token rotation; CSRF defense required for cookie-authenticated mutations. Do not mark as implemented until Phase 6.

## Data entities (proposed, not migrated)

`User(Role)`, `Profile`, `Experience`, `Education`, `Skill`, `Project`, `Certificate`, `MediaAsset`, `ContactMessage`, `AuditLog`.

Use Prisma ORM 7 with the MySQL provider and an official-compatible MariaDB adapter in the backend when actual database access is implemented. Prisma config loads `DATABASE_URL` from local `backend/.env`. Validate/generate need the variable, but not a live server or real credentials; the example URL suffices for these schema-only checks. Prisma 7.10.0 validation and generation passed on 2026-11-02. Actual adapter/PrismaClient wiring, database connectivity and migrations remain Phase 5. No database connection is needed to run the API health endpoint.

## Frontend priorities

- Source-coded React public page with minimal runtime dependencies. No API calls on first paint.
- Preserve approved bright white/navy/blue identity, large name, photographic focus. Avoid unverified claims.
- Phase 4: polished component decomposition, responsive/browser testing, animation direction, SEO static/pre-render approach, image/media optimization.
- Phase 6: actual admin routes and role-aware navigation; Phase 7: CMS data integration, uploads and publishing.

## Deployment direction (not selected)

- Static frontend can be hosted separately from the long-running Node/Express backend and database.
- Free static hosting does not imply free backend/MySQL hosting.
- Keep secrets, database backups, deployment permissions outside the public portfolio and git repo.

## Phase 3 runtime verification — 2026-11-02

Both TypeScript builds and the local frontend/API were verified. JSON-parser failures now return safe 400/413 responses; unknown routes return 404 and unexpected errors remain safe 500 responses. The HTTP suite exercises health, metadata, Helmet, CORS headers/preflight, parser limits, error hiding and rate limiting without a database. CORS controls browser response access, not server authorization. No authentication is implied. See `docs/PHASE_03_VERIFICATION.md`.
