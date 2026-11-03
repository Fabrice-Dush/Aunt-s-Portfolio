# Phase 3 local runtime bug — verified 2026-11-02

## Original report

Windows Chrome displayed `[plugin:vite:react-babel] _lruCache is not a constructor` in `@babel/helper-compilation-targets` while transforming `frontend/src/main.tsx`. Historical evidence: `docs/vite-babel-error-screenshot.png`.

## Current diagnosis and result

The original error did not reproduce in this session. The inherited installation already resolved Babel's cache correctly. A clean root `npm ci --no-audit --no-fund` then succeeded with the existing lockfile. Vite development transforms, the production build and a fresh Chrome page load all passed without that overlay.

- Node 24.11.1; npm 11.6.2; Vite 7.3.7; React plugin 5.2.0.
- Babel helper 7.29.7 resolves `lru-cache` 5.1.1, which exports a constructible function (directly checked).
- MariaDB's separate `lru-cache` 10.4.3 is valid and must not be forced onto Babel with a global override.
- `npm ls --all --json` returned exit 0. No workspace conflicts remain in the verified installation.
- The existing user edit in the lockfile changes the backend Express range from `^5.3.0` to `^5.1.0`, matching `backend/package.json`. It was preserved exactly. The installed version remains 5.3.0.
- No dependency versions were changed, no lockfile was regenerated, and no SWC switch was needed.

The historical cause cannot be established from the old screenshot alone. A stale or inconsistent earlier install is plausible, but not proven.

## Windows installation and execution findings

The first clean install failed with `EPERM` because this checkout's running Vite process held `node_modules/@esbuild/win32-x64/esbuild.exe`. Its command line was checked before stopping only the confirmed project Vite/esbuild processes. The same clean install then added 291 packages successfully.

Some restricted agent subprocesses failed with `spawn EPERM` (Vite/esbuild, Node test workers and preview). Retrying the same commands with approved normal subprocess access passed. This is an execution-sandbox restriction, distinct from the original Babel error.

For future clean installs: stop this project's development servers, run `npm ci` from the repository root, then `npm test`, `npm run typecheck`, `npm run build`, and `npm run dev`. Do not delete the lockfile or kill unrelated Node processes.

See `PHASE_03_VERIFICATION.md` for the full runtime record and database limitations.
