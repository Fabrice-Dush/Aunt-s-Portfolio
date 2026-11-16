// Explicit workstation allowlist. Never infer fixture safety from a name suffix or an env flag.
const profiles = [
  { id: 'xampp3306', port: 3306, directories: ['c:/xampp/mysql/data/', '/xampp/mysql/data/'],
    databases: { development: 'seraphine_portfolio_dev_x3306_20261116', test: 'seraphine_portfolio_test_x3306_20261116', shadow: 'seraphine_portfolio_shadow_x3306_20261116' },
    accounts: { development: 'seraphine_x3306_dev', migration: 'seraphine_x3306_migrate', test: 'seraphine_x3306_test', shadow: 'seraphine_x3306_migrate' } },
  { id: 'recovered13312', port: 13312, directories: ['c:/users/hp/documents/seraphine-database-recovery/2026-11-05-rehearsal-02/data/'],
    databases: { development: 'seraphine_portfolio_dev', test: 'seraphine_portfolio_test', shadow: 'seraphine_portfolio_shadow' },
    accounts: { development: 'seraphine_dev', migration: 'seraphine_migrate', test: 'seraphine_test', shadow: 'seraphine_migrate' } },
];
const directory = value => value?.replaceAll('\\', '/').toLowerCase().replace(/\/?$/, '/');

export function localDatabaseTarget(value, kind) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'mysql:' || !['127.0.0.1', 'localhost'].includes(url.hostname)
      || !url.password || url.search || url.hash) throw new Error();
    for (const profile of profiles) for (const candidate of ['development', 'migration', 'test', 'shadow']) {
      const database = profile.databases[candidate === 'migration' ? 'development' : candidate];
      const user = profile.accounts[candidate];
      if ((!kind || kind === candidate) && Number(url.port) === profile.port && url.pathname === '/' + database && decodeURIComponent(url.username) === user) {
        return { profile: profile.id, kind: candidate, port: profile.port, database, user, directories: profile.directories, url };
      }
    }
  } catch { /* Only the static safe failure below may leave this boundary. */ }
  throw new Error('Refusing database operation: require an exact approved local server, schema and scoped account.');
}

export function assertLocalDatabaseIdentity(identity, target) {
  if (!identity || Number(identity.port) !== target.port || Number(identity.mode) !== 0
    || !/^10\.4\.32-MariaDB/.test(identity.version) || !target.directories.includes(directory(identity.directory))
    || identity.schemaName !== target.database || identity.account?.split('@')[0] !== target.user) {
    throw new Error('Refusing database operation: the approved local instance identity failed.');
  }
}
