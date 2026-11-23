# Approved visual transformation — 2026-11-23

This is an authorized local extension of the completed Phase 9 implementation. Phase 10 deployment has not started. Visual-direction approval does not replace the outstanding owner content, likeness, contact, indexing or launch approvals.

## Reference mapping

All six supplied files were opened and visually inspected before implementation. The reference directory is `docs/visual approval final/`; its historical predecessors remain intact.

| File | Experience | Initial appearance |
|---|---|---|
| 01_public_light.png | Public portfolio, white/ice blue, editorial name, portrait arch, water centerpiece | Light |
| 02_public_dark.png | Public portfolio, deep navy/cyan | Optional dark |
| 03_admin_light.png | Portfolio Studio, navy sidebar, spacious workspace, publishing workflow | Light |
| 04_admin_dark.png | Portfolio Studio, navy/cyan surfaces | Optional dark |
| 05_superadmin_dark.png | System Operations, protected technical workspace | Dark |
| 06_superadmin_light.png | System Operations, ice-blue workspace and sidebar | Optional light |

Reference qualifications, job histories, messages, account names, counts, IPs, fictional roles and unsupported controls were not copied into application content or database records. Current published development data has one profile and six skills; empty public collections and unapproved contacts remain absent. No existing portrait was replaced.

## Implementation

Installed versions inspected locally: React/React DOM 19.3.1, Vite 7.3.7, TypeScript 5.9.3, Express 5.3.0, Prisma Client/CLI/MariaDB adapter 7.10.1, Node 24.11.1. No dependency or lockfile changes.

Shared palette tokens cover page/panel/glass surfaces, ink, secondary text, accents, borders, controls, focus and shadows. Appearance is independent for public, Studio and Operations. Only a `light` or `dark` preference is stored under `seraphine-appearance-{scope}`; authentication remains in the existing HttpOnly cookies. A tiny same-origin, content-hashed classic script executes in the document head before styles and React, including neutral private shells, without relaxing CSP. Storage failure falls back to the experience default. Switches are labelled native keyboard-operable buttons with switch semantics. Cross-tab storage events synchronize the matching preference.

The public hero preserves the existing standing portrait, concept/approval disclosure, exact name/title and CMS motto. Its layout uses a wide editorial composition, arched portrait, water ribbon, location and relevant real anchor CTAs. About, the horizontal desktop published-career timeline, education/projects/achievements/certifications and the contact area share the new visual rhythm. Public sections use roughly 80px on phones through 152px on larger screens. No empty collection section is invented to fill the reference.

Final actual-content inspection caught the portrait entrance retaining a transform stacking context and letting the water ribbon partly cover the approval caption. The entrance now animates the photograph frame; the caption's parent never enters that animation's stacking context. A browser assertion verifies the parent transform remains `none`. Theme hydration also avoids rewriting an already-correct root appearance/color scheme. An intermediate backwards-fill correction and its measurements are retained as separate evidence. Delivery-source frontend tests (24), complete builds and four artifact checks passed again in `frontend-delivery.log`, `build-delivery.log` and `artifacts-delivery.log`. The earlier isolated all-module review predates these focused rendering adjustments; the delivery real-content review supplies final-source theme, disclosure and responsive checks.

Expertise uses published skills around a central glass-water sculpture on desktop. The six-item orbit becomes a two-column and then single-column layout on smaller devices. Selection is implemented with ordinary Tab/Space/Enter-operable buttons, `aria-pressed`, a polite detail panel and visible focus; every skill description remains visible before enhancement. Arbitrary collection lengths use a regular grid. The graphic is decorative and not part of the accessible name.

Studio now has the approved navy navigation, editorial welcome header, workflow, genuine draft/published/archived totals (no invented pending-review state), content publication table, profile links, actual message count, publication activity and owner-review guidance. Operations has the technical hero, genuine account summary, first-page regular administrator table, recent actual audit events and links to supported status/access controls. It does not claim live infrastructure monitoring, global audit search, fictional roles, account counts, IP addresses or backup controls. Existing account, session, CMS, media, message, settings, audit and status routes retain their original behavior; common styles apply across all modules, grouped fields and sticky save actions.

