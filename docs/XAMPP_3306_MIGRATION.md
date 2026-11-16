# XAMPP port-3306 logical migration - 2026-11-16

Authorized by the representative's explicit request to use XAMPP Control Panel normally, preserve every existing database/backup and retain the recovered port-13312 fallback. Local development infrastructure only; Phase 9 owner/launch approval remains pending and Phase 10 has not started.

## Result

The real ignored `backend/.env` now points to the new healthy port-3306 schemas below. Only its four database URL lines changed; byte masking and parsed-value comparisons verified that JWT and every other setting/byte were preserved. A normal XAMPP restart and development/frontend content retrieval succeeded with port 13312 stopped.

| Purpose | Database | Account |
|---|---|---|
| Development | `seraphine_portfolio_dev_x3306_20261116` | `seraphine_x3306_dev` |
| Development migration | Same development database | `seraphine_x3306_migrate` |
| Isolated test | `seraphine_portfolio_test_x3306_20261116` | `seraphine_x3306_test` |
| Disposable shadow | `seraphine_portfolio_shadow_x3306_20261116` | `seraphine_x3306_migrate` |

MariaDB 10.4.32, recovery mode 0, existing XAMPP binary/config/data directory. Runtime remains DML only; migration/test accounts have DDL only in their exact new schemas, escaped literal underscore grants, no global grants and no GRANT OPTION. No existing account was overwritten. System grant tables necessarily gained these new scoped service identities. No real ADMIN/SUPER_ADMIN account was created.

## Preservation and export

The initial working tree was clean. Required project checkpoints and Phase 6 incident/restoration/cutover records were reviewed. XAMPP was already running on 3306; the existing normal-mode recovered instance was started alongside it using its unchanged configuration.

All 14 source tables were readable and CHECK TABLE passed. Both source migration checksums matched repository SQL. Recovered counts: profile 1, experience 2, education 3, skills 6, certificates 3, site settings 1 = **16 application rows**. Users, sessions, audits, media, projects, achievements and messages were empty.

A new owner-restricted directory outside the repository was created without overwriting any existing backup:

`C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-16-xampp3306-01`

It contains the exact pre-migration environment, a private candidate environment, the fresh SQL export and export/import/pre-cutover verification records. Existing recovery/preservation/export directories were not modified by backup writes. Normal startup/shutdown changed only the running recovered instance's ordinary engine/log state; no source application records were written.

`recovered-development.sql`: **19,616 bytes**, SHA256 `c605533cdb90d637c44d57ce4b15fcc96334cd50e2eff6911fdaffcaf1733985`. Export used the existing scoped migration credentials, a consistent single-transaction logical dump, no table locks or DROP statements. It contains all schema definitions and the **full original two-row migration ledger**, including IDs/timestamps/checksums. Passwords were never printed or placed in process arguments. The file was reread and hash-verified before import. No physical InnoDB files were copied.

## Destination checks and import

Before import, the exact XAMPP process/config, port/data path, normal recovery mode, InnoDB support and root administration access were checked. The new diagnostic schema `seraphine_xampp_probe_20261116_a1` proved persistent InnoDB creation, a foreign-key relationship, transactional inserts and reads after reconnect. Both probe tables checked OK and remain as evidence; no database was dropped for cleanup.

One initial privilege-table gate stopped before creating any schema because a CHECK result was not exclusively OK; its full first result was not retained. Follow-up regular and extended checks returned OK. A later pre-restart check explicitly captured `mysql.db` warning `Size of datafile is: 20237 Expected: 16697`, followed by OK. Subsequent regular/extended checks and the immediately pre-shutdown checks returned only OK. No REPAIR, OPTIMIZE, privilege bypass, file replacement or destructive repair was attempted. The warning's root cause is unproven and is retained in the acceptance record; restart and grant-persistence checks were required rather than treating a transient OK as sufficient. MariaDB documents that [CHECK TABLE also updates Aria/MyISAM key statistics](https://mariadb.com/docs/server/reference/sql-statements/table-statements/check-table); it is not a strictly file-immutable diagnostic.

Provisioning refused any existing target schema or account. Three unique new databases and three new service identities were created. The verified full logical dump was imported only into the new empty development schema; standard dump session settings were confined to that import connection. Separate test and shadow schemas were built with the two existing reviewed Prisma migrations. No seed/reset was run against development and no source migration SQL/model changed.

Before changing the real environment, source/destination hashes matched for **every field of every row in all 14 tables**, including both full migration records, and SHOW CREATE TABLE definitions matched exactly. Repeated source scans matched the pre-export fingerprints. Six foreign keys had zero orphans. Test/shadow application tables were empty; completed migration checksums matched. Prisma validate, migration status and live-to-model comparisons passed for development/test/shadow; guarded migration replay in only the new empty shadow passed. After replay the shadow correctly has 13 empty application tables and no deployment ledger.

