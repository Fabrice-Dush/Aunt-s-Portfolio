> **Latest continuation — 2026-11-03:** Phase 4 frontend implementation and automated/HTTP checks are finished; browser acceptance remains BLOCKED and Phase 4 is IN PROGRESS. Read `docs/PHASE_04_VERIFICATION.md`, `PROJECT_STATUS.md` and `HANDOFF.md`. Preserve existing Phase 4 changes; do not restart Phase 3 or begin Phase 5. Delivery is a review snapshot.

> **Latest continuation — 2026-11-03:** Phase 3.1 architecture refactoring is complete; Phase 4 has not started. Read `docs/PHASE_03_1_VERIFICATION.md`, `PROJECT_STATUS.md`, `HANDOFF.md` and `ARCHITECTURE.md` before the retained historical notes below. Browser verification limitations are explicitly recorded.

> **Historical takeover prompt:** Its old Phase 3 blockers were investigated on 2026-11-02. Current results and next steps are in `PROJECT_STATUS.md`, `HANDOFF.md` and `docs/PHASE_03_VERIFICATION.md`. Do not rerun this old assignment as if verification were still pending.

# Paste this into Codex (first instruction)

You are taking over development of a real client project: **Nyirarukundo Seraphine's premium professional portfolio website**. The complete existing source code, approved design concepts, documentation, and history are in the attached/extracted `seraphine-portfolio/` folder. **Do not start a new app and do not redesign the approved UI.** Continue the actual repository.

FIRST, read `CODEX_START_HERE.md`, `AGENTS.md`, `PROJECT_STATUS.md`, `HANDOFF.md`, `DECISIONS.md`, `DESIGN_SYSTEM.md`, `ARCHITECTURE.md`, `BACKLOG.md`, `CHANGELOG.md`, and `docs/PHASE_03_LOCAL_ERROR.md`. Then inspect `frontend/`, `backend/`, `design/`, and `docs/visual-approval/`. Treat source and tests as authoritative for what is implemented; treat mockups as visual references only.

PROJECT GOAL AND NON-NEGOTIABLE DESIGN:
- Client: **Nyirarukundo Seraphine**, based in Kigali, Rwanda, a **Water Treatment Plant Engineer** at WASAC Group; the provided questionnaire says 11 years' experience. She is interested in management roles. Use her confirmed name prominently, especially as the hero's largest text; DO NOT call her an Environmental Engineer based on illustrative mockup text.
- The developer/client representative explicitly APPROVED the Phase 2 revision 02 aesthetics: high-end bright/light-white and blue editorial homepage; large dark-navy/blue name; strong standing portrait and refined visual hierarchy; light and approachable ADMIN content management dashboard; distinctly dark navy, technical SUPER_ADMIN dashboard. Images of the approved look are in `docs/visual-approval/`; working static design prototypes are in `design/prototype/`. The implementation must be bespoke, elegant and non-generic—not an off-the-shelf AI-style template.
- Make the site extremely fast, accessible, mobile-first, responsive on small phones through large monitors, and robust across Chrome, Firefox, Edge and Safari. Premium SVG iconography, optimized high-quality photos, subtle scroll/microanimations, tasteful lightweight water/3D visuals only if their real performance cost is acceptable; provide reduced-motion/fallbacks. Aim for good Core Web Vitals, practical SEO/prerendering, keyboard usability and clear semantic HTML.
- The standing portrait supplied with the design is AI-generated based on an uploaded client photo. Treat the likeness and apparent facility setting as illustrative until Seraphine authorizes public use. The original private photo and answered form are in `handoff-private/` (not for public Git or deployment).
- Never invent achievements, projects, success metrics, certifications, credentials, awards, traffic, analytics, testimonials, users, or dates. The earlier `2015–2021` and `2022–present` WASAC intervals are PROVISIONAL editor choices and must be verified before shipping. No public email/phone until owner explicitly authorizes. Do not use fake mockup numbers as data. Missing projects and results can remain elegant states/placeholders pending real information.

