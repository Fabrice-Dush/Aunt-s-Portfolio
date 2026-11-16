import test from 'node:test';
import assert from 'node:assert/strict';
import { localDatabaseTarget, assertLocalDatabaseIdentity } from './local-database-targets.mjs';

test('fixture allowlist rejects mixed server/schema/account tuples and development targets', () => {
  const value = 'mysql://seraphine_x3306_test:test-only@127.0.0.1:3306/seraphine_portfolio_test_x3306_20261116';
  const target = localDatabaseTarget(value, 'test');
  for (const invalid of [value.replace(':3306/', ':13312/'), value.replace('_test:', '_dev:'),
    value.replace('/seraphine_portfolio_test_', '/seraphine_portfolio_dev_'), value.replace('127.0.0.1', 'example.com'),
    value + '?database=other', value + '#other', value.replace('test-only@', '@')]) {
    assert.throws(() => localDatabaseTarget(invalid, 'test'));
  }
  const identity = { port: 3306, mode: 0, version: '10.4.32-MariaDB', directory: '\\xampp\\mysql\\data\\', schemaName: target.database, account: target.user + '@127.0.0.1' };
  assert.doesNotThrow(() => assertLocalDatabaseIdentity(identity, target));
  for (const changed of [{ port: 13312 }, { mode: 6 }, { directory: 'C:/unknown/data' }, { schemaName: 'seraphine_portfolio_dev_x3306_20261116' }, { account: 'root@localhost' }]) {
    assert.throws(() => assertLocalDatabaseIdentity({ ...identity, ...changed }, target));
  }
  const fallback = localDatabaseTarget('mysql://seraphine_test:test-only@127.0.0.1:13312/seraphine_portfolio_test', 'test');
  assert.equal(fallback.profile, 'recovered13312');
});
