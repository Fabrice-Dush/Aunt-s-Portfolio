# Local performance investigation and visual QA — 2026-11-26

This is an authorized performance extension of Phase 9, following [the visual transformation](VISUAL_TRANSFORMATION.md) and [public storytelling](PUBLIC_STORYTELLING.md). Phase 10, deployment, indexing and owner launch approval remain outside this work.

## Starting state and method

The working tree was clean on `main` at `3894b44` (`Enrich public expertise and water-science storytelling`). That commit exists and was HEAD at inspection. All six approved reference images and the retained storytelling evidence were inspected. `.cache/public-story/before/` and `after/` remain present and unchanged. No unrelated edits were discarded.

Measurements use the normal published development DTO, compiled React/Vite prerender and compiled Express freshness-gated/compressed server on loopback port 4496. The existing runner starts a fresh owned server and Chrome profile for each measurement, with storage reset enabled. No source test, build, screenshot or database suite runs concurrently with Lighthouse. Native Chrome uses the existing `--headless --disable-gpu` flags in both sets. Throttles and scoring were not changed.

Today's Lighthouse is 13.5.0 and native browser user agent is HeadlessChrome **158.0.0.0**. Mobile uses simulated 4× CPU, 150 ms RTT, 1638.4 Kbps, 412×823 and device scale 1.75; desktop uses the existing Lighthouse desktop config. Historical Phase 9 used Chrome 156; storytelling used Chrome 157. Those older measurements have matching broad runner settings but different browser/host conditions, and are not a causal before/after comparison. Host power/background activity and real devices are not controlled. Lighthouse TBT is not field INP.

The first build attempt was blocked while XAMPP was stopped. The representative started MySQL. Restricted worker/esbuild spawning then required approved execution outside the sandbox. No database settings or environment bytes were rewritten. One baseline Chrome `NO_NAVSTART` failure is retained; resuming retained every valid run. Failed attempts never enter medians.

## Evidence and diagnosis

The reproduced baseline already meets the requested median targets: mobile **99 / LCP 2.058 s / TBT 37 ms / CLS 0**, desktop **100 / LCP 0.497 s / TBT 0 / CLS 0**. Mobile scores are 99/99/98; TBT 37/16.5/107.5 ms. One mobile run has CLS 0.002283 and one desktop run 0.000456; both medians are zero. The prior 71/1216 ms regression did not reproduce before application edits. It would be misleading to attribute today's recovery to this change. The baseline fingerprint is **identical** to the retained storytelling build, `b429b56efb0f82611fe32b11cd313d086cf8775f26817e8096cee98ab6661f47`; this strengthens the need to separate browser/host variation from code effects.

The additional `performance-before-trace` run is diagnostic only, excluded from the three-run baseline. It scored 99 / LCP 2.039 s / TBT 41 ms / CLS 0 and retains raw Chrome trace and DevTools log. Its largest renderer task is 165.842 ms, containing 120.832 ms initial document layout (397 objects). Lighthouse's simulated main-thread categories are approximately 674 ms style/layout, 347 ms script evaluation and 8.6 ms parsing/compilation. These totals are not TBT. The portrait is mobile LCP; the small WebP is already parser-discoverable, responsive, asynchronous-decoding and high-priority. Desktop LCP is the hero water ribbon in the first baseline trace.

WaterArt uses small external static SVGs; the 106,070-byte sculpture is a lazy WebP. The science graphic is a small inline vector. Source and trace review found no animation loop, canvas/WebGL, scroll handler or third-party animation runtime. Entrances are finite transforms; section reveals use one-shot IntersectionObserver observations; reduced-motion disables motion. No evidence justified replacing graphics, changing portrait assets, reducing visual quality or introducing content-visibility placeholders and possible anchor/layout shifts.

One concrete inefficiency was reproduced: identical freshness responses replaced the entire public data object. Navigation props changed, causing observer teardown/recreation and unnecessary descendant work. The diagnostic starts with three observer constructions and rises to 4/5/6 after three identical focus refreshes. This is a bounded avoidable cost, not an established explanation for the earlier 1.2-second TBT.

## Implementation

