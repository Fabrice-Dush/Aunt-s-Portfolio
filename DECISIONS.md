# Decisions — approved and provisional

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

- Whether to pre-render React public routes and how to invalidate/rebuild static pages after CMS publishing.
- Actual MySQL/Node deployment provider, file storage, contact submission delivery, telemetry privacy, role auth/JWT implementation details, backup infrastructure.
- Exact browser version support and CI runner.

## Phase 3 verification decisions — 2026-11-02

- Keep the existing dependency versions, Babel React plugin and lockfile. Clean `npm ci` and actual transforms/build/browser checks passed; no SWC switch or cache override is justified. Preserve the developer's existing Express range correction in the lockfile.
- Use safe fixed JSON error responses for invalid JSON (400) and excessive request bodies (413); keep unexpected errors private (500).
- A valid, generated Prisma schema completes the setup gate. Live MySQL/migrations are explicitly Phase 5 and remain unverified because the configured local port refuses connections and credentials are placeholders.
- Deliver the entire source/design/docs repository as a local ZIP excluding `handoff-private`, secrets, dependencies and generated outputs. This is a developer handoff, not publication permission for the synthetic portrait.
