# Development backlog and pre-launch checklist

## Phase 3 — verification complete

- [x] Historical Babel error absent in clean install, Vite transforms/build and Chrome runtime; no speculative dependency change.
- [x] Root `npm ci`; existing lockfile retained with the user's Express-range correction. Git commit remains the developer's choice.
- [x] `npm test`, `npm run typecheck`, `npm run build`; all pass.
- [x] Real development and compiled API HTTP 200; middleware regression coverage.
- [x] Prisma 7.10.0 validate/generate; no DB migration or application wiring.
- [x] Basic Chrome desktop/mobile visual and menu checks; full details in `docs/PHASE_03_VERIFICATION.md`.
- [x] Final complete-source ZIP packaged and verified (see `PROJECT_STATUS.md` for delivery status).

## Phase 3.1 — Architecture refactoring complete

- [x] Baseline Git/source review, tests, typechecks and builds.
- [x] Backend routes/controllers/middlewares with documented future service/data-access boundaries.
- [x] Feature-based frontend extraction; unchanged DOM/content/styles/assets and navigation source.
- [x] Updated structure checks, frontend rendered-output tests, HTTP contract regression and ZIP required paths.
- [x] Combined tests, typechecks/builds, Prisma validation, development/compiled HTTP checks and before/after static HTML equality.
- [x] Updated memory and complete-source ZIP delivery workflow.
- [ ] Follow the Phase 3.1 manual browser checklist when browser access is available: screenshots, responsive layout, menu/Escape, anchors, focus/reduced motion and console. No browser visual-equivalence claim is made.
- No remaining architectural implementation task is required for Phase 3.1. Add services/repositories only as actual later-phase business logic warrants them.

## Phase 4 — Public portfolio polish

- [x] Implement the light name-first hero, portrait proportions, editorial sections, native mobile disclosure and refined responsive CSS.
- [x] Add actual training areas, typed project system (hidden while empty), public-only contact config and useful footer.
- [x] Add low-cost entrances/reveals, focus/hover states and reduced-motion fallbacks.
- [x] Implement Vite/React build-time HTML with hydration, verified structured data, metadata and noindex/default absent canonical.
- [x] Pass combined tests, TypeScript/builds, Prisma validation, production-artifact tests, privacy scan and development/compiled HTTP checks.
- [x] Update memory and prepare full-source review ZIP with extraction verification.
- [ ] **Acceptance blocker:** browser host/native pipe unavailable. Perform every item in `docs/PHASE_04_VERIFICATION.md` at 320/375/390/768/1024/1440/1920px, including visual comparison, menu, hydration, console, no-JS, focus, reduced motion and landscape.
- [ ] Obtain real screenshots and visual review; correct observed differences. Do not mark responsive layout or browser behavior as passed from source tests alone.
- [ ] Record Lighthouse mobile/desktop and available browser/device results; no measured LCP/INP/CLS or score exists yet.
- [ ] After acceptance, mark Phase 4 complete and create `seraphine-portfolio-phase-04-complete.zip`. Current archive is a review snapshot.

## Phase 5 — Backend & database

- [ ] Review and validate initial Prisma model; implement migration and Prisma Client driver adapter for MySQL.
- [ ] Implement validated and tested REST routes, error handling and content publication states.
- [ ] Decide safe media storage (not blobs in Git) and contact processing.

## Phase 6 — Authentication and role dashboards

- [ ] Secure invitation/creation of SUPER_ADMIN (developer) and ADMIN (Seraphine).
- [ ] Password hashing, MFA consideration, login protection, JWT and secure session lifecycle.
- [ ] Build actual responsive LIGHT Owner Studio and DARK Super Admin Operations experiences.
- [ ] Enforce least privilege on server; audit changes; do not expose infrastructure secrets in dashboard.

## Phase 7 — CMS integration

- [ ] Connect public portfolio to published and verified content without slowing first paint.
- [ ] Support editing, drafts, publish actions, appropriate media/document uploads, and messages.

## Phase 8 — QA and performance

- [ ] Chrome, Firefox, Edge, Safari; keyboard/mobile/desktop; accessible reduced motion.
- [ ] Core Web Vitals, Lighthouse; lazy load below-the-fold media, test slow connections.
- [ ] Security review of auth/rate limits/uploads/CORS; API and DB integration tests.

## Phase 9 — Client content / legal / launch readiness

- [ ] **Seraphine approves synthetic portrait likeness**, or replace with an authentic approved full-length photo.
- [ ] Confirm legal/public full name spelling (developer says Nyirarukundo Seraphine).
- [ ] Confirm exact WASAC positions and periods; 2015–2021 / 2022–present are provisional.
- [ ] Resolve questionnaire overlap: first role says January 2015–present, later role January 2022–present. Do not infer a promotion or an end date.
- [ ] Confirm optional skills explicitly: the questionnaire checklist is unticked. No chemical dosing/chlorination, sampling, QA, reporting or Office proficiency is claimed solely from its prompt list.
- [ ] Obtain actual projects, achievements, measurable results (or omit sections).
- [ ] Confirm official education qualification titles and dates.
- [ ] Obtain certificate issuers, dates and copies for IT training, mobile laboratory testing and calibration.
- [ ] Obtain CV if approved for download and real LinkedIn URL if desired.
- [ ] Add fuller leadership experience, team sizes and career goals if provided.
- [ ] Verify permission to publish email, phone/WhatsApp, workplace photos and any project documents.
- [ ] Consider optional memberships, awards, recommendations and references only if real and authorized.
- [ ] Obtain owner acceptance and shipping authorization.
- [ ] Select a real domain before setting canonicalUrl/enabling indexing. Rebuild after approved changes; choose an approved social image and verify previews.

## Phase 10 — Deployment and handover

- [ ] Confirm compatible static host + Node runtime + MySQL hosting, budgets, HTTPS, secrets, backups.
- [ ] Production verification, monitoring, recovery and handover guide.
- [ ] Personalized email: explicitly DEFER until after the website work; user requested no discussion now.

## Maintenance

- [ ] Modernize the combined dev runner to remove Node 24 shell-argument deprecation warning and test cross-platform failure/shutdown supervision. Current fixed-name Windows startup/shutdown passed.