- `frontend/src/main.tsx` passes the already-embedded public revision into App.
- `frontend/src/app/App.tsx` retains the previous state when a successful response has the same revision. The backend already SHA-256 hashes the complete public DTO. The initial, 30-second and focus freshness requests, no-store behavior, request coalescing and failure withdrawal remain. Missing revisions use the ordinary update path. Changed revisions update content; errors clear data and revision so recovery can repopulate the page.
- `backend/test/cms.test.mjs` compares `nextVersion` with one captured future timestamp. The initial run reproduced a race from comparing against a second advancing `Date.now()` call. No CMS implementation or security assertion was weakened.
- `scripts/phase08-performance.mjs` adds separate before/after labels, retains raw trace/DevTools artifacts and supports one explicitly separate baseline diagnostic trace. Existing scoring, profiles, cache behavior and valid-run retention are preserved.
- `scripts/phase08-browser.mjs` makes primary-context action/navigation limits explicit and adds hard deadlines around compatibility context/page creation, bounds, native mouse click, diagnostics and shutdown. Installed Playwright already uses a 30-second default for ordinary actions; direct native mouse operations need their own deadline. Assertions, fixture targeting and cleanup are retained.
- `scripts/public-story-review.mjs` supports an allowlisted compiled-loopback target and separate performance evidence folders, bounded waits and actual compiled no-JavaScript assertions. Browser-only collection fixtures now have their own revision.
- `scripts/performance-review.mjs` owns its review server/browser, runs visual/accessibility checks and records identical-refresh observer counts. After checks also exercise changed CMS description, failure withdrawal and recovery with browser-response fixtures, without development writes.
- `scripts/performance-compare.mjs` compares available valid reports per build, asserts identical browser/version/settings, reports missing runs explicitly and measures JS transfer including protocol headers.
- `scripts/performance-visual-compare.mjs` compares decoded screenshot pixels, retains raw differences and checks vertical crop alignment. Ordinary pixel comparisons use direct channel comparisons without per-pixel allocations.

No CSS, artwork, image bytes, animation, content wording, dependency, backend behavior, schema/migration, auth/RBAC/CSRF/session rule, publication gate or environment change. No development contact submission, content save, account removal, push, deployment or ZIP.

## Final results

`performance-compare.mjs` verified matching Lighthouse version, native browser and complete config settings for every available report. Before has three mobile and three desktop runs. After has three mobile and **two desktop runs**; the third desktop capture returned `NO_NAVSTART` on four attempts. Every valid report is retained. Final comparison is `.cache/performance-review/comparison.json`, explicitly `complete: false`, with missing desktop run 3. Do not describe it as a complete six-run final set or a three-run desktop median. The ordinary runner does not write a completed final `summary.json` for this partial set.

| Metric | Reproduced before | Optimized after | Difference |
|---|---:|---:|---:|
| Mobile Lighthouse, n=3 | 99 | 99 | 0 |
| Mobile LCP median | 2.058324 s | 2.026366 s | −0.031958 s |
| Mobile TBT median | 37 ms | 22.5 ms | −14.5 ms |
| Mobile CLS median | 0 | 0 | 0 |
| Desktop Lighthouse | 100 (n=3) | 100 in both valid runs (n=2) | 0; third after capture unavailable |
| Desktop LCP | 0.496596 s (n=3 median) | 0.497314 s (n=2 median) | +0.000719 s; unequal sample counts |
| Desktop TBT / CLS | 0 ms / 0 | 0 ms / 0 in both valid runs | 0 |
| JS transfer, including response headers | 83,819 B | 83,878 B | +59 B |
| Total transfer / requests | 275,111 B / 9 | 275,169 B / 9 | +58 B / 0 |

Final mobile scores are 99/99/99, LCP 2.084344/2.026366/2.017871 s, TBT 22.5/26/16.5 ms and CLS 0/0/0. Both valid desktop scores are 100 with zero TBT and CLS. Accessibility/best practices score 100 in all valid reports; SEO is 66 with intentional noindex. The final fingerprint is `fdef51dc52f78f008da4b018e38e9e646ca69e51c313acb0d9cda5a27ddf38b2`.

These are small observed startup differences, not evidence that this change cured the historical 71/1216 ms result. The demonstrated optimization is avoiding unchanged-refresh rendering/observer work. Current mobile lab median targets are met before and after; real-device acceptance and reproducibility of the old slow traces remain open. Desktop scores remain strong in the available runs, with incomplete third-run execution.