Motion uses short transform entrances, staggered hero elements, section reveals and refined selection/hover/focus feedback. No scroll hijacking, continuous animation loop, canvas, WebGL or heavy 3D library was added. Reduced-motion rules disable animations/transitions and smooth scrolling. Native no-JavaScript public content/navigation and disabled private-message submission remain intact.

## Asset provenance

- `frontend/public/images/water-sculpture.webp`: decorative generated glass-water sculpture, 640×800, alpha transparency, 106,070 bytes. Built-in Imagegen mode; original generated PNG retained outside the repository. Sharp performs only resizing/encoding for delivery. No person or professional evidence is depicted.
- Existing portrait WebPs are byte-preserved. Original reference images remain documentation, never full-page application backgrounds.
- `WaterArt.tsx` supplies the original ribbon and Operations shield/globe as static SVG image assets (`water-ribbon.svg`, `water-security.svg`). Exporting the unchanged shapes removes repeated decorative paths from React hydration; the head script and privacy/cache rules remain intact. Decorative security art makes no operational claim.

Final generation prompt: “Use case: stylized-concept. Asset type: transparent decorative centerpiece for an existing premium water-engineer portfolio, not a UI mockup. Create one exquisite photorealistic 3D glass-water sculpture: a crystal-clear spherical globe containing a gently swirling wave of pure blue water, embraced by one elegant tall S-shaped twisting transparent liquid-glass ribbon that curls above the sphere and sweeps under it. Low oval polished clear-glass plinth beneath, a few delicate concentric water ripples at its base. Front three-quarter studio product render, tall sculptural silhouette, centered single object completely in frame with generous transparent margin, 4:5 composition. Physically realistic refraction, bright fine white caustics, ice-blue and restrained deep-blue contours, clean brilliant polished water, sophisticated subtle cyan rim lighting usable on both white and dark navy backgrounds. Ultra refined realistic luxury product visualization. Real alpha transparency including outside all ripples, no opaque rectangular background, no text, no people, no logos, no UI elements, no surrounding labels, no scenery, no black drop shadow, no decorative particles outside the sculpture. This must be an isolated image asset only; don't reproduce any webpage.”

## Evidence and acceptance

Verification is recorded below as execution completes. Screenshots/reports stay in ignored `.cache/visual-refresh`; they are QA evidence, not backups or owner approval.

- `before/`: copied retained Phase 9 after-screenshots. `git diff c704793..34c9a8f -- frontend/src` is empty, confirming the pre-refresh application UI source remained the Phase 9 source. These are historical captures, not a newly executed baseline; their fixture content and environment differ from the new six-skill review.
- `live/`: existing development accounts and real published content; reads/edit-panel opening only, no protected content edits or cleanup.
- `isolated/`: real authenticated APIs and synthetic isolated fixture records, exact approved test schema/instance, process-only signing/configuration, shared exclusive lock, initially-empty refusal and captured-ID cleanup.
- `fixture/`: preliminary browser-response previews while MySQL was stopped. These are explicitly labelled and are not functional acceptance evidence.

Initial failures are retained honestly: old heading/palette tests needed new design assertions; the portrait-only asset test needed to distinguish the new decorative image; a sandbox run could not spawn workers; a mock synchronization response missed its build object; early live screenshots found inherited guidance-panel contrast; an initial isolated runner needed a longer startup deadline; its mobile final logout needed the desktop sidebar; a concurrent build was refused by the build lock and its subsequent artifact check correctly detected the stale distribution. The final normal build is run after lock release. These are not counted as passing final evidence. The first broad browser run crossed the last presentation polish and its asset fingerprints differ between builds; it is diagnostic evidence, not a uniform final-build acceptance run. Its 15/19 results, failed account-field locator and Firefox/Chrome/Edge timeouts are retained. A fresh SUPER_ADMIN focus subsequently passed both complete scenarios, and a Firefox-only rerun passed its public/navigation/two-role workflow. Chrome/Edge automation remains an explicit limitation pending manual acceptance. Additional incomplete findings prompted a valid specialization group role and underlined inline settings link; gradient contrast findings retain the supplemental bounds below.

