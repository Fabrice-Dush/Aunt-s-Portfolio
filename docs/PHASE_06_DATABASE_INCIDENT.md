# Phase 6 database incident — 2026-11-04

**Status: PORTFOLIO DEVELOPMENT RESTORED AND ACCEPTED. Phase 6 COMPLETED; Phase 7 NOT STARTED.** Original shared XAMPP files remain preserved/unrepaired; level-6 data freshness is still unproven.

**Final checkpoint - 2026-11-05:** Separately authorized dedicated development cutover completed after verified offline instance/environment backups. Only four local database URLs changed; JWT/unrelated bytes preserved. All normal-mode connection, migration/shadow, recovered-data/integrity, DB/auth/API/type/test/build/artifact and two workload restart gates passed. The adopted instance is running normally on loopback 13312. Originals, unrelated databases, preservation backups and all private exports remain unchanged. No real accounts or shared XAMPP repair. Recovery freshness, first-rehearsal Aria failure and deferred browser QA remain documented below. Phase 6 complete-source delivery excludes all private data and credentials.

This supersedes earlier instructions to restart XAMPP and immediately rerun verification. The user reported replacing the XAMPP data directory using its stock backup and copying database folders into it, followed by phpMyAdmin error #1932 (`seraphine_portfolio_dev.user` does not exist in engine). Earlier passing application/DB tests predate that replacement and do not establish current health.

## Final authorized development cutover - 2026-11-05

The user explicitly approved the rehearsal report's dedicated development route, requiring verified backups, exactly four URL changes, final acceptance and rollback on a critical failure. No broader shared-XAMPP repair was authorized or performed.

With all MariaDB processes stopped, the complete successful second-rehearsal directory was copied to the new owner-restricted `C:/Users/HP/Documents/Seraphine-Database-Recovery/2026-11-05-pre-cutover-01`. Its original **229 files / 187,752,520 bytes**, directory membership and source/copy hashes matched. The exact original environment is saved privately as `backend.env.private`; all backup hashes were reverified after acceptance. Windows ACL inheritance is disabled on the private snapshot root, allowing only the current owner, SYSTEM and Administrators. Snapshot-manifest SHA256: `65B830893F0BB242745937993A8B6AFF8FDE3A6C782B1EA16EC6FA01F1289EF1`. Later acceptance logs are stored separately under its `acceptance/` subdirectory; snapshot data/config/credentials remain unchanged.

The adopted database retains the verified private `2026-11-05-rehearsal-02/data` path and `rehearsal.ini`, existing XAMPP 10.4.32 binary, loopback port **13312** and normal recovery mode **0**. No data files were moved/merged, no Windows service installed and no shared XAMPP directory/config/account changed. Only DATABASE_URL, MIGRATION_DATABASE_URL, TEST_DATABASE_URL and SHADOW_DATABASE_URL lines in local `backend/.env` changed. Byte-level masking and parsed-setting comparisons prove JWT and every unrelated byte/setting remain unchanged; the final configured file matches the recorded authorized hash. Credentials were never printed. `.env` remains ignored by Git; all private snapshots/exports are outside source/ZIP.

All four actual configured scoped connections passed identity checks before and after restart. Prisma validate, dev/test status, all-schema model drift and reviewed-migrations-to-live shadow replay passed. Only the known empty disposable shadow was reset/replayed; its 13 empty application tables are expected replay state without a deployment ledger. Dev/test each retain two fresh completed migrations with matching source checksums.

Final real DB regression passed **11 scenarios** (runner 12); Phase 6 authentication/authorization/session/dashboard HTTP acceptance passed **18 scenarios** (runner 19), zero failures/skips. Synthetic credentials/users remained confined to the test schema and were cleaned. Final source suites passed 6 structural, 14 frontend and backend runner 22 tests; both TypeScript checks/builds, prerender, 4 production artifact/privacy/budget checks, runtime scopes and compiled public/private APIs/shells passed. The actual configured development application passed seven public content routes, eight dashboard read services, publication/privacy filtering and guest denial. No real dashboard administrator was provisioned.

