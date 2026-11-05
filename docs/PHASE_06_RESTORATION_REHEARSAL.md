# Phase 6 isolated restoration rehearsal - 2026-11-05

**Result: second clean rehearsal PASSED; subsequent separately authorized actual development cutover and final acceptance also PASSED. Phase 6 COMPLETED; Phase 7 NOT STARTED.** This report retains the rehearsal checkpoint and approved plan as history; current acceptance/lifecycle are in PHASE_06_DATABASE_INCIDENT.md, PHASE_06_VERIFICATION.md and XAMPP_SETUP.md. Failed first-rehearsal evidence remains retained and unexplained.

## Scope and isolation

The user authorized fresh normal-mode restoration rehearsals, logical import, disposable schema migration/replay and isolated integration tests. No active XAMPP restoration or application configuration cutover was authorized.

Existing MariaDB **10.4.32** binaries from `C:/xampp/mysql/bin` were used; no server package or Windows service was installed. Fresh system tables were initialized with `mysql_install_db.exe --datadir=<new-private-directory> --port=<isolated-port>`, without service installation or remote root access. Explicit configurations keep data, InnoDB/Aria files, logs, PID, temporary files and buffer-pool files private; bind to loopback; disable event/replication autostart and binary logging; and set `innodb_force_recovery=0` and `innodb_flush_log_at_trx_commit=1`.

| Instance | Private directory under `C:/Users/HP/Documents/Seraphine-Database-Recovery/` | Port | Outcome |
|---|---|---:|---|
| First rehearsal | `2026-11-05-rehearsal-01` | 13310 | Restore, checks and tests passed before shutdown; restart failed opening its new privilege tables |
| Small grant-persistence diagnostic | `2026-11-05-startup-canary-01` | 13311 | Fresh grant table, scoped grant, normal shutdown/restart and grant persistence passed |
| Second rehearsal | `2026-11-05-rehearsal-02` | 13312 | Full restore and tests passed; normal restart verified after grants, import, shadow replay and authentication workload |

Every SQL stage verifies the exact datadir, port, MariaDB version, recovery mode zero, foreign-key checks and unique checks before proceeding. Credentials were randomly generated, kept private and passed through process environment/parameterized SQL. `backend/.env` and its signing key were not changed. No real dashboard administrator was created.

## Restored data and schema strategy

The reviewed two existing Prisma migrations were deployed into three NEW schemas: `seraphine_portfolio_dev`, `seraphine_portfolio_test`, and `seraphine_portfolio_shadow`. Recovered application JSON records were then inserted transactionally with foreign keys enabled and parameterized values. The old SQL dump was retained as evidence and was not executed. Recovered `_prisma_migrations` records were checked against source checksums, but were not imported over fresh deployment history. Fresh migration IDs/timestamps truthfully describe the new deployment.

| Schema | Restored tables | Application records | Migration records | Validation |
|---|---:|---:|---:|---|
| Development | 14 | 16 | 2 | All recovered fields and structures match; every table readable and CHECK TABLE OK |
| Test | 14 | 0 | 2 | Empty application state preserved; every table readable and CHECK TABLE OK |
| Shadow after Prisma replay | 13 application tables | 0 | 0 | Rebuilt solely from reviewed migrations; drift comparison passed |

The shadow initially received both migrations through deploy. Prisma's later disposable shadow reset/replay leaves the 13 application tables without a deployment ledger; this is expected ephemeral replay state, not lost development/test history.

The 16 development records comprise profile **1**, experience **2**, education **3**, skills **6**, certificates **3**, and site settings **1**. All other application tables are empty. Every exported field, including IDs, values, dates and publication/verification states, matched after import, after shadow replay/restart, after test cleanup and after authentication shutdown/restart. No seed replaced recovered content and no missing records were invented.

Each schema passed six foreign-key orphan checks, five explicit domain constraints and all unique/primary-key duplicate checks (18 groups in dev/test, 17 in replayed shadow). Column types, nullability and collation in dev/test match the exports. Both completed migration checksums match the reviewed repository files. No portfolio table returned error #1932.

Recovered `user` and `authsession` exports contain **zero rows**. No recovered sessions or real accounts were restored. Authentication tests generated only synthetic test credentials in memory and cleaned their recorded fixtures. Post-test and post-restart validation confirms zero users, sessions, audits and other application records in test. Any future recovered sessions must remain invalidated rather than trusted as active credentials.