APPROVED TECHNOLOGY & PERMISSIONS:
- `frontend/`: React + Vite + TypeScript (root npm workspaces); `backend/`: Node.js + Express + TypeScript, Prisma + MySQL; JWT-backed secure authentication planned. Do not switch stacks without approval.
- Exactly TWO authenticated roles: `SUPER_ADMIN` for developer/maintenance, `ADMIN` for Seraphine; unauthenticated public visitors are GUEST (not a stored role). Later phases add secure server-side RBAC, content CRUD, drafts/publish, media and contact management, secure password storage/session controls/audit logging. No public signup, default accounts/passwords, or privileged seed credentials. Respect Seraphine's ownership; technical maintenance only with authorization.
- Avoid unnecessary framework/animation/3D overhead. The public site should render usable content without depending on a live API roundtrip for every visit. Ensure MySQL/Prisma version/driver compatibility after checking actual dependencies.
- Personalized/custom email discussions and implementation are explicitly DEFERRED until the website is complete.

PROJECT PHASES & REQUIRED ZIP DELIVERABLES:
1 Requirements/scoping (sufficient for design; launch facts still open)
2 UI/UX design (approved Phase 2 revision 02)
3 Architecture & project setup (**CURRENT: IN PROGRESS**, not done)
4 Premium public frontend
5 Backend/Prisma/MySQL/data API
6 JWT auth + working role-specific dashboards
7 CMS/content integration
8 Performance/cross-browser/accessibility/security testing
9 Client content verification, portrait approval, launch review
10 Deployment/handover
After EVERY completed code-implementation phase, update `AGENTS.md` (if needed), `PROJECT_STATUS.md`, `BACKLOG.md`, `CHANGELOG.md`, `HANDOFF.md`, and relevant design/architecture decisions; deliver a downloadable ZIP of the entire up-to-date project, not just diffs; exclude node_modules, build caches and secrets. Keep an honest record of tests and unresolved blockers. Do not claim Phase 4+ features work before implementing them.

YOUR IMMEDIATE ASSIGNMENT: finish Phase 3 without jumping ahead.
1. The developer installed npm dependencies locally on Windows, copied `backend/.env.example` to `backend/.env`, then ran `npm run dev`. Browser at `localhost:5173` showed `[plugin:vite:react-babel] _lruCache is not a constructor` with Babel helper-compilation-targets stack. Evidence screenshot: `docs/vite-babel-error-screenshot.png`. Diagnose the actual dependency resolution, Node/npm versions, lockfile and Vite React plugin compatibilities. Fix the issue at the root; use a clean lockfile/install or a verified React SWC plugin if justified; don't blindly guess. Do not expose `.env`.
2. Run a clean root workspace dependency install, inspect versions, run `npm run check:offline`, `npm run typecheck`, `npm run build`, `npm run prisma:validate` if configured, and resolve legitimate failures. Confirm the React frontend loads, menus work and the Express endpoint `http://localhost:4000/api/v1/health` returns success. If you cannot run MySQL without credentials, explicitly document that as blocked rather than claiming migrations work. Avoid creating migrations or backend auth prematurely.
3. Preserve the Phase 2 approved look, including large client name and light/dark admin visual separation, and avoid accidental design regressions during setup fixes.
4. Update project memory accurately, document the error resolution and validation results, and generate `seraphine-portfolio-phase-03-complete.zip` only after Phase 3 acceptance criteria are actually satisfied. If a key verification is blocked, return a reproducible fix/status with a ZIP labeled as work-in-progress instead. Then propose Phase 4 implementation plan; don't silently jump phases.
5. Where a user decision, missing client fact, or genuine external credential is required, surface the exact blocker clearly, but implement everything else that is safely possible.

This is a high-value professional client site: execute with care, precise code review, accessibility, security, truthful content, detailed tests, and beautiful approved art direction. Start by reporting what you found in the actual project and an explicit Phase 3 fix-and-validation plan; then implement and test it.
