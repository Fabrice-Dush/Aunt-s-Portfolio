# Development backlog and pre-launch checklist

## Priority 0 — Codex: fix local Vite/Babel startup blocker and finish Phase 3

- [ ] Reproduce/resolve `[plugin:vite:react-babel] _lruCache is not a constructor` from developer Windows run. See `docs/PHASE_03_LOCAL_ERROR.md`.

- [ ] `npm install`; create and commit generated `package-lock.json`.
- [ ] `npm run typecheck` and `npm run build` cleanly.
- [ ] Run Vite at localhost:5173 and review the React page at 320/390/768/1024/1440/1920px; fix any runtime/visual bugs.
- [ ] Run Express at localhost:4000 and verify `/api/v1/health` returns JSON HTTP 200.
- [ ] Run `npm run prisma:validate` with a locally configured MySQL URL; fix schema issues before treating as valid.
- [ ] Update phase status/verification notes then ZIP whole project again and mark Phase 3 COMPLETE.

## Phase 4 — Public portfolio polish

- [ ] Refine homepage to closely match approved light name-first visual concept.
- [ ] Replace initial section scaffolding with finished reusable production-ready components.
- [ ] Test real responsive behavior and implement premium yet low-cost interaction details.
- [ ] Choose SEO pre-render strategy for public portfolio; validate social previews.
- [ ] Add accessible behavior and optimize page critical path.
- [ ] Complete phase 4 tests and export full project ZIP.

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
- [ ] Obtain actual projects, achievements, measurable results (or omit sections).
- [ ] Confirm official education qualification titles and dates.
- [ ] Obtain certificate issuers, dates and copies for IT training, mobile laboratory testing and calibration.
- [ ] Obtain CV if approved for download and real LinkedIn URL if desired.
- [ ] Add fuller leadership experience, team sizes and career goals if provided.
- [ ] Verify permission to publish email, phone/WhatsApp, workplace photos and any project documents.
- [ ] Consider optional memberships, awards, recommendations and references only if real and authorized.
- [ ] Obtain owner acceptance and shipping authorization.

## Phase 10 — Deployment and handover

- [ ] Confirm compatible static host + Node runtime + MySQL hosting, budgets, HTTPS, secrets, backups.
- [ ] Production verification, monitoring, recovery and handover guide.
- [ ] Personalized email: explicitly DEFER until after the website work; user requested no discussion now.