## Executed acceptance

| Check | Result |
|---|---|
| Source/destination all rows, DDL, migration history | PASS, 16 records plus 2 migration rows preserved exactly |
| Prisma validation, status, schema diffs, shadow replay | PASS before cutover and after normal restart |
| Real DB/auth/CMS integration | PASS, 11 + 18 + 14 scenarios, zero failures/skips; runner totals 12/19/15 include parent tests |
| Exact target guard regression | PASS; rejects mixed ports/accounts/schemas, nonlocal hosts, URL options, recovery mode and unexpected instance paths |
| Source suites | PASS, 7 structural/guard + 24 frontend + backend runner 31, zero failures/skips |
| Both TypeScript checks and complete production builds | PASS, exported published DTOs and matching prerender |
| Production artifacts | PASS, 4/4 |
| Compiled server/preservation/privacy/cache | PASS, 19 serving checks; all 16 rows also match original private extraction baseline |
| Post-restart consistency | PASS, 6 foreign keys / 5 domain checks / 17 unique indexes per schema, unchanged development data, empty test/shadow |
| Preserved historical offline backup | PASS, 229 files / 187,752,520 bytes and original environment verified; no overwrite |
| Actual development startup/frontend | PASS, real backend on 4000 and React/Vite on 5173, Chromium public-content fetch through frontend proxy, 6 published skills, zero page errors, both guest role routes redirect to login |
| Full authenticated browser acceptance | 17/19 passed; complete Chromium dashboard/CMS workflows, Firefox and WebKit passed. Chrome mobile-menu action and Edge screenshot timed out; failed results retained. Chrome focused rerun reached sign-in navigation but exceeded the unchanged 5-second assertion. Edge focused rerun also timed out waiting for public hydration. Both focused runs cleaned all test fixtures successfully. No complete Chrome/Edge compatibility pass is claimed. |
| Final privacy and inventory review | PASS: source/history/public bytes exclude old and new credentials; existing schema/table/engine inventories unchanged, all 14 dev row fingerprints/full ledger unchanged, test empty, fresh export hash and all non-URL environment bytes verified. Final mysql.db/global_priv checks return only OK. |

Actual browser versions: Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2, Chrome 157.0.8103.51, Edge 157.0.4341.60. The cause of the Chrome/Edge UI timeouts is unproven; no assertion or timeout was weakened to mark them passing. Database migration acceptance is complete, with this separate compatibility limitation.

The full browser report is `.cache/xampp3306-browser-full-01.json`. Its first PowerShell output-capture command used a terminating error preference, so an expected Vite proxy error interrupted shell output capture; the browser process itself finished and recorded all results and successful cleanup. Focused follow-ups capture stdout/stderr directly without changing application code, assertions or timeouts. The compatibility timeouts are not recorded as passes; they remain a separate UI acceptance limitation of this migration run.

Source test/Prisma CLI subprocesses required normal sandbox escalation because restricted Windows execution returned spawn EPERM. The first guard-test attempt failed to spawn; approved execution passed unchanged assertions. No dependency/lockfile change was made.

After confirming there were no external database clients (only internal system daemons), both instances received normal SQL SHUTDOWN. The destination restarted with its unchanged XAMPP `my.ini` and existing binary; all scoped credentials and content remained readable. The recovered server stays stopped as a preserved fallback. No DB process was force-terminated. The Windows native app-control pipe was unavailable, so Control Panel button clicks were not tested; the restart used the same actual XAMPP binary/configuration directly. Both application smoke-check processes were closed afterward.

Ignored QA evidence: `.cache/xampp3306-*.json`, source/type/build/browser logs, public development screenshot; standard database/compiled reports remain in `.cache/phase08-database.json` and `.cache/phase07-runtime.json`. Prior browser evidence was copied before running the new suite. QA caches are not backups. `.cache/xampp3306-final.json` and the restricted external `final-acceptance.json` record final migration acceptance and the failed browser checks explicitly. Private SQL/environments never enter Git.

## Boundaries and daily use

Open XAMPP Control Panel, start MySQL on 3306 if stopped, then run `npm run dev` (or the separate frontend/backend commands). See [current setup](XAMPP_SETUP.md). No normal-development action on port 13312 is required. Manual personal dashboard sign-in still requires separately authorized private account provisioning; tests use disposable identities only in the isolated test schema.

All existing databases remain present, including the damaged historical portfolio schemas. No unrelated project SQL writes, existing schema drops, resets, record replacements, InnoDB file transfers, real accounts, public push, deployment or automatic ZIP. Existing backup/recovery evidence is retained. Earlier level-6 transaction-freshness uncertainty and unexplained first-rehearsal Aria failure are not resolved by this migration. The port-13312 fallback is a point-in-time state and does not automatically mirror future XAMPP edits. Owner/launch/device/account/production gates remain separate.
