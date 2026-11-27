# Final UX improvements and protected complete-portfolio review — 2026-11-27

This authorized local continuation follows [the visual transformation](VISUAL_TRANSFORMATION.md), [public storytelling](PUBLIC_STORYTELLING.md), [performance investigation](PERFORMANCE_OPTIMIZATION.md) and [final public corrections](FINAL_PORTFOLIO_REVIEW.md). Historical reports remain unchanged. Phase 9 owner/launch approval is pending; Phase 10 is not started. No push, deployment, indexing, ZIP, schema/environment change or development-account cleanup is authorized by this work.

## A. Initial audit

Started on clean `main` at `b8cff61` (`Complete public portfolio content and visual corrections`), with no staged, unstaged or untracked files. Read current repository instructions, memory, architecture, CMS/publication/authentication documentation and actual source/tests. Opened all six actual PNG references in `docs/visual approval final/` (01 public light, 02 public dark, 03/04 Studio light/dark, 05/06 Operations dark/light). The concept imagery is visual authority, not evidence of professional facts.

Installed baseline: Node 24.11.1, React/React DOM 19.3.1, Vite 7.3.7, TypeScript 5.9.3, Express 5.3.0 and Prisma CLI/Client/MariaDB adapter 7.10.1. No dependency/lockfile changes. XAMPP 3306 was reachable. The app ports were closed, so one normal development launcher was started and reused. Port 13312 was untouched.

| Section | Existing frontend / CMS and stored state | Required change |
| --- | --- | --- |
| Journey | Experience component; 2 stored drafts, no public rows | Retain CMS timeline, exclusive native role disclosures; show labeled isolated examples privately |
| Projects | Working public component and full Projects CMS; no stored rows | Editorial alternating image/text layout, optional text-led contributions, native supporting detail; three private examples |
| Technical competencies | Skills CMS; 6 published broad areas with blank descriptions/categories | Distinct grouped presentation opted into by explicit categories, no inferred methods or percentages |
| Education | Component and CMS; 3 stored drafts, no public rows | Reuse qualification/institution/date/notes presentation; private examples |
| Certifications | Active HomePage rendering and CMS; 3 stored drafts, no public rows | Reuse issuer/date/description/approved media presentation; private examples |
| Achievements | Active public rendering and CMS; no stored rows | Reuse milestone presentation and optional approved related project; private example |
| Leadership/outlook | No dedicated public presentation or approved statement | Existing Skills name/description/category supplies an explicit statement section; private illustrative statement |

The missing public sections were principally missing approved content, not broken publication conditions. Existing statuses were not changed. Public collections remain empty and intentionally absent; all original records remain intact.

## B. Inline Expertise

Each card is one native `<details>` with its own `<summary>` trigger and labeled content region. A shared native `name` makes disclosures exclusive; initial state is all collapsed. Selecting an open card closes it. Enter/Space, pointer and touch use native activation and native expanded-state exposure. Stable generated IDs connect each trigger and region. There is no detached panel, duplicate fallback, selection scroll call or focus replacement. All explanations are present in prerendered HTML and work without JavaScript.

Desktop grid reserves the middle column for the exact existing sculpture and places cards on either side. Expanded text increases its own row height without crossing another card or the sculpture. Tablet places the sculpture above two columns; phones use one column. CSS animates native content height where supported and provides immediate native expansion elsewhere. Finite content entrance and all transitions honor reduced motion. Natural layout reflow remains possible.

Published CMS descriptions remain authoritative, including complete prose and the first-sentence summary. Missing descriptions use the existing explicitly educational resolver and individual-duty disclaimer. Categories display only when supplied; no personal competencies are inferred from educational definitions.

## C. Removed public elements

Removed the rendered review banner, portrait-approval overlay and complete WHO/CDC evidence row, with their dedicated styles. Kept a zero-height `#top` anchor for the existing brand/back-to-top links. The header now begins at the page top without a reserved strip. Hero portrait assets and composition remain; the accessible concept-image description still conveys provenance. Educational science disclosures remain usable.

This presentation change grants no likeness, contact, indexing or launch consent. The approval register, administrative review workflow, intentional noindex, unapproved-media filtering and public duration hold remain intact. Scientific source provenance remains in PUBLIC_STORYTELLING.md.