### Visual comparison

The implementation screenshots were inspected alongside all six references. Public light/dark retain the editorial two-line name, existing arched portrait, motto, ribbon and surrounding expertise composition. Studio light/dark retain the navy sidebar, welcome statement, water header, workflow, publication summaries and content workspace. Operations dark/light retain the technical welcome, protected-workspace badges, account management and audit activity, with the optional ice-blue sidebar.

The result follows the approved composition and palette, with these deliberate differences: the preserved existing concept portrait differs from the mockup likeness; genuine published collections determine public page length/navigation; real backend states replace fictional pending review; stored content is summarized by collection with links to the full editors rather than a fabricated mixed-record table; technical navigation includes all existing supported CMS modules; unsupported notification/global-search/infrastructure controls are omitted; the decorative Operations globe and flowing ribbons use lighter vector rendering instead of the reference's dense rendered scenery. The generated centerpiece is an isolated reusable water sculpture, not a screenshot. Spacing is more generous as requested. This is a responsive implementation of the art direction, not a pixel-identical flattened image or owner appearance sign-off.

### Verification ledger

| Check | Result and evidence |
|---|---|
| Source regression | PASSED: 7 offline, 24 frontend and 31 backend/API runner tests, zero failures/skips. Resumed source: `.cache/visual-refresh/source-resumed.log`; all 24 frontend tests passed again after the delivery rendering adjustments in `frontend-delivery.log`. |
| TypeScript | PASSED both workspaces, `.cache/visual-refresh/typecheck-resumed.log`. |
| Production builds/artifacts | PASSED full frontend prerender/backend builds and four production artifact tests; delivery build in `build-delivery.log`, artifact results in `artifacts-delivery.log`. Public assets stay approximately 247 KB JS / 77.5 KB gzip, 20 KB CSS / 5.5 KB gzip, plus 0.63 KB appearance initialization. Private workspace assets remain lazy. Exact filenames/sizes are in the build log. |
| Real DB/auth/CMS | PASSED sequential isolated 11 database + 18 authentication + 14 CMS scenarios; original exact-target guards and captured-ID cleanup retained. No backend behavior/schema/dependency change. |
| Functional browser regression | Initial broad diagnostic: 15/19 PASSED, four FAILED (SUPER_ADMIN temporary-passphrase locator; Firefox navigation; installed Chrome screenshot; Edge mobile-menu timeout). It crossed presentation polish and is not uniform final-build acceptance. Subsequent unchanged focused SUPER_ADMIN 2/2 and Firefox 1/1 PASSED. Evidence: `functional-initial.json`, `super-admin-focused.json`, `firefox-focused.json` under `.cache/visual-refresh/`. Installed Chrome/Edge acceptance remains BLOCKED by automation timeouts. |
| Optimized six-theme review | PASSED: 126 captures, 30 axe scans, zero violations, seven widths (320/375/390/768/1024/1440/1920), independent defaults/persistence before first frame, keyboard expertise selection, reduced motion and all existing dashboard modules. Chromium 156.0.8078.4. `isolated-optimized.log`, `isolated/summary.json` and three `results-{public,studio,operations}.json` files. Sequential public-only recapture PASSED after the capture helper explicitly loaded offscreen native-lazy images (`public-optimized-recapture.log`, `summary-public-recapture.json`). Both runs cleaned all 13 isolated application tables and released the shared lock. |
| Normal development review | PASSED delivery-source real-content, existing-account review: 34 captures / 10 axe scans / zero violations, six appearances, seven widths, persisted theme before first frame, keyboard expertise, reduced motion, portrait caption stacking assertion, profile editor opening without saving and logout (`live-delivery.log`, `live/results.json`). No normal temporary account cleanup. One launcher is running at localhost:5173/4000, with XAMPP on 3306. |
| Privacy/preservation | PASSED XAMPP-aware source/build comparison; pre-commit final source/index/history checks and protected backup hashes are recorded in `privacy-final-source.json` and `privacy-final-staged.json`. Comparison includes current/old environment secrets and both temporary account passwords without printing them. The historical Phase 8 privacy script assumes pre-XAMPP environment bytes and is not an appropriate current baseline. Original-record/account/environment diagnostic is `preservation-resumed.json`; original strict whole-table status remains FAILED on the appended message as described below. |
| Performance | PASSED final measurement execution: three valid native Chrome traces per profile, no runtime errors in this delivery set. Medians: mobile 74 / LCP 2.150 s / FCP 1.700 s / TBT 1210 ms / CLS 0; desktop 100 / LCP 0.551 s / FCP 0.425 s / TBT 5 ms / CLS 0. Mobile blocking-time regression remains UNRESOLVED; performance acceptance is open. Earlier faster/failed sets remain separate and are not substituted for the delivery result. |
| Human acceptance | NOT RUN: actual Safari/iOS, touch/file pickers, screen readers and actual browser zoom. Owner appearance/content/likeness/contact/indexing/launch review remains pending. |

