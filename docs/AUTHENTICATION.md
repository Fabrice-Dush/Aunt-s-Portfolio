# Authentication and administrator setup — Phase 6

> **Verified development setup - 2026-11-05:** Phase 6 COMPLETED after authorized dedicated normal-mode cutover at 127.0.0.1:13312. All 18 auth/session/authorization/dashboard HTTP scenarios and final restarts passed. No recovered sessions or real accounts were activated; synthetic test fixtures were cleaned. Only four database URLs changed; JWT and all unrelated settings were preserved. Follow XAMPP_SETUP.md for this machine, not the historical Control Panel setup. Real administrator creation still requires the authorized operator and separate permission; the agent did not provision any. Browser checks remain deferred.

Updated 2026-11-05 (Europe/Paris). Local development only; nothing deployed. No real accounts have been provisioned. See PHASE_06_VERIFICATION.md for final evidence and deferred manual checks.

## First use on this machine

1. On this restored workstation, start the dedicated normal-mode port-13312 instance using the lifecycle commands in XAMPP_SETUP.md if stopped. XAMPP Control Panel does not manage it. Preserve backend/.env/JWT key and existing scoped database accounts. Do not rerun fresh setup, recovery initialization or reset a schema.
2. Verify the target with `npm run db:verify -w backend`. Apply reviewed pending migrations with `npm run prisma:deploy -w backend` only after confirming the target. Phase 6's additive migration has already been applied on this machine.
3. Run `npm run auth:key -w backend`. This preserves a valid existing key, otherwise creates 64 random bytes as 128 hex characters in the ignored backend/.env. It never displays the key. This step has already run locally. Invalid nonempty or duplicate entries require local review; they are not overwritten.
4. In your own interactive local terminal, run `npm run auth:bootstrap -w backend`. Enter the authorized maintainer email, display name, explicit BOOTSTRAP confirmation, and a unique password twice. Password entry is hidden. Do not send real credentials to Codex or place them in command arguments, source files, screenshots or reports.
5. Run `npm run dev`; open **http://localhost:5173/login**. Use localhost consistently: it must match FRONTEND_ORIGIN exactly. The Vite proxy sends `/api` to the local backend; tokens stay in HttpOnly cookies.
6. The maintainer enters dark System Operations at `/super-admin`. Open Administrator access, enter Seraphine's authorized account details and a unique temporary passphrase, and re-enter your current password. Share the temporary passphrase through an agreed private channel after verifying her identity. The application never returns that passphrase.
7. Seraphine signs in at `/login`, replaces the temporary password, then signs in again. Only then can she access the light Portfolio Studio at `/admin`. No email delivery is involved.

Bootstrap refuses an existing SUPER_ADMIN of any status. A unique bootstrapSlot additionally prevents concurrent duplicate bootstrap. There is no bootstrap HTTP route, public registration, seeded user, default password, role-changing route or SUPER_ADMIN creation route. No dashboard operation can modify any SUPER_ADMIN; the final maintainer cannot be deleted/deactivated through the API.

## Password and recovery policy

Argon2id: memory 19,456 KiB, time cost 2, parallelism 1, library-generated salts. New passphrases are 15–128 characters, reject a small local common-prefix blocklist and highly repetitive strings. No external breach-password service is integrated. This is a local baseline, not a claim to detect every compromised password. Unknown emails still incur Argon2 verification work. Invalid/disabled/unknown login responses are generic.

Account settings checks the current password and rejects an unchanged replacement. Successful change revokes **all** sessions, including the current one, and clears cookies. Sign in again. Temporary-password users may access only their own identity, password change, logout and session list/revocation.

The SUPER_ADMIN can recover only regular ADMIN accounts. Identity verification and private sharing happen outside the website. Recovery requires the maintainer's current password, installs a newly hashed temporary password, sets mustChangePassword, revokes all target sessions and records ADMIN_RECOVERY. Recovery does not silently reactivate a disabled account; activation is a separate audited operation.

Emergency maintainer recovery: run `npm run auth:recover -w backend` in the authorized local interactive terminal, identify the existing SUPER_ADMIN, type RECOVER, and enter the new temporary passphrase twice. It revokes sessions, requires another password change at sign-in, and records LOCAL_SUPER_ADMIN_RECOVERY. Possession of the trusted local database/runtime configuration is required. This is not a remote reset endpoint or permanent bypass.

`npm run auth:cleanup -w backend` prompts for CLEANUP and deletes only expired AuthSession rows. Revoked sessions are retained until absolute expiry so replay history remains meaningful. No automatic session/audit purge scheduler is installed. Session rows do not contain IP addresses or user-agent/device claims. The UI identifies sessions by creation and expiry rather than pretending to identify devices.

## JWT and session lifecycle

- JOSE signs HS256 JWTs with a random 64-byte environment key; no fallback key. Missing/malformed configuration makes authentication fail closed with 503 while public liveness remains available.
- Access lifetime: at most five minutes. Refresh/session absolute lifetime: seven days, never extended by rotation. Both JWTs contain issuer `seraphine-portfolio-api`, audience `seraphine-portfolio-admin`, subject, session ID, random jti, iat, exp and an explicit access/refresh purpose. Role is read from the database, not trusted from a token.
- Verification restricts algorithm, JWT type, issuer, audience, required claims, maximum age, expiration, purpose and session/user identity. Every protected request checks current active user, current role, session revocation/expiry and temporary-password restrictions.
- AuthSession stores SHA-256 of the random signed refresh token, not the token. SHA-256 here protects a high-entropy token; passwords use Argon2id.
- Refresh holds a user-row lock, validates the stored hash and rotates it atomically. A previously issued but superseded signed token revokes that session and records REFRESH_REPLAY_REVOKED. Revocation commits before the 401 is returned. No replay grace period.
- User-row locking serializes login, password changes, recovery, activation/deactivation and session mutations. A login rechecks the account/hash after acquiring its lock. Up to ten active sessions; a new login revokes the oldest excess sessions with an audit event.
- The browser keeps tokens only in cookies, never localStorage/sessionStorage. Concurrent refreshes coalesce in a tab; Web Locks coordinates across tabs when supported. Without Web Locks, concurrent cross-tab refresh can fail closed and require sign-in again.
- Logout revokes the session identified by a valid refresh JWT and clears both cookies. Disabled accounts and revoked sessions fail on the next protected request even if access JWT exp has not elapsed. Already-rendered information cannot be recalled from a user's memory or saved copies.

