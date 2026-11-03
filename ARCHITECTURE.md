# Architecture — current source and future boundaries

## Phase 4 additions — 2026-11-03

The Phase 3.1 feature boundaries remain. Phase 4 implementation is present; browser acceptance is still pending. See `docs/PHASE_04_VERIFICATION.md`.

- `app/App.tsx` composes typed navigation from visible features and passes links to shared Header. Header uses native mobile `details/summary`, with React effects for Escape/outside/focus/resize closing and observed active state.
- `features/certifications/{components/Training.tsx,data/training.ts,types.ts}` owns actual training UI/data and optional confirmed certificate metadata.
- `features/projects/{types.ts,data/projects.ts,components/Projects.tsx}` supports approved project presentation. The actual array is empty; no section or link is shown. Source data must be safe to bundle; future CMS drafts must be filtered on the server, not merely hidden in React.
- `features/portfolio/data/contact.ts` holds only approved public contact values, currently none. Contact remains informational without a form or backend integration.
- `shared/hooks/useSectionReveal.ts` adds one-time transform motion without initially hiding content. Global CSS remains the shared token/layout stylesheet, now readable and refined for 960px/600px layout changes.
- `src/entry-prerender.tsx` uses React server rendering of the same App and minimal verified Person data. `frontend/scripts/prerender.mjs` uses Vite's production SSR build in ignored `.cache/prerender`, then writes meaningful HTML into `dist/index.html`. Only the static distribution is deployable; the SSR entry is build-only.
- `src/main.tsx` hydrates populated production HTML; development uses createRoot. No browser globals run during SSR. Footer avoids wall-clock values that could diverge during hydration.
- `frontend/site.config.mjs` contains public-only canonical/indexing settings. `scripts/seo.mjs` validates canonical URLs and escapes structured data. Default is no domain/noindex. No live API dependency for first paint.
- `frontend/test/seo.test.mjs`, expanded render tests and `test/build/production.test.mjs` check rendering/privacy/metadata and actual production artifacts. `scripts/verify-phase04.mjs` verifies development/production HTTP assets and compiled API behavior, not browser behavior.
- Future CMS integration should provide an approved published snapshot and trigger a rebuild. Do not place private drafts or contact details into a client bundle. No content API or deployment hook is implemented now.

## Retained baseline source tree as of Phase 3.1

```text
frontend/
  src/
    main.tsx
    app/App.tsx
    features/
      portfolio/
        components/{Hero,Overview,About,Contact}.tsx
        data/profile.ts
        pages/HomePage.tsx
      expertise/
        components/{Expertise,ExpertiseIcon}.tsx
        data/specialties.ts
      experience/
        components/Experience.tsx
        types.ts
      education/components/Education.tsx
      projects/components/Projects.tsx
    shared/
      components/layout/{Header,Brand,Footer}.tsx
      components/ui/SectionHeading.tsx
      styles/global.css
    vite-env.d.ts
  test/render.test.mjs
  public/                         unchanged favicon and concept portraits
backend/
  src/
    app.ts                        middleware ordering and versioned router mount
    server.ts                     unchanged HTTP startup/shutdown
    config/env.ts                 unchanged validated environment configuration
    routes/{index,health.routes}.ts
    controllers/{api,health}.controller.ts
    middlewares/{errorHandler,notFound}.ts
  test/http.test.mjs
  prisma/schema.prisma            proposed MySQL model; no migration
  prisma.config.ts                unchanged Prisma 7 configuration
scripts/                          structure tests, dev runner, ZIP packager
design/                           preserved Phase 2 prototypes/assets/previews
docs/                             approvals and phase verification records
```

## Backend MVC with service layer

REST flow: **request → route → controller → service → Prisma/data access → MySQL**. The service and database portions apply when business functionality is implemented in Phase 5. Current health and API metadata handlers simply return JSON; they do not require a service. No empty `services/`, repositories, model wrappers or migrations are created to illustrate the future design. JSON responses are the API representation; there are no server-rendered views.

- `app.ts` composes unchanged Helmet, configured CORS, rate limiting, 100kb JSON parsing, `/api/v1` router, 404 and centralized errors in the original order.
- `routes/index.ts` connects the API metadata controller and health subrouter. Route files only define endpoints, controller connections and endpoint-specific middleware.
- `controllers/` handles HTTP input and output. Future input must be validated before calling services. Controllers must not contain business rules or direct Prisma queries. Express 5 forwards thrown errors/rejected handler promises to the existing error handler; callback-style asynchronous errors must call `next(error)`.
- Add plain functions under `services/` when real business logic arrives. Keep them independent of Express request/response objects and unit-test business rules. Simple Prisma operations can live in services; introduce repositories only for actual data-access complexity.
- `middlewares/` owns shared request/error concerns. The split preserves fixed 400, 413, 404 and safe 500 responses. Authentication/authorization middleware remains Phase 6.
- `config/env.ts` validates server settings; secrets stay in ignored local environment files. Prisma schema/config remain unchanged and unconnected to runtime health.

## Frontend feature boundaries and imports

- `main.tsx` mounts/hydrates React StrictMode and imports global CSS. `app/App.tsx` composes the preview banner, skip link, shared layout and portfolio page; no router or provider is required.
- `features/portfolio/pages/HomePage.tsx` composes the existing public sections. Portfolio content stays in `portfolio/data/profile.ts`, preserving all wording and provisional flags. Experience and education receive typed data through props rather than importing portfolio content themselves.
- `features/expertise/` owns icons and specialty content. Experience owns the `CareerPosition` domain type; portfolio data uses a type-only import. Phase 4 adds the training module described above because actual training UI is now required.
- `shared/` holds presentational layout, the multi-feature section heading and unchanged global CSS. Shared components must not import feature content; Footer receives the owner's name as a prop. Keep feature-specific components in their feature rather than sharing speculatively.
- Use explicit relative imports: frontend extensionless TS/TSX module paths; backend `.js` specifiers for NodeNext ESM output. Use `import type` for types. No aliases, barrel export layers or dependencies were added.
- Features may consume shared UI. Page/application composition may combine features. Avoid reverse dependencies from shared code into features or from leaf sections into the portfolio composition.

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
- Phase 4: polish the extracted components, responsive/browser testing, animation direction, SEO static/pre-render approach, image/media optimization.
- Phase 6: actual admin routes and role-aware navigation; Phase 7: CMS data integration, uploads and publishing.

## Deployment direction (not selected)

- Static frontend can be hosted separately from the long-running Node/Express backend and database.
- Free static hosting does not imply free backend/MySQL hosting.
- Keep secrets, database backups, deployment permissions outside the public portfolio and git repo.

## Phase 3 runtime verification — 2026-11-02

Both TypeScript builds and the local frontend/API were verified. JSON-parser failures now return safe 400/413 responses; unknown routes return 404 and unexpected errors remain safe 500 responses. The HTTP suite exercises health, metadata, Helmet, CORS headers/preflight, parser limits, error hiding and rate limiting without a database. CORS controls browser response access, not server authorization. No authentication is implied. See `docs/PHASE_03_VERIFICATION.md`.