## D. Complete portfolio and private demonstration

The target narrative is Hero → About → Expertise → Water science → Journey → Projects → Technical competencies → Education → Certifications → Achievements → Leadership/outlook → Contact → Footer. Each optional real-content section and navigation destination is conditional. More than seven navigation destinations use the native responsive Menu at every width rather than crowding the header; active-section feedback and focus behavior remain.

The workspace navigation exposes **Complete portfolio demo** at `/admin/design-preview` and `/super-admin/design-preview`. These use neutral private shells and existing role routing. The protected `GET /api/v1/cms/design-preview` runs after existing no-store, current-account/session authentication, mandatory-password and rate safeguards. It has no mutation or publication action. Fixtures live only in a backend module and are never inserted, verified, published, bundled or prerendered. The response combines the existing published profile/broad expertise with labeled fictional collection examples. All fictional titles/entries identify their sample status, and a prominent private notice explains the distinction.

Three project scenarios demonstrate image-led, alternating and text-led layouts. The image is the existing abstract water ribbon, explicitly described as illustrative and not a facility photograph. No external image, employer assignment, degree, credential number, real award or numerical outcome was fabricated. Synthetic dates are labeled fictional. Message sending is disabled in the demonstration. Session revalidation runs on interval/focus/pageshow; authentication failure withdraws the preview. Appearance uses the originating workspace preference, preserving separate public/Studio/Operations themes.

Vite denies the backend directory from direct file serving as well as existing private/secret paths. Compiled serving exposes only normal web assets and neutral private route shells. Public content APIs, JSON snapshots, metadata, robots output and JavaScript/CSS assets must contain none of the fictional record payload.

## E. CMS field mapping and limits

| Presentation | Existing ADMIN editing fields | Limits / owner approval |
| --- | --- | --- |
| Hero/About | Profile introduction, biography, title, location, motto and separately approved portrait/contact | Duration remains withheld publicly. Likeness, biography/contact and launch consent still required |
| Expertise | Skills name, description, ordinary category, display order, verification | CMS descriptions replace educational context after normal review/publication |
| Journey | Experience position, organization, start/end years, current flag, description, responsibilities | No experience media field; no invented chronology. CMS supports years rather than month dates |
| Projects | Title, immutable slug, summary, body, role, organization, year/start/end, outcomes, feature/order; Media library attaches approved images | Verify real assignment, role, dates, results and each image; never publish the samples |
| Competencies | Skills name/description; category `Technical / <group name>` | Exact opt-in prefix; no proficiency percentages. Empty group uses “Technical practice” |
| Education | Qualification, institution, country, completion year, notes | No education media field. Official credential details need verification |
| Certifications | Title, issuer, year, credential details, approved media | No invented verification links/numbers; documents still use existing approval/private-original rules |
| Achievements | Title, description, year, related project | No direct achievement media field; evidence can be described or related to an approved project |
| Leadership/outlook | Skills category exactly `Professional outlook`; name = heading, description = approved text, order/verification | Blank statements stay omitted. Explicit category avoids parsing biography or inventing a new model |

Skills editor includes these category instructions. Existing draft → review → verification/publication → public HTML rebuild workflow remains. The sample preview is an immutable layout demonstration, not a new draft editor or persistent CMS dataset. Replace examples by entering authentic records in the corresponding CMS modules, not by publishing the sample fixture. Media/settings editors remain unchanged. No schema migration is required for these supported fields; new media relationships or richer dates need separately reviewed scope.

## F. Visual evidence and reference comparison

Actual fresh screenshots are ignored QA evidence under `.cache/ux-improvements/`, not database backups or owner approval. `before/` contains 20 actual pre-change public captures (both themes, 390/1440, full page/hero/Expertise/science/contact). Public delivery evidence is in `after-compiled-public/` (compiled, freshness-gated server on 4496). Private delivery evidence is in `after-compiled-private/` (the normal authenticated development site on 5173 using the same source presentations); this is not a production-authentication acceptance claim. Each folder has a scope-labeled `results.json`. Public names include `{light,dark}-{390,1440}-{public-full,hero,water-science,contact,expertise-collapsed,expertise-expanded,expertise-switched}.png` and `nojs-390-expertise.png`. Private names include `{light,dark}-{390,1440}-private-{full,experience,projects,competencies,education,training,achievements,outlook}.png`.