### Resumed state and preservation

The continuation recovered `main` at `34c9a8f` with 30 modified tracked files plus the supplied references, theme/components, decorative assets, review runners and this report. No files were staged. The historical screenshot's 14-file count was not treated as current state. Public/Studio/Operations implementation was present; remaining work was optimized-vector browser verification, performance, preservation diagnostics, documentation and Git delivery. The one backend controller diff is formatting only and is preserved separately from the frontend delivery.

The original development-account status command was retained unchanged and currently reports FAILED at its generic configuration stage. A separate read-only diagnostic confirmed exact environment bytes, approved XAMPP instance, private directory ACL/ignore rules, both captured account identities/readiness, every non-message content table and the complete migration ledger match the saved baseline. The contact table contains one appended message; removing each candidate from the in-memory comparison proves the original message is byte-for-field unchanged. Thus all original 17 content/message rows remain unchanged, with 18 rows now present. No message was printed, edited or deleted, and neither the baseline nor strict guard was relaxed. Authenticated visual review adds ordinary sessions/audits through the existing APIs.

The earlier automatic approval review usage-limit failure did not execute its diagnostic. The resumed original status and read-only diagnostic were subsequently approved and executed; there is no outstanding approval block.

Automatic review initially refused the public-only recapture because an isolated process appeared active. The previous execution had completed successfully; a fresh check confirmed both test/build locks absent and no listeners on 4408/5178. Only then was the sequential recapture approved and run. No lock, fixture guard or approval check was bypassed.

### Screenshot locations

All final captures are in ignored `.cache/visual-refresh/isolated/`. Compare the following directly with the six approved reference files in the first table:

| Experience | Desktop | Mobile |
|---|---|---|
| Public light/dark | `public-{light,dark}-1440.png`, `public-{light,dark}-1440-full.png` | `public-{light,dark}-390.png`, `public-{light,dark}-390-full.png` |
| Studio light/dark | `studio-{light,dark}-1440.png` | `studio-{light,dark}-390.png` |
| Operations dark/light | `operations-{dark,light}-1440.png` | `operations-{dark,light}-390.png` |
| Interactive expertise | `expertise-{light,dark}.png` | Sculpture visible in the recaptured mobile full-page views |
| Existing editors and management | `{studio,operations}-{area}-{light,dark}-{1440,390}.png` | Same naming scheme; all existing areas enumerated in the runner |

The complete evidence uses visibly synthetic isolated data with real backend authentication/CMS APIs. No private screenshot is committed. The public recapture was visually inspected to confirm the mobile sculpture and lazy footer ribbon render. The six desktop views and representative mobile/editor views were inspected against the supplied references; differences are documented above.

### Delivery file inventory

