# Temporary dashboards on normal development — 2026-11-17

The representative explicitly authorized two synthetic temporary accounts in the normal XAMPP development database, `seraphine_portfolio_dev_x3306_20261116` on `127.0.0.1:3306`. This supersedes the earlier requirement to test only at port 5186 for this request. No real client identity, deployment, phase advancement or public design change is authorized.

## Daily login

1. Start MySQL in XAMPP Control Panel if it is stopped. Apache is unnecessary.
2. Run `npm run dev` from the repository root and leave the terminal open.
3. Open **http://localhost:5173/login**. Use `localhost` exactly, matching the existing mandatory Origin configuration.
4. Open `.cache/development-dashboard-private/credentials.json` locally in your editor. Use the email and current password for the desired role. Do not paste credentials into chat or screenshots.

| Role | Temporary email | Destination |
| --- | --- | --- |
| ADMIN | `dev-test-studio@example.invalid` | `/admin` — light Portfolio Studio |
| SUPER_ADMIN | `dev-test-operations@example.invalid` | `/super-admin` — dark System Operations |

Sign out before switching roles in the same browser profile. To compare them simultaneously, use separate profiles or a normal window and a private window. Ordinary tabs share cookies.

These dashboards connect to the real local development content. Account cleanup does not undo content changes you make while testing. Avoid editing or deleting recovered portfolio records or the existing message if you want to preserve them. Accounts persist across application restarts until explicitly removed; there is no automatic expiry.

## Private setup and verification

The local setup helper calls the existing audited bootstrap service used by the hidden-input maintainer CLI. It then signs in through the normal frontend proxy and creates ADMIN through the existing authenticated, password-reauthenticated endpoint. It completes the mandatory ADMIN password replacement through the protected endpoint and verifies session invalidation. No direct privileged inserts, password-flag overrides, auth bypass, role change, schema change or environment rewrite is used.

Each current password contains 32 random bytes, independently generated and validated against the existing password policy. Credentials and captured account IDs live only in the ignored private directory, restricted to the current Windows identity and SYSTEM. Vite blocks `.cache`, private media and private handoff files from filesystem HTTP serving while retaining its default secret exclusions.

Commands from the repository root:

```powershell
node --import tsx scripts/development-dashboard-accounts.mjs prepare
node scripts/development-dashboard-verify.mjs
node --import tsx scripts/development-dashboard-accounts.mjs status
```

`prepare` is a one-time setup, not a daily startup step. It requires the normal frontend/backend already running, refuses existing users/private state or a held shared test lock, and validates the exact development schema/account/port/MariaDB instance. Finish the previous isolated session first using `node --import tsx scripts/manual-dashboard-test.mjs cleanup`; never delete its lock manually.

Preparation compares all fields of all existing content/message rows and the full migration ledger before/after, and checks the exact environment-file hash. The initial expected content is 17 rows: 16 recovered portfolio records and one existing contact message, plus two migration rows. Audited account/session activity adds its own rows separately. `status` compares the same original content baseline and refuses if it has changed; it does not restore or overwrite anything.

The focused Chromium verifier uses fresh profiles to check both sign-ins at port 5173, exact captured user identities, role destinations, real development counts, cross-role navigation, authorization, HttpOnly/Strict cookies, CSRF refusal, logout and credential HTTP exclusion. It does not write passwords, cookies, traces, response bodies or screenshots. Its non-secret report is `.cache/development-dashboard-verification.json`. This is not a full browser/accessibility acceptance run and does not replace historical compatibility limitations.

## Safe removal after testing

From the repository root with XAMPP MySQL running:

```powershell
node --import tsx scripts/development-dashboard-accounts.mjs cleanup
```

The command verifies the unchanged environment, exact development instance, and each captured account's ID/email/role/creation timestamp. It transactionally removes only those two users and their sessions. It retains audit history (removed actors become null under the existing foreign key), every content/message row, migration history and all other accounts. It compares content fingerprints immediately before and after removal, then deletes the private credential/state files and releases only its own short-lived provisioning lock. No reset, truncate, schema drop, content cleanup or migration rollback occurs. Legitimate later content edits are preserved rather than reverted.

Close or sign out of old dashboard tabs afterward. Removed users and sessions can no longer authenticate, even if cookies remain. Do not use the historical isolated-test cleanup command to remove these development accounts. Do not manually delete users, credentials/state or a lock to bypass a guard. If setup/removal stops partway, retain the private state and inspect the reported stage before retrying.

## Verification status

Read-only inspection confirmed the correct normal development configuration, zero initial users/sessions, all 17 original records and two migration rows. Both accounts are now ready. Focused Chromium 156.0.8078.4 passed both logins, exact role destinations, cross-role navigation, real development content, authorization, cookies, CSRF and logout. Private current credentials return HTTP 403 from Vite. Final status verified every original content/message field, both full migration rows and the exact environment-file hash unchanged. Owner/SYSTEM-only ACLs and Git exclusion were checked for the credential/state files. Frontend typecheck and helper syntax checks passed. The normal development servers are left running. Removal is documented and reviewed, but has not been executed against these final accounts.


The previous isolated session has been removed through its captured-ID cleanup; the test schema is empty and shared lock released. Cleanup first detected two newly appended normal-development audit events. Its reviewed guard accepts such additions only for an originally empty audit baseline, while retaining strict comparisons for every other table; both events were preserved. Earlier execution-approval timeouts were resolved on this continuation. Initial verifier failures were corrected in the verifier (uppercase footer labels and HTML fallback for an already-deleted file); the final report passed. No application redirect/security behavior was changed.
