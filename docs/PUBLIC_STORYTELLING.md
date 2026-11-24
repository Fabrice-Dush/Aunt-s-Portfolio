# Public content and interactive storytelling — 2026-11-24

Authorized local refinement of the existing Phase 9 portfolio, following all six references in `visual approval final/`. This continues [the visual checkpoint](VISUAL_TRANSFORMATION.md); it does not authorize Phase 10, deployment, indexing, new personal claims, contact/likeness permissions or development account cleanup.

## Audit and implementation checklist

The starting working tree was clean at `0cbc456` (`Redesigned the whole thing`). The existing architecture, source/tests, public DTO, Prisma fields, publication conditions and six actual reference images were inspected before editing. Normal development was stopped at the start; one `npm run dev` launcher was started after checking listeners. The representative started XAMPP MySQL. The API then returned the same published snapshot as the retained checkpoint.

| Area | Actual content / rendering condition | Result |
|---|---|---|
| Hero | Published profile; existing portrait concept with pending-approval disclosure | Preserved identity, portrait, motto, source assets and actions |
| About | Published summary only; biography is null | Added an editorial identity/location definition list and the existing CMS motto, keeping summary/biography database-driven |
| Expertise | Six published skills, each with null category and description | Preserved the sculpture/orbit; added meaningful, explicitly educational explanations, name-based icons, selected state and responsive detail panels |
| Water science | No existing section or CMS module | Added a clearly labelled educational section, with four native disclosures, a lightweight vector droplet, connected nodes and source links |
| Journey | Component exists; public experience array empty (two stored records remain unpublished) | Retained publication-safe omission; added native role/responsibility disclosures to the existing timeline |
| Projects / achievements | Components exist; public arrays empty | No fictional cards. Approved project supporting information now has a native disclosure; existing role, period, outcomes and media conditions remain |
| Technical competencies | The public Skill DTO supports name, category and description; current records are broad specialization names only | Integrated into Expertise. A separate repeated list would add no verified methods; no percentages or inferred competencies |
| Education / training | Components exist; public arrays empty (three education and three certificate records remain unpublished) | Remain omitted, with no provisional chronology/credentials exposed. Improved education note readability |
| Leadership / outlook | No separately approved public statement or responsibilities | Management remains a published specialization with general context. No invented personal outlook or quotation |
| Contact | Existing private storage form and idempotent submission | Preserved all request/state/privacy logic; refined focused form borders and field focus spacing |

Navigation is derived from public collections, with one new Water science link whenever the published profile/page is available. Empty collections still create no dead links. If the profile becomes unavailable, the entire portfolio (including educational content) is withheld through the existing unavailable state.

## Expertise and content provenance

`Skill.description` already exists in the CMS and public DTO. A nonblank published description always takes priority. Six exact, normalized name matches have general field explanations in `frontend/src/features/expertise/context.ts`; these are editorial educational copy, never seeded records, personal responsibilities or inferred methods. New/unknown skill names receive an honest missing-detail message instead of an unrelated explanation. Icons use the skill name rather than array position.

The old fallback repeated the selected name as both heading and paragraph. The paragraph now contains an explanation. Native Tab/Space/Enter buttons expose pressed state and control the detail regions. At phone widths the active explanation appears directly beneath its button; at larger widths a dedicated panel follows the orbit. Categories display only when present and distinct from the name. Nothing truncates the prose. Without JavaScript the selection controls remain disabled and native disclosure explanations are available for every supplied skill.

Educational copy does not establish that Seraphine personally performs those activities. All fallback panels state this distinction. CMS-authored descriptions can replace fallback copy using the existing edit → draft → verification/publication → rebuild process; no schema/API/seed change is necessary. A separate methods/competency or personal-outlook model would need its own content requirements and approval before any schema work.