The final failed desktop raw trace and DevTools log are retained as `desktop-3-failed.{trace,devtoolslog}.json`. Diagnostics (`failed-capture-analysis.json`) show HTTP 200 document delivery and navigation/paint events even though Lighthouse rejected the capture with `NO_NAVSTART`. The precise trace-association failure is unproven. Failure logs are `.cache/performance-after-attempt{1,2,3,4}.log`; baseline failure is `performance-before-attempt1.log`. No throttle, browser flag, genuine feature or score-selection rule was changed to obtain valid results.

### Browser provenance

The retained storytelling run was 16/19: lazy-image coverage, Add project history waiting and Firefox login navigation were the three failures. Its image harness was corrected and its three focused reruns passed; those passes did not convert that old broad run into 19/19. The old native navigation timeouts' exact causes remain unproven.

Today's broad run is **18/19**, saved in `.cache/performance-review/browser-broad.json` and `.cache/performance-browser.log`. All Chromium public/navigation/no-JS/contact/auth/CMS/native-history/media/messages/Operations/account workflows passed, as did WebKit, Chrome and Edge compatibility. Firefox stalled in `mouse.click` on the public About anchor. Its native log includes `RenderCompositorSWGL failed mapping default framebuffer` and graphics/component errors. After more than five minutes, the verified Firefox child of this exact owned harness was stopped; no unrelated browser or development process was stopped. The resulting closed-browser failure is retained, not counted as a pass. Native runtime evidence supports a browser/driver problem in this attempt, but does not prove the causes of previous failures or complete Firefox application acceptance. The harness subsequently confirmed all 13 isolated application tables empty and released its lock.

The focused Firefox rerun **PASSED 1/1** with the same click and navigation assertions and the added hard deadline (`browser-firefox-focused.json`, `.cache/performance-firefox.log`). All 13 tables were empty and the lock released again. The broad run remains 18/19. Versions: Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2, installed Chrome 158.0.8127.37 and Edge 158.0.4370.33. The broad run captured 55 screenshots and eight axe views with zero violations. Its initial lack of explicit primary-context settings did not imply unlimited ordinary actions: installed Playwright's built-in default is 30 seconds. The native `mouse.click` operation needed the separate hard deadline now retained.

### Regression ledger

| Check | Outcome and scope |
|---|---|
| Source/component/service/HTTP | PASSED `npm test`: 7 offline, 26 frontend, 31 backend/API runner tests; zero failures/skips in the final run (`performance-source-elevated.log`). Initial CMS clock race was fixed; a restricted worker-spawn attempt is retained separately. |
| TypeScript | PASSED both workspaces (`performance-typecheck.log`). |
| Isolated real DB/auth/CMS | PASSED 11 + 18 + 14 scenarios, runner totals 12/19/15 including parents, zero failures/skips (`performance-database.log`). Exact target/instance, initially-empty refusal, exclusive lock and captured-ID cleanup retained. |
| Full browser | FAILED uniform broad acceptance: 18 PASSED, 1 FAILED (Firefox native click), zero blocked launches. Separate focused Firefox PASSED 1/1. See provenance above. |
| Production build | PASSED normal published-content frontend/prerender and backend builds (`performance-build-after.log`). CSS hash unchanged; public JS 256.03 KB / 80.25 KB gzip, appearance script 627 bytes; public CSS 24.16 KB / 6.25 KB gzip. |
| Production artifacts | PASSED all four `npm run test:build -w frontend` cases: public HTML, resolved assets/budgets, public file/privacy exclusions and neutral private shells/lazy routes (`performance-artifacts.log`). |
| Compiled public visual/accessibility | PASSED 30 before + 30 after captures, eight axe scans per set with zero violations. Each set has 26 actual-published-content and four labelled response-fixture views; seven real widths 320–1920, both appearances, keyboard selection/disclosures, reduced motion, conditional collection layouts and no page errors. Six additional corrected selected-state captures passed separately, with no additional axe scans. |
| Compiled no-JavaScript | PASSED actual public HTML, disabled selection controls, all skill fallback disclosures, native science disclosure activation and disabled contact submission. |
| Revision refresh behavior | PASSED identical-refresh observer counts: before initial 3 then 4/5/6, after initial 2 then 2/2/2. Browser-only changed-description priority, 503 withdrawal and same-publication recovery assertions passed (`performance-visual-after.log`, `after/refresh.json`). No development data was written. |
| Protected development state | PASSED documented XAMPP-aware read-only comparison: exact environment, temporary account identities/readiness, original non-message rows and complete migration ledger unchanged. Original message unchanged; existing appended message retained. The historical whole-table message fingerprint still differs, as required; its strict guard was not changed. Private credentials remain owner/SYSTEM-only and ignored (`preservation.json`, `performance-preservation.log`). |
| Source/history/staged privacy | PASSED actual source (256 files), reachable history (594 blobs), public build (43 files), exact staged changes (20 files) and protected backup/environment hashes (`performance-privacy-source.log`, `performance-privacy-staged.log`). No sensitive file or credential was staged. |
| Lighthouse | PASSED three-run mobile execution/median targets. Desktop third after capture BLOCKED by four retained `NO_NAVSTART` attempts; two valid scores are 100. Five valid final reports, not six. |
| Actual hardware / human acceptance | NOT RUN: actual Safari/iOS, touch hardware/file pickers, screen readers and native zoom. Owner content/appearance/likeness/contact/indexing/launch approval remains pending. |