Normal shutdown/restart was verified after the DB/auth workload and again after all compiled/application checks. Before each shutdown mysql.db/global_priv checked OK; only the exact dedicated process/config was used and it exited normally without forced termination. Each restart preserved all four access paths. Final table scans, exact exported-field comparisons, migration/column/relationship/domain/unique checks passed: **14 dev tables / 16 application records / 2 migrations**, **14 test tables / 0 application records / 2 migrations**, and **13 empty shadow application tables**. Every table was accessible without #1932. The earlier privilege-table problem did not recur in this adopted instance. Public portfolio and dashboard source/assets hash-match the complete pre-cutover baseline.

Final protection checks reverified the original data/data-old/stock-backup sources, all preservation copies and directory membership, XAMPP configurations and all **176 private extraction files** unchanged. Snapshot/environment backups were rehashed once more. The dedicated database is left running; lifecycle instructions are in XAMPP_SETUP.md. The preserved shared port-3306 XAMPP environment is not asserted healthy or repaired.

No critical final check failed, so rollback was not required. The exact rollback remains documented: stop application clients, verify the private snapshot/environment, restore only the original `.env`, and normally stop the identified dedicated instance. Do not overwrite evidence or merge physical files. That rollback restores prior configuration, not the old shared database's health.

**Accepted limits:** level-6 extraction skipped redo, so stable imported records and tested normal-mode durability cannot establish the latest original committed state. The first clean rehearsal's privilege-table failure remains unexplained; retain its files/logs and stop for diagnosis on recurrence. Manual browser/visual/cross-browser/performance checks remain deferred by agreement, not passed. Phase 6 is complete for the approved implementation and critical automated/development recovery scope; Phase 7, production deployment and real-account provisioning remain unauthorized.

## 2026-11-05 authorized clean restoration rehearsal (earlier checkpoint)

The separately authorized rehearsal used fresh system tables and isolated configs/ports with the existing MariaDB 10.4.32 binary. Reviewed Prisma migrations created new dev/test/shadow schemas; parameterized JSON import restored application records without executing the SQL dump, disabling foreign keys or importing old migration IDs. No recovered accounts or sessions exist in dev/test; none were trusted or restored. New scoped service-account passwords remain private. Local backend/.env and JWT signing key were preserved.

The first rehearsal (private 2026-11-05-rehearsal-01, port 13310) passed import, all row/constraint checks, Prisma validation/status/live drift, corrected shadow comparison, 11 DB + 18 auth scenarios, application-content smoke checks, unit/type/build/artifact and compiled API checks. After Windows-confirmed normal shutdown, restart failed opening privilege tables: Wrong block size 0; Expected 8192. Read-only offline Aria checks failed only for mysql/db.MAI (utility exit 3221225620); all other 23 checked Aria system tables passed. No repair or bypass was attempted. Its cause is not established and this directory remains private evidence.

A small independent fresh grant-persistence diagnostic on port 13311 passed normal restart. The second fresh rehearsal (2026-11-05-rehearsal-02, port 13312) then verified privilege tables and normal restart after each major stage: grants, migration/import, shadow replay and authentication workload. All stages passed. After the authentication restart, all 14 dev + 14 test tables again passed CHECK TABLE and exact exported-field comparisons; dev has 16 application rows and two completed migrations, test has only two completed migrations. Six relationships, five explicit domain checks and all unique/primary-key groups passed per schema. Replayed shadow has 13 empty application tables; its ephemeral migration ledger is absent as expected after Prisma replay. Every normal-mode portfolio table was accessible without #1932.

Prisma validate, all three pre-replay migration status/live-to-model comparisons and migration-directory-to-live shadow replay passed. The first comparison method exposed Windows table-name casing differences; the corrected server-to-server comparison and independent live-to-model checks agree, without changing migrations. The first artifact failure came from NODE_ENV=test leaking into the production build; correcting only the harness and rebuilding passed all four artifact checks. No application defect or security-budget change was required.

