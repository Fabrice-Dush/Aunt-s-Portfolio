# Final portfolio corrections and visual review — 2026-11-26

Local continuation of Phase 9. Read after [visual transformation](VISUAL_TRANSFORMATION.md), [public storytelling](PUBLIC_STORYTELLING.md) and [performance investigation](PERFORMANCE_OPTIMIZATION.md). Those historical reports and their results remain intact. Owner acceptance and production readiness are not implied. Phase 10, deployment, indexing, push, ZIP and development account cleanup remain unauthorized.

## Starting state and audit

The working tree was clean on `main` at `555be96` (`Avoid redundant public refresh renders and verify performance QA`). The referenced `3894b44` is its predecessor, not the current baseline. All six actual images in `docs/visual approval final/` were opened before visual edits: public light/dark, Studio light/dark, Operations dark/light. Current source, publication conditions, tests, approval register and retained screenshots/performance reports were inspected. XAMPP 3306 was already reachable. No application server was reachable, so one normal `npm run dev` launcher was started; it remains available at `http://localhost:5173`.

The actual published DTO contained one profile and six specializations with blank descriptions/categories. Biography, approved portrait and public contacts were absent. All five other public collections were empty. The profile's experience description still contained the pending questionnaire duration. Existing components, rather than the concept images or the unused Training component alone, determine whether a section is implemented.

| Area | Actual finding | Disposition |
|---|---|---|
| Expertise | Meaningful detail already existed, but every card used a generic interaction placeholder | Corrected short summaries and integrated detail panel; preserved sculpture and selection |
| Science | Four educational native disclosures existed; visual had relatively flat shading and weak stage association | Refined existing vector, connectors, active stage framing and matching visual caption |
| About | Short real summary followed oversized/repeated identity presentation | Rebalanced headline/body; promoted CMS summary and grouped existing role/location |
| Duration | Owner register pending, yet rendered publicly and included in public snapshots | Withheld public field and overview; preserved private CMS record |
| Journey | Component exists; two stored draft roles, no public records | Correctly omitted, including navigation |
| Education / certificates | Components/render paths exist; three draft records each, no public records | Correctly omitted; no fictional qualifications |
| Projects / achievements | Implemented; no records/public items | Correctly omitted |
| Competencies / outlook | Six broad published areas; no separate verified methods or approved personal statement | Integrated expertise; no invented percentages, methods or outlook |
| Hero / contact / footer | Working implementation; portrait and privacy behavior already present | Local framing, spacing, field and footer refinements only |

## Corrections and provenance

Expertise uses one information resolver. A nonblank published `Skill.description` supplies the complete explanation and its first complete sentence supplies the card summary (or the full description when there is no sentence boundary). No CSS clipping, invented supporting competencies or database seeding. A published category remains visible only when present and distinct. Exact normalized established names receive these **educational** summaries when no authored description exists:

| Published name | Educational card summary |
|---|---|
| Water treatment | Treatment barriers that address source-water risks. |
| Water quality | Understanding microbial, chemical and physical water characteristics. |
| Microbiology | Microorganisms, indicators and contamination risks in drinking water. |
| Production | Coordinating water production with quality and continuity in view. |
| Laboratory operations | Reliable information through careful sampling, analysis and quality checks. |
| Management | Connecting people, planning and review for coordinated decisions. |

These shorten the existing general explanations in `frontend/src/features/expertise/context.ts`; they are not Seraphine's verified duties. Each fallback card says “Educational context,” and the full explanation explicitly disclaims personal duties/achievements. The inherited full explanations and scientific source provenance remain documented in PUBLIC_STORYTELLING.md. Unknown names receive an honest missing-detail explanation, not an inferred specialty. Own-property lookups prevent names such as `constructor` from resolving inherited object members. CMS descriptions remain the primary source and replace educational text without a schema change.