- Public presentation: `frontend/src/features/portfolio/components/{About,Contact,ContactForm,Hero}.tsx`, `portfolio/pages/HomePage.tsx`, `education/components/Education.tsx`, `experience/components/Experience.tsx`, `expertise/components/Expertise.tsx`.
- Shared/auth/workspaces: `frontend/src/shared/styles/global.css`, `shared/components/layout/Header.tsx`, new `shared/components/ui/{AppearanceControl,WaterArt}.tsx`, new `shared/theme/appearance.js`, `features/auth/Login.tsx`, `features/dashboard/{Dashboard.tsx,dashboard.css}`, `frontend/vite.config.ts`.
- Assets: new `frontend/public/images/{water-ribbon.svg,water-security.svg,water-sculpture.webp}`; six supplied PNG references and their explanatory README under `docs/visual approval final/`.
- Tests/tooling: `frontend/test/{accessibility,auth,render}.test.mjs`, `frontend/test/build/production.test.mjs`, `scripts/phase08-{browser,performance}.mjs`, new `scripts/visual-refresh-{review,isolated}.mjs`.
- Continuity: this report, `docs/DEVELOPMENT_DASHBOARD_TESTING.md`, `AGENTS.md`, `ARCHITECTURE.md`, `BACKLOG.md`, `CHANGELOG.md`, `DECISIONS.md`, `DESIGN_SYSTEM.md`, `HANDOFF.md`, `PROJECT_STATUS.md`, `README.md`.

The separate formatting-only `backend/src/controllers/cms.controller.ts` edit is left unstaged and preserved. No backend behavior, environment, schema, migration, original portrait, dependency lockfile or private credential/state file is included in the visual delivery.

### Performance provenance

The initial `visual-refresh` measurement produced three valid native Chrome traces per profile after one retained NO_NAVSTART failure. Medians: mobile score 83, LCP 2.092 s, FCP 1.765 s, TBT 604 ms, CLS 0; desktop score 99, LCP 0.602 s, FCP 0.495 s, TBT 43 ms, CLS 0.00042. Transfer was 267,720 bytes / 8 requests. The slow mobile median is retained rather than selecting its fastest run. Static-vector optimization then reduced public prerender HTML from 18,417 to 13,824 bytes and removed decorative SVG paths from hydration. A distinct `visual-refresh-optimized` label preserves both build fingerprints.

Phase 9 documented local medians were mobile score 99 / LCP 1.803 s / FCP 1.503 s / TBT 89 ms / CLS 0, desktop score 100 / LCP 0.443 s / FCP 0.424 s / TBT 0 / CLS 0; 154,557 transferred bytes / 6 requests. These are historical local lab results, not a newly matched baseline or field performance.

Intermediate optimized evidence is `.cache/phase08-performance/visual-refresh-optimized/` and `.cache/visual-refresh/performance-optimized-summary.json`. The unchanged runner retained every valid trace across retries: mobile scores 69/99/98, TBT 2758/20/82.5 ms; the slow first trace is included in that build's median. Desktop valid runs: score 97, LCP 0.580 s, FCP 0.501 s, TBT 135 ms, CLS 0.00042; score 100, LCP 0.700 s, FCP 0.467 s, TBT 0, CLS 0. Three command attempts failed on missing native navigation-start tracing (one mobile attempt, then desktop run 3 twice). Logs and failed JSON are retained; no assertion, throttle or scoring setting was weakened. That intermediate set's third desktop trace remains unavailable; later builds have their own complete measurement sets.

Current native lab user agent is HeadlessChrome 157.0.0.0; Phase 9 used Chrome 156. This differs from the bundled Chromium 156 used for functional screenshot review. Mobile lab settings are Lighthouse 13.5.0, simulated 4x CPU slowdown, 150 ms RTT / 1638.4 Kbps throughput, 412x823 at device scale 1.75. Delivery mobile benchmark indices varied 689/1217.5/522 (Phase 9 659.5/812/784), so the historical comparison is not a controlled causal test. The large TBT variation is observed evidence; its cause is not established and is not dismissed as only environment noise.