Rehearsal 02 reran real DB regression (11 scenarios, runner 12) and Phase 6 authentication/session/authorization/dashboard HTTP acceptance (18 scenarios, runner 19), all without failures/skips. Recorded synthetic fixtures were cleaned; test application tables remain empty. After final restart, seven public content routes and eight dashboard read services matched recovered content, publication filtering and guest denial; no dev data/accounts were written. Earlier successful broad source/build/API checks were retained rather than repeated without cause. Browser QA remains explicitly deferred.

All protected sources, preservation directories, XAMPP configs, 176 export files and backend/.env were rehashed unchanged after testing. All diagnostic processes stopped normally; ports 3306, 13309-13312 were closed. First-rehearsal failure evidence and level-6 freshness uncertainty remain material risks. No active restoration was performed. The detailed report specifies a proposed dedicated port-13312 development adoption, exact local URL changes, additional offline/.env snapshots and rollback, requiring separate user authorization. Shared XAMPP repair is outside that proposal.

## Confirmed filesystem and process evidence

The earlier session found `mysqld.exe` running as PID **3588**, executable `C:\xampp\mysql\bin\mysqld.exe`. The user subsequently stopped it in XAMPP. Independent process enumeration before preservation confirmed no `mysqld`/`mariadbd` process. The installed binary reports **MariaDB 10.4.32, Win64 AMD64**. Config is `C:\xampp\mysql\bin\my.ini`; the prior inspection identified port 3306 and active data/system/redo paths under `C:\xampp\mysql\data`.

Read-only inventory, while the replacement server was running (these are NOT verified backup counts):

| Directory | Role | Files | Total bytes | ibdata1 bytes |
|---|---|---:|---:|---:|
| `C:\xampp\mysql\data` | Current replacement | 262 | 45,574,934 | 12,582,912 (12 MiB) |
| `C:\xampp\mysql\data-old` | Original candidate | 263 | 118,216,843 | 79,691,776 (76 MiB) |
| `C:\xampp\mysql\backup` | Stock XAMPP backup, not a project backup | 137 | 40,362,193 | 12,582,912 (12 MiB) |

The original candidate contains project dev/test/shadow directories, project `.frm`/`.ibd` files, InnoDB system and redo files, and other unrelated databases. Preserve the entire directories, including unrelated databases and metadata. File presence does not establish readable rows or a consistent database. The prior search found no project logical dump in the inspected XAMPP tree; other locations have not been exhaustively searched.

Original `data-old\mysql_error.log` repeatedly reports, including log timestamp 2026-11-04 12:33:08:

```text
InnoDB: Missing MLOG_CHECKPOINT at 5786442 between the checkpoint 5769186 and the end 5786112.
InnoDB: Plugin initialization aborted with error Generic error
Unknown/unsupported storage engine: InnoDB
Aborting
```

Replacement log at 12:34:56 reports startup from checkpoint LSN 300288 and server start at LSN 300297 / transaction ID 170. These are log-local timestamps. Historical September assertions are separate evidence and must not be presented as the November failure cause.

## Interpretation and remaining uncertainty

The original log establishes failed InnoDB startup around redo/checkpoint processing. Level 6 demonstrates readable dev/test data when redo is bypassed, but the underlying cause and loss of recent changes remain unknown. No assertion is made that Prisma caused this incident.

A mismatch between copied table files and the replacement InnoDB dictionary is now supported by read-only SQL on the isolated replacement copy: table metadata lists 14 dev, 14 test and one shadow table, but every COUNT fails with #1932 and `INNODB_SYS_TABLES` has no entries for these schemas. MariaDB documents that the system tablespace stores the InnoDB dictionary. This confirms the replacement's missing engine registrations, while the reported copying sequence remains the likely explanation. Different ibdata1 sizes alone cannot prove corruption. See [MariaDB system tablespaces](https://mariadb.com/docs/server/server-usage/storage-engines/innodb/innodb-tablespaces/innodb-system-tablespaces).