The desktop orbit retains the exact sculpture bytes, adjusts card spacing for readable summaries and uses a bordered glass detail panel with the selected icon/title. Phone selection places the full explanation immediately below the active card. Buttons retain native keyboard activation, pressed state, live detail announcements and focus. No-JavaScript selection stays disabled while all explanations remain available through native disclosures.

Science retains its original four educational themes and unchanged explanations/WHO/CDC links. Layered vector gradients, restrained reflections, orbit/ripple paths and connectors add depth without filters, new image downloads, canvas or a library. The last opened theme highlights its node/connector and stage border; a matching caption ties the illustration to the explanation. Closing the active disclosure clears selection. Multiple disclosures may remain open for comparison. Native controls and all text work without JavaScript; the decorative visual's changing emphasis is an enhancement, not essential information or a facility process claim. Existing finite motion and reduced-motion rules remain.

About uses only the published summary, biography if present, title, location and motto. Existing water art supplies a supporting accent. An initial screenshot exposed internal horizontal scrolling when the lazy decorative ribbon was visited; `overflow: clip` now clips decoration without making the section scrollable. The browser review explicitly checks that About content never acquires horizontal scroll. Initial failed visual output remains in `after-dev/`.

The pending duration is withheld at the explicit public service projection (`experienceDescription: null`) as well as the homepage. It is not selected from storage for public responses, so API snapshots, prerender JSON and HTML cannot expose it. Private CMS fields, stored bytes and approval-register wording remain unchanged. No per-field approval schema exists; reintroducing duration requires an explicit owner/content decision and reviewed implementation. This is the only backend implementation change; auth/RBAC, collection verification/publication, contact/media consent and freshness rules remain intact.

Hero keeps its exact portrait assets, reserved proportions, priority loading, large identity, title, motto, actions and concept-approval disclosure; the outer glass frame is more closely aligned with the arch. Contact removes a redundant introductory row, aligns the real privacy notice with the form, refines controls and retains all timing, CSRF, UUID idempotency, validation, synchronous submission, failure-value and private-storage behavior. Footer now uses the existing CMS motto. No outgoing email or transport-encryption claim was added.

## Visual evidence and remaining differences

Actual screenshots were opened and inspected alongside all approved images. Evidence stays ignored under `.cache/final-completion/`; it is QA evidence, not a backup or owner approval.

- `before/`: 34 fresh development captures and eight axe scans before visual edits. Includes four clearly named `TEST-ONLY-*` response-fixture captures; those are not actual published client content.
- `after-dev/`: initial development review, retained including the discovered About clipping issue.
- `after-compiled-initial/`: first compiled verification, before the final scientific caption and public-field withholding.
- `after/`: 34 delivery compiled captures/results and revision-refresh diagnostic, plus two 768-pixel tablet captures in `tablet-results.json`. Simulated touch selects all six specializations and all four science themes in both appearances.
- `dashboards/`: existing temporary ADMIN/SUPER_ADMIN overview captures in both themes; no protected content save, publication, contact submission or account cleanup.

Representative paired filenames in `before/` and `after/`: `{light,dark}-1440-full.png`, `{light,dark}-390-full.png`, `{light,dark}-1440-hero.png`, `{light,dark}-1440-{about,expertise,water-science,contact}.png`, `{light,dark}-expertise-selected.png`, `{light,dark}-390-expertise-selected.png`, and `{light,dark}-science-selected.png`. Tablet/reflow checks include 768/1024; all real widths are 320/375/390/768/1024/1440/1920. Conditional collection screenshots are labelled browser-response fixtures, with no database writes or publication acceptance implied.