## Evidence locations and acceptance

The raw pixel comparison found 26/30 matching captures identical. Four original desktop selected-state crops had vertical offsets: light Expertise +173 px, dark Expertise −346 px, light science +68 px and dark science −33 px. After translation, **every overlapping pixel is identical** in all four pairs. The original helper used viewport `boundingBox().y` as a document crop coordinate after keyboard focus could scroll. It now adds the current document scroll offset. Original captures remain untouched; six corrected final selected-state views are under `after-selected-corrected/`. This is not a claim that all original screenshot files are pixel-identical.

Actual before/after and corrected screenshots were opened and inspected, including both desktop home appearances, phone hero, default and selected Expertise, the sculpture, mobile inline explanation, science disclosures and source links. No visual/content regression was observed in the inspected views. CSS and image bytes are unchanged. Review retains the original reference qualifications: the inherited portrait is an approval-pending concept and empty real collections stay absent. Native device/owner appearance acceptance remains separate.

Ignored QA artifacts are evidence, not backups or owner approval:

- `.cache/phase08-performance/performance-before/`: six valid scored reports, fingerprint and summary; `.cache/performance-before-attempt1.log` retains the failed attempt.
- `.cache/phase08-performance/performance-before-trace/`: supplementary mobile raw `mobile-1.trace.json`, DevTools log and scored diagnostic.
- `.cache/performance-review/before/`: 30 compiled actual-content/labelled-fixture captures, eight axe scans and refresh diagnostic trace.
- `.cache/phase08-performance/performance-after/`: five valid scored reports with raw traces/DevTools logs, plus failed desktop capture diagnostics; no completed six-run summary.
- `.cache/performance-review/after/`: final visual/refresh evidence after verification.
- `.cache/performance-review/after-selected-corrected/`: six complete selected-state section crops using document coordinates; `visual-comparison.json` retains all 30 original pair differences/alignment results. `inspection/` contains derived top crops of actual final full-page pixels for review.

Developer acceptance: start XAMPP MySQL on 3306, reuse/start the normal `npm run dev` only if ports 5173/4000 are free, open `http://localhost:5173`, compare both public appearances at desktop and mobile widths, select Expertise with Tab/Space, expand science with Enter, and check reduced motion. Never save protected development content merely for review. Compiled public/no-JS review is reproducible with `node scripts/performance-review.mjs after` after `npm run build`; it uses only its owned port 4496.

For new performance evidence, preserve existing label directories before a new build: labels refuse different fingerprints and reuse already-valid runs. Run `npm run measure:performance -- performance-after` with no concurrent test/build/review. On this unchanged build it retains five valid reports and attempts only missing desktop run 3. `node scripts/performance-compare.mjs` checks matched settings and explicitly reports missing desktop runs. Isolated DB/browser suites must remain sequential under their existing exclusive lock; never delete a live lock.

Actual Safari/iOS, hardware touch, screen readers, real browser zoom and owner appearance/content/likeness/contact/indexing/launch acceptance remain NOT RUN or pending. Historical native browser runner failures and host variation are not dismissed as proven environmental causes. Automated axe and CSS viewport checks do not establish complete WCAG or real-device acceptance.

## Git delivery

Twenty files changed: the two public startup/state files, one CMS test, existing performance/browser/public-review harnesses, three new performance review/comparison helpers, this report and ten current checkpoint/memory references. No backend implementation, schema/migration, environment, dependency or visual asset is part of the change. Source/history/build/protected-hash and exact staged privacy scans PASSED. Local commit identity and working-tree status are reported at delivery. No phase-completion tag is created for this bounded extension with recorded acceptance limits. No push, ZIP or deployment.
