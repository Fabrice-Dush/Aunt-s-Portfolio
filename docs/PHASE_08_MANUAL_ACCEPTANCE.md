# Remaining device and owner acceptance

Automated results belong in [PHASE_08_VERIFICATION.md](PHASE_08_VERIFICATION.md). This checklist does not claim manual checks passed. Keep the historical Phase 4 and Phase 6 lists unchanged; Phase 8 evidence states which automated cases cover them.

## Reproduce local verification

Use the existing project folder, preserved backend/.env and documented dedicated MariaDB startup. Do not reinitialize, seed, reset or restart the database just to run tests. Test tooling requires Node 22.19+; this workstation uses 24.11.1. Never run database suites and browser fixtures concurrently.

```powershell
npm test
npm run typecheck
npm run test:db -w backend
npm run test:browser
npm run build
npm run test:build -w frontend
npm run verify:database
node scripts/verify-phase07.mjs
npm run measure:performance -- final
```

Browser tests require installed Playwright Chromium/Firefox/WebKit plus optional installed Chrome/Edge. The harness refuses nonempty test application tables, creates only disposable synthetic test accounts, uses isolated builds/media, keeps ordinary guards/rates and cleans its recorded IDs. Never enter real credentials into a test script or send them to an assistant. Ignored reports/screenshots are in `.cache/phase08-browser` and `.cache/phase08-performance`. They are local QA artifacts, not a deployment or database backup.

The performance command retains successful measurements for an identical build. It refuses to mix different builds under one label. Preserve an existing report directory under a distinct local name before measuring a changed build; do not overwrite evidence or delete an active build/test lock. A failed Lighthouse trace is not a valid page-performance measurement.

Install the locked dependencies with `npm ci`, then managed test engines with `npx playwright install chromium firefox webkit`. Chrome/Edge coverage uses existing Windows installations through the `chrome`/`msedge` channels. Browser fixtures and consistency checks deliberately pin this recovered workstation's exact disposable schema, account, port and instance identity; a different machine needs a separately reviewed disposable configuration.

For a focused diagnostic, set `$env:PHASE08_BROWSER_FOCUS = 'firefox'` (or `webkit`, `chrome`, `edge`, `media`), run `npm run test:browser`, then `Remove-Item Env:PHASE08_BROWSER_FOCUS`. Unselected groups remain NOT RUN; retain full-run evidence separately.

## Human review on available devices

| Browser/device | Remaining human checks |
|---|---|
| Installed Chrome on Windows | Review the public page and both distinct dashboard palettes, keyboard focus, dialogs and actual browser zoom; record version and results. |
| Microsoft Edge on Windows | Repeat core navigation, forms, keyboard and native leave-page prompts; record version. |
| Firefox on Windows | Repeat native disclosure, focus/scroll, forms and leave-page prompts; record version. |
| Actual Safari on macOS/iOS | Required device follow-up. Playwright WebKit on Windows does not establish Safari/device acceptance. Use an authorized private review environment; do not publish unapproved content to obtain a test URL. |
| Touch phone/tablet | Check orientation, virtual keyboard, file picker, scrolling, touch targets and portrait. Emulation does not prove hardware behavior. |
| NVDA / VoiceOver | Read landmarks/headings, forms/errors/status, menu state and modal title. Check meaningful focus order and return focus. Automated axe is not a screen-reader or complete WCAG conformance assessment. |

For each browser/device, record date/version, viewport/zoom, route, action, expected/actual result and screenshot filename. Capture top viewport and full page at 320, 375, 390, 768, 1024, 1440 and 1920 CSS pixels; include 844×390 landscape. Inspect all visible controls and long text for clipping, overlap and horizontal scrolling. For 200%/400% use the browser's actual zoom UI, then verify reflow and keyboard operation; automated reduced CSS viewport checks are complementary.

## Interaction checklist

1. Public page: confirm name/title/motto, navigation/anchors/skip link, images and console. Disable JavaScript: content/navigation still work, contact controls remain disabled with an explanation, and private text cannot enter a GET URL. Compare layout with approved references; final visual refinement remains a later milestone.
2. ADMIN: in an authorized disposable environment, open each content area, save/reopen a draft, preview, reject unverified publication, verify/publish, update the local website, edit/republish/unpublish/remove. Check failed saves retain values and conflicting versions require reload. Do not publish provisional or unapproved owner content.
3. Unsaved changes: edit a form, then navigate through a dashboard link, Back, Forward, refresh and close. Cancel each leave action and confirm the text remains. Accept only when ready to discard. Browser-native generic prompt wording is expected; sticky user activation is required and mobile process termination cannot guarantee a prompt. No history restoration loops should occur.
4. Media: upload a permitted image/PDF, check alt text, reject dangerous/oversized files, approve/attach/detach and remove. Switch between edited records and cancel the discard prompt: values must stay on their original record. Referenced-file removal must fail safely. PDF normalization preserves pages/resources but removes document metadata/outlines/labels; approve only after reviewing the processed file.
5. Contact/messages: verify success only after actual storage, invalid-input feedback, failed-network retry, no duplicate from repeat submission, private read/unread/archive/delete. Retry deduplication uses the same key while the saved message exists and obeys timing/rate limits; deletion removes that receipt. No email is sent.
6. SUPER_ADMIN: verify dark Operations, account creation restrictions/current-password confirmation, temporary-password replacement, activation/deactivation, recovery, session revocation, audit and actual system status. ADMIN/guest must be denied technical APIs. Only use privately authorized accounts; no real owner accounts were created by Phase 8.
7. Dialogs: open with keyboard, cycle Tab/Shift+Tab, press Escape, verify return focus and error announcements. Test disabled/busy states and keyboard-visible focus. Use reduced motion and increased text spacing.
8. Availability: use test-only network failure simulation, never stop the recovered database to force an error. Verify neutral stale-page errors and accurate local build status. Third-party deployment/cache invalidation is not configured or claimed.

## Launch and Git boundaries

Real administrator provisioning still requires the private procedure in [AUTHENTICATION.md](AUTHENTICATION.md), after explicit authorization. Owner dates/qualifications/projects/portrait/contact consent, final visual revamp, real-device/assistive review, hosting/HTTPS/proxy/shared limits, monitoring, media/database backup operations and retention approval remain pre-launch work. Personalized email stays postponed.

Before a push, verify that the intended GitHub remote is private and the pushing identity has write access. Do not make a public push, change visibility automatically, force-push, create a falsely verified phase tag or generate an automatic ZIP. Git is not a backup of database records/private media; preserve separately verified database backups.