| Expected reference characteristic | Original discrepancy / cause | Correction and assessed result |
|---|---|---|
| Understandable cards around glass centerpiece | Interaction-status filler replaced content summaries | All six cards now communicate field meaning; sculpture/orbit preserved |
| Integrated selected content | Thin, detached detail row | Glass panel, associated icon/title, mobile inline explanation |
| Balanced About narrative | Large heading outweighed short approved summary; pending duration added an internal note | Smaller headline, stronger summary, grouped facts/accent; unapproved duration withheld |
| Sophisticated educational water visual | Simple gradient and weak stage association | Layered depth, connected active node, selected stage/caption; vector interpretation remains |
| Balanced contact and coherent ending | Detached introductory row and repeated topic copy | Form/privacy columns align, location/back-to-top follow, CMS motto closes footer |
| Portrait-led hero | Outer halo tilted farther than the portrait arch | Refined frame alignment; exact portrait and disclosures retained |

This is closer in readable card content, editorial balance and glass/selection treatment, **not pixel-identical concept art**. The retained SVG ribbons remain more stylized than the photorealistic reference water. The inherited portrait likeness differs and still requires approval. Real summary/biography length and absent approved collections affect composition/page length. Science is an added educational section, without a direct six-image reference counterpart. The private-review banner and consent/educational disclosures remain intentionally visible.

### Dashboard discrepancies retained for separate review

All four actual overview appearances were inspected against references 03–06. Studio retains navy navigation, editorial welcome/workflow, real publication states, inventory and owner guidance. It uses a publication inventory rather than the concept's simultaneous row editor and recent-message layout, and it is taller. Operations retains the technical hero, actual regular-admin table, audit activity and supported controls. It is longer, includes shared portfolio panels and has simpler shield/water art than the concept. Fictional counts/roles/IPs, live-monitoring claims, unsupported sessions table/global search and concept-only controls were not added. No localized shared-style regression was observed from this public work. Larger dashboard composition changes are documented for review, not silently performed under a public-page correction task.

## Verification ledger

Delivery outcomes follow. Initial sandbox `spawn EPERM` attempts remain logged and are not counted as application failures or passing tests. Reviewed execution outside the sandbox was used for existing browser/worker runners. Test fixtures use the existing exact isolated schema/instance checks, initially-empty refusal, exclusive lock and captured-ID cleanup; no protected development reset or fixture write.

