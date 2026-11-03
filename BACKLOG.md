# Development backlog and pre-launch checklist

## Phase 3 — verification complete

- [x] Historical Babel error absent in clean install, Vite transforms/build and Chrome runtime; no speculative dependency change.
- [x] Root `npm ci`; existing lockfile retained with the user's Express-range correction. Git commit remains the developer's choice.
- [x] `npm test`, `npm run typecheck`, `npm run build`; all pass.
- [x] Real development and compiled API HTTP 200; middleware regression coverage.
- [x] Prisma 7.10.0 validate/generate; no DB migration or application wiring.
- [x] Basic Chrome desktop/mobile visual and menu checks; full details in `docs/PHASE_03_VERIFICATION.md`.
- [x] Final complete-source ZIP packaged and verified (see `PROJECT_STATUS.md` for delivery status).

## Phase 4 — Public portfolio polish

- [ ] Refine homepage to closely match approved light name-first visual concept.
- [ ] Replace initial section scaffolding with finished reusable production-ready components.
- [ ] Extend the Phase 3 Chrome viewport smoke review to full-page, keyboard, real-device and cross-browser testing; implement premium yet low-cost interaction details.
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

## Maintenance

- [ ] Modernize the combined dev runner to remove Node 24 shell-argument deprecation warning and test cross-platform failure/shutdown supervision. Current fixed-name Windows startup/shutdown passed.