| Build label / presentation state | Valid traces | Mobile median: score / LCP / TBT | Desktop median: score / LCP / TBT |
|---|---|---|---|
| `phase09` historical baseline | 3 + 3 | 99 / 1.803 s / 89 ms | 100 / 0.443 s / 0 ms |
| `visual-refresh` inline decorative paths | 3 + 3 | 83 / 2.092 s / 604 ms | 99 / 0.602 s / 43 ms |
| `visual-refresh-optimized` static vectors | 3 + 2 | 98 / 2.119 s / 82.5 ms | Incomplete; no three-run median |
| `visual-refresh-final` intermediate backwards-fill caption fix | 3 + 3 | 78 / 2.201 s / 847 ms | 93 / 0.662 s / 191 ms |
| `visual-refresh-delivery` frame animation + no duplicate theme writes | 3 + 3 | **74 / 2.150 s / 1210 ms** | **100 / 0.551 s / 5 ms** |

Use `.cache/phase08-performance/visual-refresh-delivery/summary.json`, its six raw JSON traces and `build.json` as the final-build performance evidence. Build fingerprint: `8dd849ac78cdaaf0ae7f6f65a761c8a2e49505f12733ed63ca341d9603d8f3b3`. Execution log: `.cache/visual-refresh/performance-delivery.log`. Supplemental compact record: `visual-refresh-delivery-summary.json` in the same ignored visual-review directory. Delivery mobile scores are 81/67/74 and TBT 706/3671/1210 ms; desktop scores are 100/100/100. Every valid trace is retained. Delivery transfer is 269,185 bytes / 9 requests, about 115 KB above Phase 9, mostly the 106 KB sculpture. Both median CLS values are zero. Accessibility/best-practices are 100 in all six valid delivery traces; SEO remains 66 with intentional noindex.

Mobile LCP is about 0.347 s slower than the historical median and blocking time regressed substantially. Avoiding redundant root writes and changing the animation's stacking ownership improved structural rendering behavior but did not establish restored mobile performance. Controlled trace analysis and actual-device testing remain open before performance acceptance; do not claim the earlier optimized build's score 98 for this delivery. No deployed performance, field INP or p75 claim.

### Git delivery

The local delivery contains 46 reviewed visual/source/test/reference/documentation files. Private environment, credentials/state, screenshots, caches, uploads, backups and generated distributions are excluded. The formatting-only backend controller edit is deliberately left outside this delivery. No push, deployment, ZIP, account cleanup or Phase 10 work was performed. No new phase-completion tag is created for this local visual extension with recorded acceptance limits. Final commit identity and working-tree status are reported in the delivery message.

Supplemental selected contrast checks: main/secondary/accent text against each light/dark page/panel/surface token passes 4.5:1; control boundaries pass 3:1. On the accent-soft bounds, text is 11.66/8.79, secondary text 5.48/5.81, accent text 4.61/6.48 (light/dark). White sidebar active text at the brightest gradient endpoint is 4.56; selected expertise body at its brightest endpoint is 4.85; sidebar secondary text is at least 7.77 on the selected dark bound. These selected bounds supplement automated gradient-incomplete results; they do not prove every appearance or full WCAG conformance.

### Remaining manual review

Actual Safari/macOS/iOS, touch hardware and file pickers, real 200%/400% browser zoom, increased text/spacing and NVDA/VoiceOver remain human acceptance items. CSS widths, Playwright WebKit and automated axe checks do not establish full device or WCAG conformance. Local Lighthouse is not deployed field INP/p75 performance.

Owner review: start MySQL in XAMPP, reuse/start `npm run dev`, open `http://localhost:5173`, toggle appearance and inspect hero/about/expertise/contact at desktop and mobile sizes. At `http://localhost:5173/login`, privately use the existing ignored temporary credentials described in `DEVELOPMENT_DASHBOARD_TESTING.md`. Review every Studio module and both Operations themes; open a profile editor and cancel, then review accounts/audit/status. Do not save changes to protected development records merely for appearance review. Sign out between roles. Review the six approved images alongside the ignored screenshots; owner approval of the implementation remains separate from the supplied visual-direction approval.
