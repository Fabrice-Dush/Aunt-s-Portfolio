# Design system — Phase 2 approved, Phase 3 source tokens

## Visual direction

**PRECISION / PEOPLE** — an elegant professional identity for a Water Treatment Plant Engineer. The developer APPROVED the 2026-10-30 revision with a light editorial homepage, very large name, modern blue and navy identity, and generous space. The old dark homepage remains archived as a Phase 2 variant, NOT the chosen production direction.

- Public portfolio: spacious off-white / pale blue, navy serif headline, electric-blue surname, carefully cropped tall standing concept portrait, simple tailored brand mark.
- Owner/Admin dashboard (Phase 6): light clean editorial white canvas, compact dark navy sidebar, generous panels, approachable content-editing tasks.
- Super Admin dashboard (Phase 6): distinct dark navy operations workspace, restrained brighter-blue charts and careful status distinctions.
- Do not display fabricated analytics, projects, credential counts or staff accounts just to fill UI cards.

## Visual tokens

| Token | Hex / purpose |
|---|---|
| Ink / Navy | `#092F50` / headings, strong surfaces |
| Text | `#102E49` / body and detail |
| Blue | `#1876B7` / surname, links and active state |
| Sky | `#DBEAF5` / subtle photographic background halo |
| Surface | `#F9FBFD` / page light neutral |
| Warm accent | `#D78443` / delicate punctuation only |
| Border | `#DAE5EB` / separators |

- Display type: Georgia/Times family at large tight-tracked serif sizes; body: system `Segoe UI`/Arial (fast loading, no network font request). We may refine font licensing/typography in Phase 4, provided performance is preserved.
- Compositions: strong hero hierarchy; no generic repeated gradients, neon glow blobs or unnecessary endless cards.
- Corners: deliberate minimal rectangular buttons and framing on public site; dashboard cards may use controlled rounded corners.
- Icons: original SVG motifs in `frontend/src/components/ExpertiseIcon.tsx`; no heavyweight icon dependency required initially.

## Responsive and motion

- Desktop hero: text and portrait in a fluid two-column composition.
- 820px and below: stacked content then photo, visible mobile navigation toggle with `aria-expanded`, Escape handler.
- Additional 480px layout adjustments for small phones. Do not ship without real browser tests and visual comparison.
- Reduced motion: no movement when `prefers-reduced-motion:reduce`; lightweight reveal/hover motion otherwise.
- Design for WCAG contrast and visible keyboard focus; audit later in Phase 8.

## Portrait consent

`frontend/public/images/seraphine-portrait.webp` and `seraphine-portrait-small.webp` are optimized derivatives of a **synthetically generated standing photo** using the owner's supplied reference. This is not a real on-site photo. Request explicit likeness and public-use approval from Seraphine before publication.

## Final QA targets

Largest Contentful Paint ≤2.5s, Interaction to Next Paint ≤200ms, Cumulative Layout Shift ≤0.1 measured at p75 when deployed. Aim for high Lighthouse quality; do not claim metrics before measuring.
