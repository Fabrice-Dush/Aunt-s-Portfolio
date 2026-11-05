// Private read-only extraction from the explicitly authorized level-6 disposable clone.
// Does not load application .env, execute SQL dumps, create accounts or restore databases.
import mariadb from 'mariadb';
import { mkdir, writeFile, readFile, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const privateRoot = 'C:/Users/HP/Documents/Seraphine-Database-Recovery';
const output = path.join(privateRoot, '2026-11-04-level-6-extraction');
const expectedData = `${privateRoot}/2026-11-04-recovery-level-6/data/`.toLowerCase();
const qid = value => {
  if (!/^[a-zA-Z0-9_]+$/.test(value)) throw new Error('IDENTIFIER_GUARD');
  return '`' + value + '`';
};
const json = value => JSON.stringify(value, (_, v) => typeof v === 'bigint' ? { $bigint: String(v) } : v, 2);
const sha = value => createHash('sha256').update(value).digest('hex');
const rowHashes = rows => rows.map(row => sha(json(row))).sort();
const safeError = error => ({ code: error.code ?? 'VALIDATION_ERROR', errno: error.errno ?? null });
let connection;
const report = { recoveryMode: 6, globallyConsistent: false, warning: 'Redo was skipped; latest committed changes may be absent. Readable data is not proof of recovery.', schemas: [], failures: [] };
try {
  // A pre-existing extraction directory is never overwritten. Reject path redirects.
  for (let p = path.resolve(privateRoot); ; p = path.dirname(p)) {
    if ((await lstat(p)).isSymbolicLink()) throw new Error('OUTPUT_REPARSE_GUARD');
    if (path.dirname(p) === p) break;
  }
  connection = await mariadb.createConnection({ host: '127.0.0.1', port: 13309, user: 'root', password: '',
    connectTimeout: 5000, socketTimeout: 20000, dateStrings: true, autoJsonMap: false });
  const [instance] = await connection.query('SELECT @@datadir AS datadir, @@port AS port, @@innodb_force_recovery AS recoveryMode, @@read_only AS readOnly, @@version AS version');
  if (instance.datadir.replaceAll('\\', '/').toLowerCase() !== expectedData || Number(instance.port) !== 13309 || Number(instance.recoveryMode) !== 6 || Number(instance.readOnly) !== 1) throw new Error('ISOLATION_GUARD');
  await mkdir(output); // nonrecursive; EEXIST is intentional
  const schemas = await connection.query("SELECT SCHEMA_NAME AS name FROM information_schema.SCHEMATA WHERE SCHEMA_NAME NOT IN ('information_schema','performance_schema','mysql') ORDER BY SCHEMA_NAME");
  for (const { name: schema } of schemas) {
    const schemaDir = path.join(output, schema);
    await mkdir(schemaDir);
    const result = { schema, tables: [], foreignKeys: [], uniqueIndexes: [], checks: [], migrations: null };
    const tables = await connection.query('SELECT TABLE_NAME AS name, TABLE_TYPE AS type, ENGINE AS engine FROM information_schema.TABLES WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME', [schema]);
    const metadata = {};
    for (const [label, sql] of Object.entries({
      columns: 'SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME, ORDINAL_POSITION',
      indexes: 'SELECT * FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX',
      constraints: 'SELECT * FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME, CONSTRAINT_NAME',
      keys: 'SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME, CONSTRAINT_NAME, ORDINAL_POSITION',
      checks: 'SELECT * FROM information_schema.CHECK_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=? ORDER BY TABLE_NAME, CONSTRAINT_NAME',
      references: 'SELECT * FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=? ORDER BY TABLE_NAME, CONSTRAINT_NAME',
    })) metadata[label] = await connection.query(sql, [schema]);
    await writeFile(path.join(schemaDir, 'structure-metadata.json'), json(metadata), { flag: 'wx' });
    const extracted = new Map();
    for (const table of tables) {
      const item = { table: table.name, type: table.type, engine: table.engine };
      const target = qid(schema) + '.' + qid(table.name);
      try {
        const create = await connection.query('SHOW CREATE TABLE ' + target);
        await writeFile(path.join(schemaDir, table.name + '.structure.json'), json(create), { flag: 'wx' });
        const pk = metadata.indexes.filter(x => x.TABLE_NAME === table.name && x.INDEX_NAME === 'PRIMARY').map(x => x.COLUMN_NAME);
        const order = pk.length ? ' ORDER BY ' + pk.map(qid).join(',') : '';
        const force = pk.length && table.type === 'BASE TABLE' ? ' FORCE INDEX (PRIMARY)' : '';
        const rows = await connection.query('SELECT * FROM ' + target + force + order);
        const content = json(rows);
        await writeFile(path.join(schemaDir, table.name + '.rows.json'), content, { flag: 'wx' });
        extracted.set(table.name, rows);
        item.rows = rows.length;
        item.sha256 = sha(content);
        const [count] = await connection.query('SELECT COUNT(*) AS n FROM ' + target);
        item.countMatchesScan = Number(count.n) === rows.length;
        const reverse = await connection.query('SELECT * FROM ' + target + force + (pk.length ? ' ORDER BY ' + pk.map(c => qid(c) + ' DESC').join(',') : ''));
        item.repeatScanMatches = json(rowHashes(rows)) === json(rowHashes(reverse));
        if (!item.countMatchesScan || !item.repeatScanMatches) report.failures.push({ schema, table: table.name, reason: 'SCAN_MISMATCH' });
      } catch (error) {
        item.error = safeError(error);
        report.failures.push({ schema, table: table.name, ...safeError(error) });
      }
      result.tables.push(item);
    }
    // Domain and relational validation is restricted to known project schemas.
    if (['seraphine_portfolio_dev', 'seraphine_portfolio_test'].includes(schema)) {
      const groups = new Map();
      for (const key of metadata.keys.filter(x => x.REFERENCED_TABLE_NAME)) {
        const id = key.TABLE_NAME + ':' + key.CONSTRAINT_NAME;
        groups.set(id, [...(groups.get(id) ?? []), key]);
      }
      for (const [name, keys] of groups) {
        const child = qid(schema) + '.' + qid(keys[0].TABLE_NAME);
        const parent = qid(keys[0].REFERENCED_TABLE_SCHEMA) + '.' + qid(keys[0].REFERENCED_TABLE_NAME);
        const notNull = keys.map(k => 'c.' + qid(k.COLUMN_NAME) + ' IS NOT NULL').join(' AND ');
        const join = keys.map(k => 'p.' + qid(k.REFERENCED_COLUMN_NAME) + '=c.' + qid(k.COLUMN_NAME)).join(' AND ');
        const [row] = await connection.query(`SELECT COUNT(*) AS n FROM ${child} c WHERE ${notNull} AND NOT EXISTS (SELECT 1 FROM ${parent} p WHERE ${join})`);
        result.foreignKeys.push({ name, orphans: Number(row.n) });
      }
      const uniques = new Map();
      for (const index of metadata.indexes.filter(x => Number(x.NON_UNIQUE) === 0)) {
        const id = index.TABLE_NAME + ':' + index.INDEX_NAME;
        uniques.set(id, [...(uniques.get(id) ?? []), index]);
      }
      for (const [name, indexes] of uniques) {
        const cols = indexes.map(x => qid(x.COLUMN_NAME));
        const target = qid(schema) + '.' + qid(indexes[0].TABLE_NAME);
        const [row] = await connection.query(`SELECT COUNT(*) AS n FROM (SELECT ${cols.join(',')} FROM ${target} WHERE ${cols.map(c => c + ' IS NOT NULL').join(' AND ')} GROUP BY ${cols.join(',')} HAVING COUNT(*)>1) duplicates`);
        result.uniqueIndexes.push({ name, duplicateGroups: Number(row.n) });
      }
      const checks = [
        ['profile', 'Profile_owner_only', "id='owner'"],
        ['sitesettings', 'SiteSettings_site_only', "id='site'"],
        ['experience', 'Experience_period', '(startYear IS NULL OR endYear IS NULL OR endYear>=startYear) AND (NOT isCurrent OR endYear IS NULL)'],
        ['project', 'Project_period', 'startYear IS NULL OR endYear IS NULL OR endYear>=startYear'],
        ['mediaasset', 'MediaAsset_positive_bytes', 'bytes>0'],
      ];
      for (const [table, name, predicate] of checks) {
        const [row] = await connection.query(`SELECT COUNT(*) AS n FROM ${qid(schema)}.${qid(table)} WHERE NOT (${predicate})`);
        result.checks.push({ name, definitionPresent: metadata.checks.some(c => c.CONSTRAINT_NAME === name), violations: Number(row.n) });
      }
      const history = extracted.get('_prisma_migrations') ?? [];
      result.migrations = [];
      for (const migration of history) {
        if (!/^\d{14}_[a-z0-9_]+$/.test(migration.migration_name)) throw new Error('MIGRATION_NAME_GUARD');
        const source = await readFile(new URL('../backend/prisma/migrations/' + migration.migration_name + '/migration.sql', import.meta.url));
        result.migrations.push({ name: migration.migration_name, finished: Boolean(migration.finished_at), rolledBack: Boolean(migration.rolled_back_at), appliedSteps: Number(migration.applied_steps_count), exactSourceChecksumMatches: sha(source) === migration.checksum,
          normalizedLineEndingsChecksumMatches: sha(source.toString('utf8').replaceAll('\r\n', '\n')) === migration.checksum });
      }
    }
    report.schemas.push(result);
    await writeFile(path.join(schemaDir, 'validation.json'), json(result), { flag: 'wx' });
    console.log(JSON.stringify({ schema, tables: result.tables.length, readableTables: result.tables.filter(t => t.rows !== undefined).length, failedTables: result.tables.filter(t => t.error).map(t => ({ table: t.table, ...t.error })) }));
  }
  await writeFile(path.join(output, 'extraction-validation.json'), json(report), { flag: 'wx' });
  const fileManifest = [];
  async function inventory(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const filename = path.join(dir, entry.name);
      if (entry.isDirectory()) await inventory(filename);
      else { const data = await readFile(filename); fileManifest.push({ path: path.relative(output, filename), bytes: data.length, sha256: sha(data) }); }
    }
  }
  await inventory(output);
  await writeFile(path.join(output, 'files-manifest.json'), json(fileManifest), { flag: 'wx' });
  console.log(JSON.stringify({ output, exportedFiles: fileManifest.length, failedTables: report.failures.length, globallyConsistent: false }));
} catch (error) {
  // No raw driver errors, row contents, hashes of passwords or SQL are logged.
  console.error(JSON.stringify({ extractionIncomplete: true, ...safeError(error) }));
  process.exitCode = 1;
} finally { if (connection) await connection.end(); }
