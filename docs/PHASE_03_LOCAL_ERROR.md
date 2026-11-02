# Phase 3 local runtime bug — reported 2026-10-30

**Developer machine:** Windows, Chrome, `http://localhost:5173`.

The user extracted the Phase 3 source ZIP, ran dependency installation, created `backend/.env` from `.env.example`, and attempted to run both frontend and backend using `npm run dev`. The frontend returned the Vite overlay:

```text
[plugin:vite:react-babel] _lruCache is not a constructor
.../frontend/src/main.tsx
.../node_modules/@babel/helper-compilation-targets/lib/index.js:143:22
```

Evidence image in `docs/vite-babel-error-screenshot.png`.

**Unknown:** exact installed Node/npm versions, lockfile, dependency tree, whether backend health endpoint worked, whether reinstall or SWC plugin switch was attempted successfully. Never assume the bug is resolved just because suggestions were offered.

**Suggested investigation:** inspect `node -v`, `npm -v`, `npm ls @babel/helper-compilation-targets lru-cache @vitejs/plugin-react vite`; inspect lockfile resolution; check for conflicting transitive packages, unsupported Node versions, or corrupted installation. Fix dependency issues systematically, reinstall cleanly as needed and verify with real Vite runtime. Switching to `@vitejs/plugin-react-swc` may be acceptable if validated with versions and user requirements. Do not change visual design to fix this tooling error.

Acceptance: successful install, typecheck, build, frontend load without overlay, Express health endpoint, and documented Prisma validation status. Keep Phase 3 IN PROGRESS until completed.