Only isolated diagnostic servers have been started by the agent, with read-only queries/private logical exports. Recovery settings were changed only in fresh disposable working-copy configs under explicit authorization. No migrations, seeds, authentication mutations or database integration tests have been run during recovery. No original/active/preservation database files were deleted, replaced, merged, imported or repaired. See the level-6 shutdown note below; no diagnostic process remains.

## Preservation gate and script review

**Offline backups COMPLETE.** The user stopped MySQL; independent enumeration and repeated script guards verified process absence during copying. Entire directories were copied separately to the new private location below. These are preservation snapshots of the incident state, not claims of a clean shutdown or healthy restorable databases.

Reviewed `scripts/preserve-mariadb.ps1`; fixed its malformed block-comment delimiter, included hidden/system files in recursive copying, added directory membership comparisons and rejected XAMPP destinations and destination reparse ancestors. Existing guards reject running database processes, existing destinations, repository destinations, missing sources, source reparse points and insufficient disk space. It creates separate trees for all three directories, preserves configs privately, compares every file's source-before/source-after/copy SHA256, and writes private manifests plus a completion summary. It never deletes, starts/stops or restores anything. Keep MySQL stopped for the whole operation. An error or partial destination is not a successful backup; retain it for review and use a new destination for a retry.

The reviewed preservation script executed successfully. It verified file/directory membership and source-before/source-after/copy SHA256, and hash-checked copied configuration files. After diagnostic testing, every original and preservation file was rehashed against the manifests; all still match. No running MariaDB processes remained at the final check.

Private preservation root: `C:\Users\HP\Documents\Seraphine-Database-Recovery\2026-11-04-preservation-01`.

| Separate subtree | Files | Bytes | Manifest SHA256 |
|---|---:|---:|---|
| `current-data` | 262 | 45,574,934 | `E90D90862A475CE376BB6D895CF22AE96AED132D94AD8850D89A57AA16487A71` |
| `original-data-old` | 263 | 118,216,843 | `AB72CA8B68C4BB55DA11D09705A127C0645750B456949CCF0FBC9BD592BFFA85` |
| `xampp-stock-backup` | 137 | 40,362,193 | `2578FD06B154A7176EE7B6E4020F2F08DC6EED188F6202BBC4BDA790AA81401C` |

Each manifest contains per-file SHA256 and directory membership. `configuration/` holds copied MySQL/XAMPP configs; `preservation-summary.json` records the results. Keep all backups, configurations, crash dumps and any future logical exports outside the project/archive. Do not start a server against these preservation trees.

## Executed safe isolated diagnostics

`scripts/inspect-mariadb-copy.ps1` verifies a preservation manifest, copies to a new working directory, verifies all copied files/directories, and starts the installed 10.4.32 binary with an explicit isolated defaults file. It refuses existing destinations/processes, occupied diagnostic ports, reparse points and external `.isl` references. Original paths are never used for writes. Loopback binding, read_only=ON, disabled events/replication autostart/binlogging, separate temp/PID/error paths and recovery mode 0 were used. SQL read_only does not prevent internal crash-recovery writes, which are confined to the disposable clone.