The new section, **The Science Behind Safe Water**, presents source assessment, treatment, testing/monitoring and operational oversight as connected themes rather than a universal process sequence. It contains no plant-specific equipment, WASAC procedures, test readings or invented outcomes. Descriptions and source links were checked against [CDC treatment guidance](https://www.cdc.gov/drinking-water/about/how-water-treatment-works.html) and [WHO water safety planning](https://www.who.int/teams/environment-climate-change-and-health/water-sanitation-and-health/water-safety-and-quality/water-safety-planning) on 2026-11-24. The educational wording remains reviewable before launch; it is not client-authored biography or owner sign-off.

## Design and behavior

The existing bright ice-blue/white and navy/cyan appearances, serif editorial headings, portrait arch, ribbon assets and glass sculpture remain. No new dependencies, raster downloads, WebGL or animation libraries. The science illustration uses a small inline SVG with local unique gradient IDs. Native disclosures work with click, keyboard and touch, including without JavaScript. Multiple educational themes may stay open for comparison. A highlighted decorative node follows the last opened theme; it is not a process measurement.

Motion uses finite transform entrances/selection settling and short disclosure transitions. Reduced-motion disables animation, transitions and smooth scrolling; content never depends on a reveal. No scroll interception. Shared tokens cover both themes, including focus, form controls, detail text and selected states. Header links wrap when all synthetic public collections are present.

Actual before/after images were inspected alongside the approved public references. The added content increases page length deliberately. The artwork stays an implementation of the approved direction, not a pixel-identical mockup: the inherited portrait differs from the reference likeness; the new educational droplet is a lightweight vector; empty real collections remain absent; no fictional reference qualifications or controls were copied. Owner appearance and actual-device acceptance remain separate.

## Verification and evidence

Evidence is under ignored `.cache/public-story/`, not a backup or owner approval. No private credentials, messages, original uploads or draft text are copied into this report.

- `before/`: actual pre-edit development browser screenshots, including both themes at 1440 and 390 pixels, plus section/selection captures. Some early tall-section/full-page captures retain Chromium sticky-header capture artifacts; they are preserved rather than presented as a new baseline.
- `after/`: final real-content captures plus explicitly named `TEST-ONLY-*` browser-response fixtures for conditional collection layouts. Fixtures never write CMS/database content and are not evidence of real publication.
- `source-final.log`, `typecheck.log`, `database.log`: source, both workspace TypeScript checks and isolated real DB/auth/CMS results.
- `preservation.json`: XAMPP-aware read-only original-record/account/environment comparison, retaining the strict historical baseline and the appended message.

Final build, browser and performance outcomes are recorded below. Earlier failed attempts remain diagnostic evidence, never counted as passing runs. The initial source run correctly found two outdated assertions (all details closed, and the old section sequence); these were scoped to the mobile menu and updated for the authorized science section. Sandbox worker/browser spawn failures required reviewed execution outside the sandbox. A later concurrent test/typecheck attempt hit generated-Prisma-file contention; its frontend tests passed, and the final full source run subsequently passed sequentially. No source test was removed.

The first broad browser run finished 16/19: lazy images had not been visited before the old all-images assertion; native history timed out waiting for Add project; Firefox timed out navigating to login. All other workflows and WebKit/installed Chrome/Edge passed. The lazy-image check now visits and decodes every asset, retaining the complete-image assertion. Focused Chromium public hydration and native Back/Forward/refresh/cancel/tab-close reruns both passed 1/1 with captured-ID cleanup. The native-history focus performs a normal isolated ADMIN login before its original assertions. Initial evidence is `browser-initial.json` and `browser.log`; focused reports are named `browser-*-focused.json`. A subsequent visual-reset helper timeout is retained in `visual-reset-failed.json`; native keyboard activation then completed all 30 captures/eight axe scans. No application auth/navigation logic was changed to obtain these passes.

The attempted stop of a diagnosed owned Firefox process refused its identity check because the browser had already ended; no process was stopped. Future compatibility waits and screenshots now have finite timeouts, without relaxed assertions or modified target/fixture guards. Vite proxy reset/refused messages during deliberate isolated API restart/shutdown remain in logs.

The strengthened compiled no-JavaScript check subsequently passed 1/1, including disabled selection controls, native scientific disclosures and all specialization fallback text. Firefox public navigation/mobile/two-role compatibility also passed 1/1 in its focused rerun. Each isolated run confirmed all 13 application tables empty and released its own shared lock. This does not turn the retained 16/19 broad run into a uniform new 19/19 result.

### Executed verification ledger

| Check | Result / scope |
|---|---|
| Source regression | PASSED final sequential `npm test`: 7 offline, 26 frontend, 31 backend/API runner tests, zero failures/skips (`source-verified.log`). Two new frontend cases cover CMS-description priority/escaping versus educational fallback, and source-linked scientific text available in server HTML. |
| TypeScript | PASSED both workspaces (`typecheck-delivery.log`); frontend and backend production builds also compile their source. |
| Isolated DB/auth/CMS | PASSED 11 database + 18 auth + 14 CMS scenarios (12/19/15 test-runner totals including enclosing tests), zero failures/skips (`database.log`). Original exact-target, empty-table refusal, exclusive lock and captured-ID cleanup preserved. |
| Full browser | Diagnostic run 16/19 PASSED; the three failures and separate focused passes are explained above. Compiled real isolated publication withdrawal, role/session protections, CMS validation/network failure, actual private contact storage/idempotency, media approval/private originals, messages and Operations passed. Chromium 156.0.8078.4; WebKit 27.2; Chrome 157.0.8103.80; Edge 158.0.4370.33. Firefox 157.0 passed its focused rerun. |
| Final visual / accessibility | PASSED 30 captures (26 real published-content views, 4 clearly labelled browser-response fixture views), 8 axe scans (4 real, 4 fixture), zero violations, seven real-content widths 320–1920 and five fixture widths, both themes, keyboard selection/disclosures, mobile inline explanation, reduced motion, no page errors. `visual-final.log`, `after/results.json`. |
| Build/prerender/artifacts | PASSED normal published-data frontend prerender/backend builds and all 4 production artifact tests (`build.log`, `artifacts.log`). Public JS approximately 255.8 KB / 80.16 KB gzip plus the unchanged 0.63 KB appearance script; CSS 24.16 KB / 6.25 KB gzip. Initial JS <85 KB gzip and CSS <8 KB gzip budgets remain enforced. Private dashboard chunks remain lazy; no CMS snapshot embedded in code assets. |
| Privacy/preservation | PASSED XAMPP-aware read-only environment/account/original-record/migration comparison and source/build/protected-backup scan. Final staged/build scan is recorded with Git delivery. No development contact POST or content save was performed. |
| Performance | Measurement execution PASSED with six valid traces; mobile acceptance OPEN at 71 / LCP 2.503 s / TBT 1216 ms / CLS 0. Desktop 100 / LCP 0.541 s / TBT 0 / CLS 0. See exact provenance below. |
| Human acceptance | NOT RUN: actual Safari/iOS, hardware touch/file pickers, screen readers and native zoom. Owner wording/appearance/likeness/contact/indexing/launch review remains pending. |

Representative actual screenshots: `after/{light,dark}-1440-full.png`, `after/{light,dark}-390-full.png`, `{light,dark}-1440-{about,expertise,water-science,contact}.png`, `{light,dark}-expertise-selected.png`, `{light,dark}-390-expertise-selected.png`, and `{light,dark}-science-selected.png`. Conditional layouts: `after/TEST-ONLY-{light,dark}-{1440,390}-collections.png`. Tall section crops come from actual full-page browser pixels at scroll origin to avoid sticky-header capture overlays. Before captures remain unchanged.

### Performance provenance and remaining acceptance

All six valid native Chrome 157 traces are retained in `.cache/phase08-performance/public-story/`, with `summary.json`, `build.json` and each `mobile-{1,2,3}.json` / `desktop-{1,2,3}.json`. Build fingerprint: `b429b56efb0f82611fe32b11cd313d086cf8775f26817e8096cee98ab6661f47`. The unchanged scoring/throttling runner uses Lighthouse 13.5.0, mobile 4× simulated CPU slowdown / 150 ms RTT / 1638.4 Kbps, and the existing desktop profile. No concurrent project tests, builds or screenshot suites ran during measurement; the normal development launcher was idle. Host power, user background processes and actual-device conditions were not controlled, so this is not a matched causal comparison or field result.

| Build / profile | Score | LCP | TBT | CLS | Transfer / requests |
|---|---:|---:|---:|---:|---:|
| Phase 9 historical mobile | 99 | 1.803 s | 89 ms | 0 | 154,557 B / 6 |
| Visual delivery historical mobile | 74 | 2.150 s | 1210 ms | 0 | 269,185 B / 9 |
| Public storytelling mobile | **71** | **2.503 s** | **1216 ms** | **0** | **275,111 B / 9** |
| Public storytelling desktop | **100** | **0.541 s** | **0 ms** | **0** | **275,111 B / 9** |

Execution PASSED after two retained nonvalid attempts: an owned API-startup deadline after mobile run 2, then native `NO_NAVSTART` on desktop run 2. Resuming the same unchanged fingerprint retained every valid trace, including the slow runs. Logs are `performance.log`, `performance-resume.log`, `performance-resume-2.log`; the native failed trace is retained under the measurement label. Mobile scores 58/71/92 and TBT 2029.8/1216.3/280.5 ms are all included. Desktop scores are 100/100/100, TBT 0/11/0 ms; one desktop trace has CLS 0.000456, while the three-run median is 0. Accessibility and best practices score 100 in all six valid traces; SEO remains 66 with intentional noindex.

Compared with the previous visual delivery, transfer increases 5,926 B (2.2%) with the same request count. Mobile median LCP is 0.353 s slower and TBT approximately 6.6 ms higher. Mobile acceptance remains **OPEN**, not restored. The historical Phase 9 Chrome 156 run differs from today's native Chrome 157; no earlier optimized score is substituted for this build.

Initial trace investigation is saved in `.cache/public-story/performance-analysis.json`, including main-thread categories, longest tasks, script attribution and benchmark indices for all three historical/current mobile sets. Current CPU benchmark indices 263/711/724 differ substantially from the visual delivery's 689/1217.5/522 and Phase 9's 659.5/812/784. In current mobile run 2, Style & Layout accounts for about 2720 ms of main-thread work, versus about 768 ms script evaluation and 9.6 ms script parsing/compilation. Layout and long document/script tasks warrant controlled follow-up; these aggregates do not isolate a root cause or justify dismissing the result as environment noise. Repeat matched-build trace analysis and actual-device testing remain required before claiming performance restoration. No field INP/p75 claim.

## Preservation and acceptance limits

No backend behavior, schema/migration, environment, JWT, seed, stored content, publication state, temporary account identity or dependency lockfile changed. The read-only comparison confirms every original non-message table and full migration ledger match the saved baseline. The original message is unchanged and the existing appended message remains. The original strict whole-table status command still refuses its historical message fingerprint; it is unchanged. No account cleanup, reset, deployment, push, archive or Phase 10 work.

Owner review remains required for biography, dates/credentials, genuine projects/outcomes, specific methods/competencies, personal outlook, educational wording, portrait likeness/public use, contact disclosure, indexing and launch. Actual Safari/iOS, hardware touch, screen readers and real browser zoom remain manual acceptance. Automated axe/viewport checks do not establish complete WCAG conformance. Local Lighthouse measurements do not establish field INP/p75 performance.

## Git delivery

The initial tree was clean at `0cbc456`. This local extension contains 26 reviewed source/test/documentation files. `git diff --check`, XAMPP-aware source/build secret comparison, protected backup/environment hashes and final published revision comparison passed. Staged bytes are checked separately before the local commit; reports stay under `.cache/public-story/privacy-{source,staged}.json`. The actual commit identity and final working-tree state are in the delivery message. No new phase tag, remote push, deployment, ZIP or account cleanup. All screenshots, traces, generated distributions, private state and backups remain outside the commit.
