# Phase 9 design review — 2026-11-07

The representative authorized the final revamp in the attached Phase 9 request. Starting branch `main`, clean tree, commit `9ee7babcab11a664f7b874eed4aad3ffbe1b695f`, annotated `phase-08-verified`. The bright collage in `visual-approval/developer-approved-three-designs.png` is the visual authority; its example titles and statistics are not client facts. The dark public prototype is historical.

## Baseline audit

Source inspection and actual Phase 8 rendered screenshots were reviewed before changes. A fresh unchanged browser capture is retained separately in ignored `.cache/phase09/before`. Initial restricted baseline runs failed launching esbuild (`spawn EPERM`); their logs remain in `.cache/phase09`. Successful rerun provenance belongs in the verification report.

| Impact | Observation | Direction |
|---|---|---|
| High | Public contact invitation and working form are separate sections; the latter has an unstyled heading and long privacy paragraph. | Compose one continuous contact destination, with a clearly labelled form, readable privacy notice and visible success/error states. |
| High | Long CMS forms have no groups, equal treatment for biography and administrative fields, and actions far below the fold. | Group identity, story, supporting details and publication controls; use paired short fields and full-width prose; keep save/cancel readily available. |
| Medium | Studio uses green-grey surfaces and a large empty monogram band, with a two-line oversized overview heading before tasks. | Refine to white/pale blue, tighten the overview, give profile/publication actions clear hierarchy and preserve genuine counts. |
| Medium | Operations repeats editorial serif treatment used by Studio; raw event names dominate audit rows. | Use compact system typography, square technical panels, clearer audit columns and readable event labels; retain real data only. |
| Medium | Career strip reserves four columns for only two children. | Fit the real content with a balanced two-column strip. |
| Medium | Oversized portrait halo, rounded arch and tiny caption compete with the name. | Keep the existing portrait and full proportions; use a quieter editorial frame, fine water-line detail and legible approval disclosure. |
| Medium | Login has weak relation to the public identity; labels and recovery text have equal visual weight. | Give the welcome and form deliberate composition with strong field boundaries and private-access guidance. |
| Low | Projects and credentials have limited metadata hierarchy; long descriptions need deliberate line lengths. | Refine dividers, metadata and image framing without adding records or claims. |

Retain the dominant navy/blue name, correct title and motto, local fonts, existing authorized asset handling, public-only DTOs, no-JS readable content, native navigation/dialogs, visible focus and reduced motion. No new portrait, external font, heavy icon/animation/3D dependency or invented content is needed.

## Ordering decision

Keep the existing atomic complete-collection reorder and expected-version checks. A partial-page reorder would shift unseen tied records. For more than 100 records, retain the existing Display order field, explain that lower numbers appear first and equal numbers retain the server's stable tie order, and explain the page-boundary arrow limit. A truly global move needs a separately reviewed backend contract; a visual revamp does not justify that risk.

## Review evidence

See [verification](PHASE_09_VERIFICATION.md) for actual rerun results and before/after filenames. Screenshots use disposable, visibly labelled test content; they do not represent owner publication approval. Private runtime evidence remains ignored. Human owner/device/assistive acceptance is separate.