Preserved reference characteristics: exact portrait/sculpture/ribbon bytes, white/ice-blue and navy/cyan palettes, serif identity, broad water composition, spacious sections and independent workspace themes. Expertise necessarily changes vertical rhythm to accommodate complete inline explanations. Projects/competencies/outlook extend the existing tokens and editorial styling; they are not copied factual content from the concepts. Abstract project illustrations remain stylized rather than plant photography. Current actual public content is shorter than the protected full demonstration. No pixel-perfect or owner-approved fidelity claim is made.

The private review first passed 32 captures/five zero-violation axe scans and both roles. Visual inspection identified a wrapped certification ordinal and repeated competency icons; a small nowrap/fixed-width label and category-appropriate decorative icons were applied, followed by passing frontend tests/build/artifacts and fresh delivery captures. Public and private imagery was opened alongside the approved references; this includes journey/projects/competencies/education/training/recognition/outlook, the hero and inline Expertise.

## G. Comparable performance

Fresh labels `ux-before` / `ux-after` preserve historical reports. The existing runner retains all valid reports, raw traces/DevTools logs and per-build fingerprints. Each set uses three mobile and three desktop runs on the same Lighthouse/native Chrome/settings, serially with no concurrent build, screenshot or test suite. Host power/background load and physical devices remain uncontrolled; TBT is not field INP. The final comparison is `.cache/ux-improvements/comparison.json`, `complete: true`, `settingsMatch: true`. All twelve valid reports are included. Lighthouse 13.5.0; Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/158.0.0.0 Safari/537.36. Mobile uses the unchanged simulated 4? CPU / 150 ms RTT / 1638.4 Kbps, 412?823 at scale 1.75; desktop retains the existing desktop profile.

| Three-run median | Fresh before | Delivery after |
| --- | ---: | ---: |
| Mobile score | 97 | 99 |
| Mobile LCP | 2.127 s | 2.057 s |
| Mobile TBT | 141 ms | 54 ms |
| Mobile CLS | 0 | 0 |
| Desktop score | 100 | 100 |
| Desktop LCP | 0.646 s | 0.520 s |
| Desktop TBT | 6.5 ms | 0 ms |
| Desktop CLS | 0 | 0 |
| JavaScript transfer including headers | 84,480 B | 84,779 B |
| Total transfer / requests | 276,378 B / 9 | 276,730 B / 9 |

All final mobile scores are 99; all final desktop scores are 100. All final runs have zero CLS and accessibility/best-practices scores 100; SEO remains 66 with intentional noindex. Transfer increases 352 B (0.13%), with the same nine requests. No significant lab regression was observed. Timing differences cannot be attributed causally to this UI change because host background/power conditions are not controlled. No field INP, real-device p75 or production-readiness claim.

One mobile-2 and one desktop-1 attempt failed `NO_NAVSTART`. Their raw JSON/trace/DevTools evidence is retained with explicit `failed-attempt1` copies. Resuming preserved every valid run and the exact build fingerprint; invalid captures are excluded from medians. Logs: `.cache/ux-performance-before.log`, `ux-performance-after.log`, `ux-performance-after-resume.log`, `ux-performance-after-desktop-resume.log`, `ux-performance-comparison.log`. Raw reports/fingerprints: `.cache/phase08-performance/{ux-before,ux-after}/`.

Before fingerprint: `e31bbb404d82bb9076b0932e4d6350668a4cca54459613e27229c1e63aba9984`. After fingerprint: `77cccc12ce15911371a5f5e8419a50827a2316f3bc983c758e84081ffa87c557`.

## H. Verification ledger