- Original working directory: `C:\Users\HP\Documents\Seraphine-Database-Recovery\2026-11-04-normal-original-data-old`, port 13307, PID 19140. Startup exited with code 1 at log timestamp 14:33:54–14:33:55 and reproduced exactly `Missing MLOG_CHECKPOINT at 5786442 between the checkpoint 5769186 and the end 5786112`.
- Replacement working directory: `C:\Users\HP\Documents\Seraphine-Database-Recovery\2026-11-04-normal-current-data`, port 13308, PID 15860. SQL verified expected datadir/port/version/read_only=1/recovery_mode=0 before table queries. Fourteen dev and fourteen test tables, including `_prisma_migrations`, all failed with errno 1932; shadow contains only `user`, also errno 1932. Dictionary entries for all three schemas: zero. Existing local root access was used without creating or modifying any account. This diagnostic server was gracefully shut down through port 13308, and process absence was independently verified afterward.
- Offline `innochecksum.exe` 10.4.32, with no write/rewrite flags, passed for **82/82 files** in the original working copy: `ibdata1` and all `.ibd` files, including unrelated databases. These checks do not validate redo, transaction consistency, schema relations or actual row accessibility. See [MariaDB innochecksum](https://mariadb.com/docs/server/clients-and-utilities/administrative-tools/innochecksum).
- Diagnostic script's JSON-array handling was corrected after its guard refused execution before creating a clone. The replacement's optional buffer-pool cache filename produced an invalid-path warning inside its clone; corrected to a relative filename in the script. It did not affect the verified table/dictionary results. No preserved/original path was written.
- MariaDB issue [MDEV-13080](https://jira.mariadb.org/browse/MDEV-13080) records a historical similar message and fixes through 10.4.5. This installation is 10.4.32; that issue is not proof of the present cause, nor justification to delete redo logs or upgrade files in place.

## Authorized recovery experiment — 2026-11-04

The user explicitly authorized levels 1-6, fresh verified original-backup copies only, sequential escalation, documented review of levels 1-3 before 4-6, private extraction/validation only, and no active restoration or destructive SQL/file operations. Separate restoration authorization remains mandatory.

### Levels 1-3 reviewed before higher recovery tests

All three levels used separate new full copies under the private recovery root, each file hash verified before startup. Matching MariaDB 10.4.32, loopback port 13309, isolated writable paths and read_only=ON were used. Each process exited before the next was started.

| Level | Process | Finished UTC | Result |
|---|---:|---|---|
| 1 | 13824 | 2026-11-04 13:44:36 | Exit 1; identical Missing MLOG_CHECKPOINT; InnoDB unavailable |
| 2 | 21444 | 2026-11-04 13:44:53 | Exit 1; identical Missing MLOG_CHECKPOINT; InnoDB unavailable |
| 3 | 13816 | 2026-11-04 13:45:13 | Exit 1; identical Missing MLOG_CHECKPOINT; InnoDB unavailable |

Review: each reports missing checkpoint 5786442, checkpoint 5769186, end 5786112. None allowed SQL extraction. The reduced background/undo behavior in levels 1-3 did not resolve startup. Escalation to level 4 is necessary for the authorized diagnostic sequence, with no assertion that higher modes will produce consistent data. Working directories are 2026-11-04-recovery-level-1, -2 and -3; each contains its own startup-result.json, config and error log. Originals and preservation trees are not used for writes.

1. Use a **new full working clone from `original-data-old` preservation for each attempt**, hash checked before use; retain preservation/originals unchanged. Use the same 10.4.32 binary, loopback port 13309, separate config/data/log/temp/PID paths, disabled event/replication autostart and read_only=ON. Keep application clients disconnected and XAMPP stopped.
2. Try `innodb_force_recovery=1`, then increment one level at a time only if startup or extraction is impossible, up to **6** under the requested authorization. Stop increasing at the lowest level allowing extraction. Do not delete or regenerate redo/system/tablespace files, import/discard tablespaces, reset/drop schemas, or perform application writes.
3. Inspect actual tables and, if possible, create private logical exports from the isolated instance. Record per-table successes/failures and relevant migration/data/constraint evidence without exposing credentials or private rows. Stop and report if authentication or isolation cannot be verified. Each attempt must finish before the next instance starts.
4. Recovery mode does **not repair** the source. Depending on mode, errors, background work, undo or redo processing are bypassed. Modes 4–6 especially can expose stale or inconsistent rows/indexes; mode 5 can treat incomplete transactions as committed, and mode 6 skips redo. A readable export may still be incomplete or inconsistent and cannot be used as production truth without validation. Fresh clones contain the file-change risk; they do not remove logical-data risk. See [MariaDB recovery modes, version-specific behavior](https://mariadb.com/docs/server/server-usage/storage-engines/innodb/innodb-troubleshooting/innodb-recovery-modes).
5. This authorization covered **isolated extraction only**. Active XAMPP replacement/restoration, data reconstruction and any destructive repair require a separate concrete plan and approval after recovery evidence is available. No real administrator creation.

### Higher-level results and shutdown

Levels 4-6 were attempted only after the documented review above; each used a new independently verified full clone, never the previous attempt's files.

| Level | Process | Startup result UTC | Result |
|---|---:|---|---|
| 4 | 11436 | 2026-11-04 13:46:05 | Exit 1; same Missing MLOG_CHECKPOINT |
| 5 | 17840 | 2026-11-04 13:46:23 | Exit 1; same Missing MLOG_CHECKPOINT |
| 6 | 9604 | 2026-11-04 13:46:54 | Started, explicitly skipped redo; dev/test readable, shadow user fails errno 1030 |

Level 6 was the lowest level permitting extraction. SQL verified the exact private level-6 datadir, port 13309, recovery mode 6 and read_only=1 before extraction. Existing local root access was used; no account was created or changed. This was a data-salvage session, not a repaired server. Working copies are named `2026-11-04-recovery-level-1` through `-6` beside the preservation directory; retain their private configs/logs/results for evidence.

After extraction, mysqladmin shutdown succeeded and closed the diagnostic port, but PID 9604 did not exit. Its Win32 process executable and command line were checked against the exact level-6 config and startup record; only that disposable process was then stopped. Process absence was independently confirmed. The level-6 clone is not a clean-shutdown restoration candidate. Completed logical export files are outside that clone and were subsequently hash verified.

## Recovered data and validation

Private extraction directory: `C:\Users\HP\Documents\Seraphine-Database-Recovery\2026-11-04-level-6-extraction`.

`scripts/extract-mariadb-recovery.mjs` uses read-only SQL with an instance identity guard, refuses an existing export destination, and writes private row JSON, SHOW CREATE/column/index/constraint metadata and validation summaries. It loads no application secrets and never executes imports or DDL. Data from 77 of 78 visible non-system tables was read and exported: 28 portfolio dev/test tables plus 49 tables from other existing databases. The single shadow table failed; the script recorded the failure and did not attempt a repair. Unrelated tables have scan/count agreement evidence but have not received application-specific business/relationship validation. The mysql system schema/accounts were not logically exported; their complete physical files remain preserved.

| Development table/content | Recovered rows |
|---|---:|
| Profile | 1 |
| Experience | 2 |
| Education | 3 |
| Skill | 6 |
| Certificate | 3 |
| SiteSettings | 1 |
| User, AuthSession, AuditLog, Project, Achievement, ContactMessage, MediaAsset | 0 each |
| _prisma_migrations | 2 |

Development has **16 application records plus 2 migrations**; these aggregate counts match the documented pre-incident baseline. Test has **zero application records plus 2 migrations**. There are no recovered real dashboard accounts. Matching counts cannot rule out a stale field value or lost update.

Validation performed separately on dev and test:

- All 14 tables readable; COUNT agrees with full primary-key scan; repeat reverse-primary-key scans have matching row hashes.
- Six foreign-key relationships each: zero orphans. Eighteen primary/unique indexes each: zero duplicate groups. Nullable keys were handled according to SQL semantics.
- Five explicit migration domain CHECKs each are present and satisfied (singleton profile/settings IDs, valid experience/project periods, positive media bytes). Other metadata, including the AuditLog JSON check, is retained privately.
- All extracted project record fields passed non-null, length and enum checks: 185 fields in dev and 16 in test, including migration rows. No row values were printed or placed in repository documentation.
- Both `20261103183624_phase05_foundation` and `20261104090000_phase06_sessions` have completed migration records, no rollback, one applied step and checksums matching the exact repository migration files in both schemas.
- Read-only Prisma 7.10.1 `migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code` returned **No difference detected / exit 0** for dev and test. Process-scoped URLs targeted only port 13309; backend/.env was not edited. This command did not replay migrations or modify shadow.
- Native mysqldump completed a private, non-restored dev/test SQL export without table locks, add-drop statements or application writes. Its 28 CREATE TABLE definitions and 20 INSERT rows match the independently extracted dev/test inventory. No SQL import/round-trip validation has occurred.

Private `portfolio-dev-test.sql`: **32,760 bytes**, SHA256 `d09aabd6675b5ef3c17995bc27ebac96c738ee172682998593a1e59036aa0080`.

Private final manifest verifies **176 export/metadata/report files**, **970,198 bytes** (excluding the manifest itself). `final-files-manifest.json` SHA256: `B176E8302841BABFF1F8AA2F163A21C639DCED9AC030E062B0985BEE60A252DC`. Supporting evidence: `extraction-validation.json`, per-schema `validation.json`, and `final-project-validation.json`. Do not add any of these private files to the repository or ZIP.

### Incomplete data and limits

- Shadow contains only `user`, which fails errno 1030 even at level 6. No usable shadow rows were recovered; no complete shadow migration history exists in the extraction. The evidence is consistent with interrupted shadow replay, without proving why the server originally failed.
- Level 6 skips redo, and higher recovery modes bypass normal transaction handling. Stable scans and valid constraints do not prove the latest committed state, rollback correctness or absence of stale records. There is no earlier logical backup or independent authoritative row-by-row baseline available in the inspected evidence.
- Only the readable dev/test extract passed the stated read-only checks. The complete original instance is **not** proven consistent. No write/authentication integration tests were run against recovery mode, no active restoration occurred, and no phase-complete ZIP was created.
- After all attempts, every source and preservation file and directory membership was compared with the preservation manifests: current-data 262 files, original-data-old 263, stock-backup 137, all unchanged. Both original XAMPP config files still hash-match their preserved copies. All mysqld/mariadbd processes are absent.

## Historical post-extraction proposal - superseded by the authorized rehearsal above

1. Authorized extraction/testing is finished. Keep XAMPP stopped and preserve original/backup/export evidence. Do not put any recovery-mode directory into service or merge physical files. Do not repeat implementation or retry levels that already failed.
2. **Safest proposed next step, requiring authorization:** prepare a new clean, isolated MariaDB 10.4.32 validation instance outside XAMPP using normal recovery mode 0. Import only reviewed logical dev/test exports into new empty schemas, recreate narrowly scoped database service accounts privately using preserved configuration, and compare row hashes/schema/constraints with the extracted evidence. No seed replacement and no real dashboard administrators. This clean-instance rehearsal was not performed under the extraction-only authorization.
3. Treat the unreadable shadow as failed diagnostic state. After approval, create a new empty isolated shadow schema and replay the reviewed migrations there; do not reuse or reset the preserved corrupted shadow. Run normal-mode integrity checks, scoped connection tests and required isolated auth/MariaDB acceptance; check test data before the runner deploys migrations. Record any failure or mismatch before proceeding.
4. Review any freshness uncertainty with the user. Before an active cutover, account for all unrelated databases and mysql service-account/system metadata; a portfolio-only success does not authorize replacing a shared XAMPP data directory. Seek specialist recovery or additional backups if missing committed changes matter or validation fails. Do not silently reconstruct missing records.
5. Only after the isolated rehearsal is healthy, present a specific reversible active restoration/cutover and rollback plan and obtain the user's **separate active-database authorization**. Retain originals and verified backups unchanged. No active restoration is authorized now.
6. Phase 6 remains IN PROGRESS until normal-mode health, dev/test/shadow consistency and outstanding authentication tests pass. Then complete remaining build/API checks and delivery evidence, preserving manual browser QA debt. The complete ZIP is conditional on those gates; Phase 7 and real administrator creation remain unauthorized.

## Delivery checkpoint

Retain `seraphine-portfolio-phase-06-review-snapshot.zip` in the repository parent. It is the prior implementation snapshot and does **not** contain this incident report or the revised preservation script. No new complete archive was produced. Current source changes remain in the workspace, including all inherited uncommitted Phase 6 implementation.