<!-- delivery-results -->
| Check | Result / exact scope |
|---|---|
| Source regression | PASSED final `npm test`: 7 offline, 27 frontend, 31 backend/API runner tests, no failures/skips (`completion-source-verified.log`). Earlier public-profile unit expectation failed on the deliberately added null field; it now asserts both null output and exclusion from the select. No privacy assertion was removed. |
| TypeScript / build | PASSED both final workspace typechecks and production frontend/prerender/backend builds (`completion-typecheck-verified.log`, `completion-build-verified.log`). Public JS 257.57 KB / 80.78 KB gzip; CSS 25.92 KB / 6.59 KB gzip; unchanged 627-byte appearance script. Existing <85 KB JS / <8 KB CSS gzip budgets remain. |
| Production artifacts | PASSED all four final artifact tests (`completion-artifacts-delivery.log`). Public HTML/JSON does not contain the pending duration; neutral private shells and lazy dashboard chunks remain. |
| Isolated real DB/auth/CMS | PASSED 11 + 18 + 14 scenarios, runner totals 12/19/15 including parents, no failures/skips (`completion-database-verified.log`). Real public API returns null duration while stored CMS value remains; exact target/instance, lock, initially-empty refusal and captured-ID cleanup retained. |
| Compiled public appearance/accessibility | PASSED 34 main captures plus two tablet captures; eight axe scans, zero violations; seven widths, both appearances, all specializations with keyboard and all science themes with simulated touch, selected details, valid anchors, no page errors and reduced motion. Thirty-two actual-content views and four labelled browser-response fixture views. `completion-compiled-delivery.log`, `completion-tablet.log`, `after/{results,tablet-results}.json`. |
| Native no-JavaScript | PASSED compiled HTML content/navigation, disabled skill controls with all fallback disclosures, native science activation and disabled contact submission. This is compiled serving, not the Vite development shell. |
| Revision refresh | PASSED observer constructions remain 2/2/2 after three identical focus refreshes; changed authored description, 503 withdrawal and same-publication recovery pass (`after/refresh.json`). No development content write. |
| Dashboard smoke review | PASSED existing temporary ADMIN/SUPER_ADMIN overview login, both themes, persistence before first frame/reload, seven widths, reduced motion, logout, 16 screenshots and four axe scans with zero violations (`completion-studio.log`, `completion-operations.log`, `dashboards/results-*.json`). Normal auth audit events appended; no content save/account cleanup. |
| Full browser run | **FAILED teardown**: all 19 application scenario groups PASSED, then the Edge browser shutdown exceeded its 10-second deadline. Report totals 19 passed / 1 failed / 0 blocked engines, not a clean broad pass. Fixture cleanup PASSED with all 13 tables empty and lock released. Fifty-six screenshots/eight axe scans, zero violations. Failure retained in `completion-browser.log` and `browser-broad.json`; no test was reclassified or rerun to erase it. A subsequent automation-process inventory found no leftover matching browser; no unrelated process was stopped. |
| Development preservation | PASSED XAMPP-aware read-only comparison: exact current environment, original non-message content, complete two-row migration ledger and temporary account identities/readiness unchanged; original message intact and appended message retained (two messages total). Credential directory remains owner/SYSTEM-only and ignored. `completion-preservation-delivery.log`, `preservation.json`. The old whole-table message fingerprint still differs; its strict status guard is unchanged, not weakened or rerun for a false pass. |
| Source/history/build privacy | PASSED XAMPP-aware scan of 257 source files, 614 reachable history blobs, 43 public files and protected backup hashes (`completion-privacy-current.log`). The raw historical `verify-phase08-privacy.py --history` **FAILED** on its pre-XAMPP environment hash, after source/history/build scanning; its script and baseline remain unchanged. Separate ignored `completion-privacy.py` compares only the environment against the authorized development checkpoint's exact hash and retains all other protected-hash assertions. No environment rewrite or guard weakening. Final staged scan recorded with Git delivery. |
| Human/owner/device | NOT RUN / pending as listed below. |

Browser versions: Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2, installed Chrome 158.0.8127.37 and Edge 158.0.4370.33. Nineteen scenario passes cover real isolated publication withdrawal/rebuild, contact storage/idempotency/privacy, auth/session expiry and role boundaries, CMS validation/network failure, native history/dirty prompts, media/private originals, messages, Operations and account workflows. Edge's final shutdown failure is a harness limitation with unproven precise cause; application scenario passes do not convert it to uniform broad acceptance.

<!-- performance-results -->
Performance execution PASSED with a complete new matched six-run baseline and six-run final set. `performance-comparison.json` confirms identical Lighthouse version, browser user agent and complete config settings, with `complete: true`. Each label is fingerprint-guarded; every valid report is included.

Lighthouse 13.5.0, HeadlessChrome 158.0.0.0; mobile simulated 4× CPU / 150 ms RTT / 1638.4 Kbps, 412×823 at scale 1.75; unchanged desktop profile. Before fingerprint `fdef51dc52f78f008da4b018e38e9e646ca69e51c313acb0d9cda5a27ddf38b2`; after `e31bbb404d82bb9076b0932e4d6350668a4cca54459613e27229c1e63aba9984`.

| Three-run median | Completion before | Completion after |
|---|---:|---:|
| Mobile Lighthouse | 84 | 98 |
| Mobile LCP | 2.172 s | 2.034 s |
| Mobile TBT | 548.9 ms | 78 ms |
| Mobile CLS | 0 | 0 |
| Desktop Lighthouse | 100 | 100 |
| Desktop LCP | 0.653 s | 0.559 s |
| Desktop TBT | 41.5 ms | 0 ms |
| Desktop CLS | 0.000456 | 0 |
| JS transfer including headers | 83,878 B | 84,480 B |
| Total transfer / requests | 275,169 B / 9 | 276,378 B / 9 |