## Executed checks

| Check | Result and evidence |
|---|---|
| Prisma validate | PASS |
| Migration deploy/status | PASS: both reviewed migrations, dev/test/shadow up to date before shadow replay |
| Live schema versus Prisma model | PASS: no difference for all three schemas |
| Migration-directory replay versus live datasource | PASS: no difference using only the new disposable shadow |
| Real database regression | PASS: 11 scenarios; runner 12 including parent; zero failures/skips |
| Phase 6 auth/authorization/session/dashboard HTTP integration | PASS: 18 scenarios; runner 19 including parent; zero failures/skips |
| Restart after grants, import, shadow replay and authentication | PASS on second rehearsal; normal mode and recovered rows verified after relevant restarts |
| Application with recovered development content | PASS after final restart: seven public API routes, publication filtering, eight dashboard read services, guest denial; zero development mutations/accounts |
| Unit/render/HTTP suites | PASS: 6 structure, 14 frontend, backend runner 22 including parent |
| TypeScript and production builds | PASS |
| Production artifact/privacy/budget suite | PASS: 4/4 |
| Runtime account scopes | PASS |
| Compiled public/private API and private shells | PASS: eight public/health endpoints; seven private guest denials and seven neutral private shells |

The second rehearsal reran the real database/auth suites because the first instance failed restart. Earlier successful unit/type/build/artifact/compiled checks were retained; only rehearsal scripts/documentation changed afterward. Final acceptance against the chosen actual development configuration remains a cutover gate. Browser visual/interaction/performance QA was not performed and remains on the agreed manual lists. The public React portfolio remains static-first; Phase 7 frontend/API content integration has not begun.

Private second-rehearsal evidence includes `validation-imported.json`, `validation-after-shadow.json`, `validation-final.json`, `validation-restarted.json`, `database-auth-tests.log`, `recovered-application.json`, migration/status/drift logs, checkpoint reports, console logs and protection reports. The first rehearsal retains the broader build/test evidence. None belongs in the public ZIP.

Final private `readiness-summary.json` records the acceptance boundary. The second rehearsal's `offline-evidence-manifest.json` covers **559 files / 491,847,860 bytes** across both stopped rehearsal directories and the small diagnostic instance, excluding the manifest itself. Every listed hash was reread and verified. Manifest SHA256: `4d4a9fe6330a2643a148e7f17e43f2c30bcc178dac843018914eb56ba0108344`. This is point-in-time private evidence, not a source ZIP or permission to promote either failed/recovery-mode instance.

## Failures and interpretation

1. **First-rehearsal restart failure:** Windows Application events confirmed normal shutdown completed. Subsequent startup initialized InnoDB in normal mode but then reported `Fatal error: Can't open and lock privilege tables: Wrong block size 0; Expected 8192`. Read-only offline Aria checks isolated a failing `mysql/db.MAI` check (utility exit 3221225620); the other 23 Aria system tables checked successfully. Table files were hash-checked before/after offline inspection and were unchanged. No repair, grant bypass, table replacement or InnoDB deletion was attempted. This newly initialized system-table problem is distinct from the original Missing MLOG_CHECKPOINT and replacement #1932 evidence. Its root cause is **unproven**; passing the second rehearsal does not explain or erase it. Retain the failed directory for diagnosis.
2. **Schema comparison artifact:** the first migration-directory-to-schema comparison reported PascalCase/lowercase table/FK spelling differences with Windows `lower_case_table_names=1`. Independent live-to-model comparisons all passed. Comparing replayed migrations to the actual live datasource under the same server casing rules also passed. No migration/model changes were made to suppress the comparison.
3. **Build harness error:** the first artifact run inherited `NODE_ENV=test`, creating a development-mode React bundle that exceeded the production budget. The harness was corrected to use production mode for build/artifact checks; the rebuilt artifacts passed 4/4. No application code or budget threshold was relaxed.
4. **Automated review interruption:** a combined restart/test command was not executed because approval review hit a usage limit, explicitly without an unsafe-action finding. At the user's continuation, the remaining restart and checks went through the normal approval path successfully. No bypass was used.

