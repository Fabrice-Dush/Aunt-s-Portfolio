# AGENTS.md — mandatory instructions for ChatGPT, Codex and other agents

This repository is **Nyirarukundo Seraphine's** bespoke portfolio website and future CMS. The design is client-specific, elegant and exceptionally fast, not a generic AI-generated template.

## On every session

1. Start with `CODEX_START_HERE.md` and `CODEX_PROMPT.md`, then read `PROJECT_STATUS.md`, `HANDOFF.md`, `DECISIONS.md`, `DESIGN_SYSTEM.md`, `ARCHITECTURE.md`, `BACKLOG.md` and `CHANGELOG.md`.
2. Inspect actual source and test state before claiming functionality exists. The Phase 2 screenshots are concept designs, not working dashboards.
3. Honor the **approved 2026-10-30 bright, portrait-led homepage** with large navy/blue `Nyirarukundo Seraphine` heading. Maintain **light ADMIN** and **dark SUPER_ADMIN** dashboard distinction.
4. Do not jump to an unapproved redesign or invent content/metrics to populate layouts.
5. Track current phase and acceptance criteria accurately. Note blocked work honestly.

## Stack and architecture

- `frontend/`: React + Vite + TypeScript. Prioritize fast first paint, accessible mobile-first layouts, strong SEO/pre-rendering, high-quality but optimized images, lightweight animation, graceful fallbacks and `prefers-reduced-motion`.
- `backend/`: Node.js + Express + TypeScript, Prisma + MySQL. Prisma 7 MySQL uses compatible driver adapter; proposed schema in `backend/prisma/schema.prisma` is NOT migrated.
- Authenticated roles: `SUPER_ADMIN` (developer/support) and `ADMIN` (Seraphine); GUEST is not a database account type.
- JWT/session auth, role guards, actual dashboards, CMS, database writes, and contact delivery are NOT implemented in Phase 3.
- No public admin signup, no default passwords, no privilege escalation, use HttpOnly cookie strategy + CSRF protection for future auth, keep audit trails.
- Keep deploy/infrastructure secrets outside source and ZIP. Use only `.env.example`.

## Data authenticity

- Name: **Nyirarukundo Seraphine**. Title: **Water Treatment Plant Engineer**. Kigali, Rwanda. User form says 11 years and WASAC Group.
- Dates `2015–2021` and `2022–present` are provisional, must be verified before publishing.
- Synthetic standing portrait needs Seraphine's explicit likeness/public-use approval. Do not label it a real work-site photograph.
- Projects, achievements, precise credential names, certifications, analytics, awards and traffic data MUST NOT be fabricated.
- Phone/email should not be displayed until owner authorizes public publication.
- Personalized email setup is postponed until after website completion; do not introduce it during development phases.

## Testing and delivery rule

- Use tests relevant to the phase. Syntax-only tests do not prove runtime correctness.
- Finish Phase 3 install/build/health verification before marking it COMPLETE. Npm registry was unreachable in the authoring environment.
- At end of EVERY COMPLETED phase with code, update all memory files and create a ZIP of the **entire latest repository** (including Phase 2 designs, sources, docs), excluding node_modules and secrets. Provide verified download link immediately.
- Maintain `PROJECT_STATUS.md`, `CHANGELOG.md`, `BACKLOG.md`, `HANDOFF.md` for multi-agent continuity.
- Prefer small, reviewable changes and honest limitations; distinguish visual concepts from real apps.

## Codex handoff update (2026-11-02)

- This is the real inherited codebase, not a request for a new application. Finish Phase 3 first.
- Local Windows Vite/Babel error: `[plugin:vite:react-babel] _lruCache is not a constructor` (details in `docs/PHASE_03_LOCAL_ERROR.md`).
- The `handoff-private/` directory is included for private developer context only, ignored by Git and forbidden from public deployment.
- Preserve the exact visually-approved direction from `docs/visual-approval/` and `design/prototype/`; their illustrative text is NOT authentic client content.