Final mobile scores are 90/98/99, TBT 372.525/78/4 ms; desktop scores are 100/100/100, TBT 0/0/2.5 ms. All six final reports have zero CLS and accessibility/best-practices scores 100; SEO stays 66 with intentional noindex. Startup has no observed significant regression against this matched baseline; transfer rises 1,209 B (0.44%), with unchanged request count. Public JS transfer increases 602 B. Strong lab LCP/CLS and median TBT do not measure field INP.

The before scores varied too: mobile 66/84/98 and desktop 100/100/71, including all slow valid runs. The earlier performance checkpoint's 99/22.5 ms mobile median also remains valid for its own runs. Browser/host variability is substantial; these UI edits are **not established as the cause of faster timing**. No concurrent test, build or screenshot suite ran during Lighthouse. Production bytes stayed fixed within each set; the normal development launcher remained running, and early source editing could trigger its separate HMR activity. Host power/background activity and actual hardware were not controlled. Do not describe this as a controlled causal experiment or restored real-device performance.

The first baseline attempt retained mobile run 1 then failed the owned API's 10-second startup deadline. The runner now allows a bounded 30 seconds for that startup; assertions, scoring, throttles, browser flags and valid-run retention are unchanged. The resumed baseline completed the remaining five runs. The first final desktop capture failed `NO_NAVSTART`; its raw report/trace/DevTools log are retained, including the explicit `desktop-1-failed-attempt1.*` copies. Resuming kept all three valid mobile runs and completed all desktop runs. No invalid capture enters the medians and no slow valid run was discarded. Logs: `completion-performance-before{,-resume}.log`, `completion-performance-after{,-resume}.log`.

Raw scored reports, traces, DevTools logs and build fingerprints: `.cache/phase08-performance/completion-{before,after}/`. Comparison: `.cache/final-completion/performance-comparison.json`. Existing historical labels/reports are untouched.
<!-- /performance-results -->
<!-- /delivery-results -->

## Reproduction and acceptance

Start MySQL in XAMPP on 3306 and reuse the one normal launcher; open `http://localhost:5173`. Compare both themes on desktop/tablet/phone, select all specializations with Tab/Enter/Space, expand science with Enter, inspect focus and enable reduced motion. Do not save development content merely for review.

After `npm run build`, `node scripts/performance-review.mjs after --completion` runs the compiled read-only public review on its owned 4496 server. `node scripts/visual-refresh-review.mjs --completion --overview-only --scope=studio` and `--scope=operations` use the existing private ignored credentials without printing them; normal login/logout audit events may append. DB/browser suites run sequentially. Lighthouse uses distinct `completion-before` / `completion-after` labels; labels refuse changed fingerprints and retain valid runs. `node scripts/performance-compare.mjs --completion` checks complete browser/version/settings agreement and writes a separate comparison without touching historical reports.

NOT RUN: actual Safari/iOS, physical touch/virtual keyboard/file pickers, screen readers, native browser zoom and owner visual/content acceptance. Automated axe/reflow and Playwright WebKit do not establish complete WCAG, Safari or device acceptance. Owner biography, duration, chronology, qualifications, projects, methods/outlook, educational wording, portrait likeness/use, contact permissions, indexing and launch remain pending. No production readiness or field INP/p75 Core Web Vitals claim.

## Git delivery

Local source, diff and exact staged-byte privacy review PASSED: 32 staged files, 43 public build files and all XAMPP-aware protected hashes (`completion-privacy-staged.log`). The reviewed local commit is reported at handoff; the working tree is checked again after committing. No phase-completion tag is created for this bounded extension with open acceptance. No push, deployment, indexing, ZIP or development-account removal. All existing environment/schema/migrations, artwork/portrait assets, backups and historical reports remain preserved. Normal development is left available; owned review servers/browser processes are closed and no test lock remains.