The first broad browser run passed 13 scenarios and recorded five failures: an incorrect single-skill no-JS assertion, a five-second dirty-navigation heading timeout, a Firefox public check/context shutdown failure and two shutdown/harness failures. Firefox diagnostics remained in its public phase; WebKit/Chrome/Edge were not reached. All 13 isolated tables were cleaned and the lock released. The single-skill expectation is corrected; route heading waits now use an explicit bounded 15 seconds. Focused/native delivery evidence remains distinct from this failed broad run. Restricted Chromium/Vite worker launch attempts failed `spawn EPERM`; reviewed outside-sandbox execution is used for these existing tools. An initial DB run collided with an active production build and correctly refused `public-build.lock`; the guard was preserved and the suites rerun serially. A subsequent expanded CMS test exceeded the legacy global HTTP budget (the original successful CMS path uses 119/120 requests). The new preview checks now run in their own initially-empty, guarded process; rate limits remain unchanged. An initial private browser attempt coincided with Prisma generation restarting the development API; the diagnostic login check subsequently displayed the normal form. A public refresh assertion initially exceeded its five-second matcher deadline; the delivery review uses request-idle and explicit bounded waits. Native accessibility checking initially used Playwright?s ARIA snapshot, which omits Chromium?s native grouped disclosure role; a second exact-role assertion also rejected the Grouped variant. Actual CDP evidence in `.cache/ux-native-ax-actual.log` shows `DisclosureTriangleGrouped`, focusable/expanded true and the correct controlled panel. The final assertion checks Chromium?s real accessibility node and accepts native grouped/ungrouped roles without modifying application semantics. Earlier assertion results/logs are retained. Final reflow testing then caught a real CSS cleanup error: removal of the old grid rule had also removed `display: grid`, leaving desktop cards outside the reserved-column layout. The declaration was restored and the production artifacts/visual review rerun; the failed result is retained as `compiled-reflow-initial-results.json`. A normal development API watcher had stopped responding after tooling; touching its existing server entry reran that same watcher and restored HTTP 200, without another launcher or file-byte/environment change.

| Check | Final result / evidence |
| --- | --- |
| Source tests | PASSED: 7 offline + 28 frontend + 31 backend runner tests; zero failures/skips. `.cache/ux-source-final.log` |
| TypeScript and builds | PASSED both workspace typechecks and complete public/prerender/backend builds. `.cache/ux-{typecheck,build}-final.log`; delivery frontend/prerender build `.cache/ux-build-front-delivery.log` and 28 frontend tests `.cache/ux-frontend-delivery.log` also pass after final polish |
| Production artifacts | PASSED 4/4 (including the subsequent delivery frontend rebuild); neutral preview shells, no fictional payload in public assets, intentional noindex and budget checks. `.cache/ux-artifacts-front-delivery.log` |
| Isolated DB/auth/CMS/preview | PASSED 11 + 18 + 14 + 4 scenarios; complete cleanup. `.cache/ux-database-final.log` |
| Broad browser | FAILED: 13 scenario passes, 5 scenario/harness/shutdown failures; Firefox stopped in public phase; later engines not reached. Cleanup PASSED. `.cache/ux-browser-broad.log`, `.cache/ux-improvements/browser-broad-initial.json` |
| Focused browser corrections | PASSED 2/2 (native no-JS and full native dirty navigation); remaining cases explicitly NOT RUN. All test tables empty and lock released. `.cache/ux-browser-focused.log`, `.cache/ux-improvements/browser-focused.json` |
| Compiled public review | PASSED: 29 captures, eight axe scans with zero violations; 320/375/390/768/1024/1440/1920, light/dark, all six keyboard/touch cards, actual native expanded-state tree, long descriptions, focus/viewport retention, no scripted scrolling, authored refresh/failure/recovery, no-JS content/science/contact and no unwanted elements. `.cache/ux-review-public-final.log`, `after-compiled-public/results.json` |
| Authenticated private review | PASSED delivery: 32 captures/five axe scans, zero violations; all seven professional areas in both themes and 390/1440 captures, seven-width reflow, both-role normal login/private API/direct-route guards, no-store/noindex, disabled sending, reduced motion, full menu, session withdrawal and source-serving denial. `.cache/ux-review-private-polished.log`, `after-compiled-private/results.json`. Combined manifest: `.cache/ux-improvements/visual-manifest.json` (61 captures/13 scans, zero page errors) |
| Performance | PASSED matched complete six-run before and six-run after sets; mobile 99/2.057 s/54 ms/0 and desktop 100/0.520 s/0 ms/0. Two invalid native captures retained. `.cache/ux-improvements/comparison.json` |
| Device/assistive/owner acceptance | NOT RUN; pending manual work described below |