## Cookies, CSRF, CORS and deployment prerequisites

`sp_access`: HttpOnly, SameSite=Strict, Path=/api/v1, maximum age five minutes. `sp_refresh`: HttpOnly, SameSite=Strict, Path=/api/v1/auth, expiry at session absolute deadline. Both are host-only (no Domain), with Secure enforced for NODE_ENV=production. Local HTTP development omits Secure only in nonproduction. Clear-cookie paths/options match issuance. All authentication, account and dashboard responses carry Cache-Control: no-store and noindex headers.

CSRF uses **mandatory exact Origin validation plus a custom preflight-required header**, rather than a stored CSRF token. Every mutation, including login/logout/refresh, must send Origin equal to FRONTEND_ORIGIN and `X-Portfolio-Request: 1`; bodies must be JSON. Missing/null/foreign Origin is rejected. SameSite is defense in depth, not the sole protection. Credentialed CORS allows only the configured origin. Production mutations also require an HTTPS frontend origin. Do not add wildcards, suffix matching or missing-Origin exceptions.

Deploy the frontend and `/api` under one trusted HTTPS origin. Serve generated private route shells or internally rewrite all `/login`, `/admin/*` and `/super-admin/*` requests (including the two dashboard roots) to `/login/index.html`, preserving the browser URL. The Vite preview configuration already performs this mapping; do not rely on a host's default public SPA fallback; never server-render authenticated data into public files. Keep static assets public but protect every data endpoint. Configure any reverse proxy explicitly before trusting forwarded addresses; current Express trust proxy remains disabled. Login limiting is 10 requests per IP per 15 minutes; sensitive account/password actions are 20 per IP per 15 minutes; the existing global 120/15-minute limit remains. Stores are in-process: shared rate limiting, HTTPS/proxy tests, key distribution/rotation and backup procedures require deployment verification before launch. Do not use `npm audit fix --force` or upgrade to Prisma 8 as part of this work.

## API

All paths below start `/api/v1`. JSON errors retain `{error:{code,message}}`, with safe fixed messages. No hashes/tokens/secrets in JSON responses. Role and identity come from authenticated cookies; fake headers are ignored.

| Method/path | Access / body / result |
|---|---|
| POST `/auth/login` | CSRF + limiter; `{email,password}`; safe user, two cookies |
| POST `/auth/refresh` | CSRF; `{}`; rotate refresh, new cookies, 204 |
| POST `/auth/logout` | CSRF; `{}`; revoke session and clear cookies, 204 |
| GET `/auth/me` | Active session, including temporary-password users; safe user and current sessionId |
| POST `/auth/change-password` | Active session + CSRF + limiter; `{currentPassword,newPassword}`; revoke all, 204 |
| GET `/auth/sessions` | Own active sessions only; ID and creation/refresh/expiry timestamps |
| DELETE `/auth/sessions/:id` | Own session + CSRF; revoke, clear cookies if current, 204 |
| GET `/administrators?page=1` | SUPER_ADMIN; regular ADMIN accounts only, safe fields |
| POST `/administrators` | SUPER_ADMIN + CSRF + limiter; `{email,displayName,temporaryPassword,currentPassword}`; 201 |
| PATCH `/administrators/:id` | SUPER_ADMIN + CSRF + limiter; `{isActive,currentPassword}`; revoke target sessions |
| POST `/administrators/:id/recovery` | SUPER_ADMIN + CSRF + limiter; `{temporaryPassword,currentPassword}` |
| POST `/administrators/:id/revoke-sessions` | SUPER_ADMIN + CSRF + limiter; `{currentPassword}`; 204 |
| GET `/dashboard/summary` | Both roles after password replacement; genuine counts/profile state; active ADMIN count only for SUPER_ADMIN |
| GET `/dashboard/content/:section?page=1` | Both roles; profile, experience, education, skills, projects, achievements, certifications, messages |
| GET `/dashboard/security?page=1` | SUPER_ADMIN; safe recorded audit events, newest first |
| GET `/dashboard/status` | SUPER_ADMIN; real API response and DB SELECT 1, timestamp; no invented monitoring |

Paged lists use 20 records and `{pagination:{page,hasMore}}`, with page 1–9999 and deterministic tie-breaks. Unknown query/body fields are rejected where schemas are defined. Own sessions are bounded at 100 returned rows, with at most ten active sessions enforced at login. Account details are present in the safe list DTO; no generic arbitrary-user detail route exists. No portfolio editing/publishing/media/settings-write routes are introduced.

Audit events: bootstrap, successful/failed login (failed events have no submitted email or password), logout, refresh replay, own/other session revocation, session cap, ADMIN create/activate/deactivate/recovery, password change and local maintainer recovery. Audit writes share the transaction with sensitive mutations. Audit DTO omits raw details and authentication material.

## References

Parameters follow [OWASP password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). JWT signing/verification uses the [JOSE implementation](https://github.com/panva/jose). Browser checks remain explicitly unverified; automated tests do not constitute a complete security audit.