See [MariaDB's offline Aria checking guidance](https://mariadb.com/docs/server/clients-and-utilities/aria-clients-and-utilities/aria_chk) and [Windows system-table initialization](https://mariadb.com/docs/server/server-management/install-and-upgrade-mariadb/installing-mariadb/installing-system-tables-mariadb-install-db/mariadb-install-db-exe).

## Recovery limits and protected evidence

The logical import is internally valid and survives the tested normal shutdown/restarts. It does **not** prove that all transactions originally committed before corruption survived level-6 extraction. Level 6 skipped redo; no independent authoritative historical row baseline is available. No detected mismatch against the private exports establishes their completeness or freshness. The original shadow is still unreadable and has not been repaired; the new shadow was rebuilt instead. Unrelated databases and original MySQL account metadata have not been restored or business-validated.

Final hashes verify both original XAMPP directories, all three preservation trees and directory membership, XAMPP configuration, all 176 private extraction files, and unchanged `backend/.env`. Originals, preservation backups and exports were never used for writes. All diagnostic database processes were stopped normally at the final checkpoint; inspected ports 3306/13309/13310/13311/13312 were closed. No active XAMPP restoration, configuration cutover, physical-file merging or complete ZIP occurred. The existing review snapshot remains unchanged and predates this report.

## Reviewed cutover plan - subsequently authorized and executed

The least invasive route is to adopt the **already verified second normal-mode instance** as the dedicated local Seraphine development database, using the existing XAMPP binary and loopback port **13312**. This avoids writing to the shared, damaged XAMPP data directory or dropping its portfolio schemas. It changes the application's development connection configuration; it does not make XAMPP Control Panel's port-3306 instance healthy or manage the dedicated process through that panel.

Exact target configuration: `backend/.env` in this repository. Exact database target: `C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-rehearsal-02/data`, controlled by that directory's `rehearsal.ini`, recovery mode zero, port 13312. Only the three named portfolio schemas and their scoped service accounts are used. No production configuration, unrelated database or real administrator account is in scope.

The user subsequently explicitly approved this exact plan; it was executed successfully. The checklist below is retained as the reviewed plan, not an instruction to repeat cutover:

1. Keep application clients stopped. Create the currently unused private directory `C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-pre-cutover-01`; refuse it if it exists at execution time. Preserve the second rehearsal's complete stopped data directory there as `data`, its config as `rehearsal.ini`, and an exact private copy of `backend/.env` as `backend.env.private`, with verified file/directory manifests. Do not overwrite any existing backup.
2. Verify protected source/export hashes and private instance identity again. Start only this dedicated instance in normal mode, retaining its scoped random credentials. Provide explicit local startup/shutdown instructions; do not install a Windows service or change XAMPP's configuration.
3. Update only `DATABASE_URL`, `MIGRATION_DATABASE_URL`, `TEST_DATABASE_URL` and `SHADOW_DATABASE_URL` in local `backend/.env` to the dedicated port/schema/accounts using the private rehearsal credentials. Preserve the existing JWT key and every other setting. Never print credential values.
4. Verify the actual configured backend, migration history/drift, shadow replay, content, scoped grants and both dashboard APIs. Run the required final isolated DB/auth regression, unit/type/build/artifact checks, cleanup and normal shutdown/restart persistence. Refuse unknown/nonempty test data. Stop on new corruption or record mismatch.
5. Only after critical acceptance passes, update Phase 6 completion evidence and create/verify the requested complete ZIP with private data, backups, secrets, dependencies and generated artifacts excluded. Keep manual browser QA explicitly deferred; do not start Phase 7.

Risk: adopting an extracted historical state cannot recover skipped redo; the unexplained first rehearsal's Aria failure remains a reason for complete offline backup, verified restart and immediate stop on recurrence. Scope rollback: stop backend clients, restore the exact private pre-cutover `.env`, and gracefully stop only the identified dedicated instance. Leave all XAMPP originals and preservation/export files untouched. If its data must be rolled back, retain the failed dedicated directory and use the new verified offline snapshot under a separately reviewed path; never merge files or overwrite evidence. Restoring the prior `.env` restores the prior configuration, not the damaged database's health.

Rehabilitating the original shared port-3306 XAMPP instance is a separate, broader operation requiring its own reviewed plan and authorization covering unrelated databases and system accounts. It is not necessary for the dedicated development route above.