The first full compiled public review reached all public/touch/reflow/refresh checks with eight zero-violation axe scans, then a new no-JS science assertion incorrectly assumed the first disclosure started closed. It actually starts open; the corrected assertion opens another disclosure and checks that record directly. Public/private review modes now report their scopes separately. An initial private capture then stalled on off-screen lazy `img.decode()`. Only the headless browser whose parent was that exact review process was closed; no application/browser process belonging to another task was stopped. Image loading now scrolls each image into view and uses a 15-second decode deadline. These QA issues and the earlier real CSS correction are retained as distinct evidence.

## I. Security and data integrity

The XAMPP-aware read-only preservation comparison checks the authorized environment, full migrations, original non-message content and temporary account identities/readiness. It separately confirms the original message and retained appended message; the old whole-table strict status guard still differs and is not weakened. No development content, message, media, user identity, migration, schema, environment or backup mutation is part of this implementation. Isolated final DB execution passed 11 database, 18 authentication, 14 CMS and four dedicated preview scenarios (runner totals including parents: 12/19/15/5), with no failures or skips. The preview suite compares every stored row before/after reads and verifies both roles plus guest/forged/temporary-password boundaries. Normal authenticated QA can append session/audit activity. Isolated suites retain exact instance/target guards, initially-empty refusal, exclusive test lock and captured-ID cleanup. Final read-only comparison PASSED (`.cache/ux-preservation-final.log`, `.cache/ux-improvements/preservation.json`): exact authorized environment, original non-message rows and complete migration ledger; original message intact and appended message retained (two total); original temporary account identities/readiness and ignored owner/SYSTEM-only credentials remain. The old whole-table message fingerprint remains intentionally different. Source/history/build privacy PASSED (`.cache/ux-privacy-final.log`): 265 source files, 646 reachable history blobs, 45 public build files, local DB/JWT and current temporary-password comparisons, all protected backup/schema/environment hashes. No raw historical guard was weakened or rewritten.

## J. Git and completion

Local work only. Source/privacy and protected-hash review passed; exact staged-byte privacy review PASSED for 43 files and 45 public build files, with protected hashes unchanged (`.cache/ux-privacy-staged.log`, `.cache/ux-privacy-staged.json`). Final local checks confirm private credentials return HTTP 403, both normal health endpoints return 200, owned review ports 4408/4496/5178 are closed and both test/build locks are absent (`.cache/ux-improvements/final-local-state.json`). No new phase-completion tag is appropriate for this bounded extension with owner acceptance open. Final commit/branch/working-tree state is recorded in `.cache/ux-improvements/git-delivery.json` and reported at handoff; no push/deployment/indexing/ZIP/account cleanup.

## K. Owner review steps

1. Keep XAMPP MySQL running on 3306. Reuse the normal launcher at `http://localhost:5173`; if stopped, run `npm run dev` once from the repository.
2. Open the public page in both appearances. Expand each Expertise card on desktop and mobile, switch cards, close the active card and try Tab/Enter/Space. Each full description stays inside its own card and the sculpture remains visible.
3. Check the clean header/portrait and Science ending: the three requested public elements are absent. Actual unapproved collections remain absent by design.
4. Open `http://localhost:5173/login`, sign in with the existing authorized temporary credentials, and choose **Complete portfolio demo**. Direct ADMIN route: `http://localhost:5173/admin/design-preview`; technical role uses `/super-admin/design-preview`. Do not post credentials into chat.
5. Inspect the prominently labeled fictional journey, three projects, grouped competencies, qualifications, training, recognition and professional outlook in both themes and at phone/tablet/desktop widths. Open project/timeline/competency details and Menu. Sending messages is disabled in this preview.
6. Return to Studio. Enter verified real information in the mapped CMS modules, save drafts, review and obtain the existing content/media/contact approvals, verify/publish and rebuild public HTML using the established workflow. The protected samples are not records to publish and will never automatically become public content.

Physical iOS/Safari/touch/keyboard, screen-reader reading, native browser zoom and owner content/visual/likeness/contact/indexing/launch acceptance remain separate manual work; automated axe/reflow cannot certify complete WCAG or actual-device behavior.
