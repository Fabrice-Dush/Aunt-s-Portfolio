"""Create and verify a complete source ZIP, excluding private/generated files.

Run from any directory: python scripts/package-project.py <absolute-output.zip>
The output must be in the repository's parent directory and must not exist.
Python 3 is needed for packaging only, not application development.
"""
from pathlib import Path
import hashlib
import os
import re
import sys
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent.parent
EXCLUDED_DIRS = {
    'node_modules', '.git', 'handoff-private', 'dist', 'coverage', '.vite',
    '.cache', '.npm-cache', '__pycache__', '.aws', '.codex', '.agents', '.idea',
}
SECRET_SUFFIXES = {'.pem', '.key', '.pfx', '.p12', '.sqlite', '.db', '.sql'}


def excluded(path):
    parts = path.parts
    name = path.name.lower()
    return (
        any(part.lower() in EXCLUDED_DIRS for part in parts)
        or path.as_posix().startswith('backend/src/generated/')
        or (name.startswith('.env') and not name.endswith('.example'))
        or name in {'.npmrc', '.netrc', 'credentials', 'credentials.json', '.ds_store'}
        or (Path(name).suffix in SECRET_SUFFIXES and not (
            len(parts) == 5 and parts[:3] == ('backend', 'prisma', 'migrations')
            and re.fullmatch(r'\d{14}_[a-z0-9_]+', parts[3]) and name == 'migration.sql'
        ))
        or name.endswith(('.zip', '.log', '.tsbuildinfo', '.pyc'))
    )


def main():
    if len(sys.argv) != 2:
        raise SystemExit('Usage: python scripts/package-project.py <absolute-output.zip>')
    output = Path(sys.argv[1]).resolve()
    if output.parent != ROOT.parent or output.suffix != '.zip':
        raise SystemExit('Output must be a ZIP in the repository parent directory')
    if output.exists():
        raise SystemExit('Refusing to overwrite an existing archive')
    if output.name.endswith('-complete.zip') and '**Status:** **COMPLETED' not in (ROOT / 'PROJECT_STATUS.md').read_text(encoding='utf-8'):
        raise SystemExit('Completion status must be verified and documented first')

    files = []
    for folder, dirs, names in os.walk(ROOT):
        relative = Path(folder).relative_to(ROOT)
        dirs[:] = sorted(d for d in dirs if not excluded(relative / d) and not (Path(folder) / d).is_symlink())
        for name in sorted(names):
            path = Path(folder) / name
            rel = path.relative_to(ROOT)
            if path.is_symlink() or excluded(rel):
                continue
            if path.suffix.lower() == '.sql':
                sql = path.read_text(encoding='utf-8')
                if re.search(r'\b(?:INSERT\s+INTO|REPLACE\s+INTO|IDENTIFIED\s+BY|CREATE\s+USER|GRANT)\b', sql, re.I):
                    raise SystemExit(f'Migration contains data/account statements; review {rel} before packaging')
            # Fail closed on high-confidence credential markers; do not print their values.
            if path.suffix.lower() in {'.md', '.json', '.ts', '.tsx', '.js', '.mjs', '.html', '.yml', '.yaml', '.txt'}:
                content = path.read_text(encoding='utf-8')
                if re.search(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}', content):
                    raise SystemExit(f'Potential credential found; review {rel} before packaging')
            files.append((path, rel.as_posix()))

    required = {
        'package-lock.json', 'README.md', 'AGENTS.md', 'PROJECT_STATUS.md', 'HANDOFF.md',
        'CHANGELOG.md', 'BACKLOG.md', 'ARCHITECTURE.md', 'DECISIONS.md', 'DESIGN_SYSTEM.md',
        'frontend/src/app/App.tsx', 'frontend/src/features/portfolio/pages/HomePage.tsx',
        'frontend/src/shared/styles/global.css', 'frontend/test/render.test.mjs',
        'backend/src/server.ts', 'backend/.env.example',
        'backend/src/routes/index.ts', 'backend/src/routes/health.routes.ts',
        'backend/src/controllers/health.controller.ts', 'backend/src/controllers/api.controller.ts',
        'backend/src/middlewares/errorHandler.ts', 'backend/src/middlewares/notFound.ts',
        'backend/prisma/schema.prisma', 'backend/prisma.config.ts', 'backend/test/http.test.mjs',
        'design/prototype/index.html', 'design/prototype/admin.html', 'design/prototype/super-admin.html',
        'docs/visual-approval/approved-homepage-mockup.png', 'docs/PHASE_03_VERIFICATION.md',
        'docs/PHASE_03_1_VERIFICATION.md', 'docs/PHASE_04_VERIFICATION.md',
        'frontend/src/entry-prerender.tsx', 'frontend/scripts/prerender.mjs',
        'frontend/scripts/seo.mjs', 'frontend/site.config.mjs',
        'frontend/src/features/certifications/components/Training.tsx',
        'frontend/src/features/projects/types.ts', 'frontend/test/build/production.test.mjs',
        'scripts/verify-phase04.mjs',
        'docs/PHASE_05_VERIFICATION.md', 'docs/API.md', 'docs/DATABASE_SCHEMA.md', 'docs/XAMPP_SETUP.md',
        'backend/src/config/database.ts', 'backend/src/services/content.service.ts',
        'backend/src/services/portfolio.service.ts', 'backend/src/services/private.service.ts',
        'backend/src/validators/content.ts', 'backend/prisma/seed.ts',
        'backend/prisma/migrations/20261103183624_phase05_foundation/migration.sql',
        'backend/prisma/migrations/migration_lock.toml',
        'backend/test/integration/database.test.mjs', 'backend/scripts/test-database.mjs',
        'backend/prisma/migrations/20261104090000_phase06_sessions/migration.sql',
        'backend/src/services/auth.service.ts', 'backend/src/services/accounts.service.ts',
        'backend/src/services/token.service.ts', 'backend/src/services/password.service.ts',
        'backend/src/middlewares/auth.ts', 'backend/scripts/provision.ts',
        'backend/scripts/auth-key.mjs', 'backend/test/auth.test.mjs',
        'backend/test/integration/auth.test.mjs', 'frontend/test/auth.test.mjs',
        'frontend/src/features/auth/Workspace.tsx', 'frontend/src/features/dashboard/Dashboard.tsx',
        'frontend/src/features/dashboard/dashboard.css',
        'docs/PHASE_06_VERIFICATION.md', 'docs/AUTHENTICATION.md',
        'docs/PHASE_06_DATABASE_INCIDENT.md', 'docs/PHASE_06_RESTORATION_REHEARSAL.md',
        'scripts/cutover-database.mjs', 'scripts/restart-database-rehearsal.ps1',
        'scripts/checkpoint-database-rehearsal.mjs', 'scripts/validate-database-rehearsal.mjs',
    }
    names = {name for _, name in files}
    if required - names:
        raise SystemExit(f'Missing required files: {sorted(required - names)}')

    # Compare local credentials with every eligible textual source without printing values.
    env_path = ROOT / 'backend/.env'
    if env_path.exists():
        from urllib.parse import urlsplit, unquote
        secrets = []
        for line in env_path.read_text(encoding='utf-8').splitlines():
            if '=' in line and line.split('=', 1)[0].endswith(('_SECRET', '_KEY', '_TOKEN')):
                value = line.split('=', 1)[1].strip().strip('\"\'')
                if value:
                    secrets.append(value.encode())
            if '=' in line and line.split('=', 1)[0].endswith('_URL'):
                value = line.split('=', 1)[1].strip().strip('\"\'')
                password = urlsplit(value).password
                if password and password != 'CHANGE_ME':
                    secrets.extend([password.encode(), unquote(password).encode()])
        for path, name in files:
            if any(secret in path.read_bytes() for secret in secrets):
                raise SystemExit(f'Local credential detected in eligible file: {name}')

    with zipfile.ZipFile(output, 'x', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path, name in files:
            archive.write(path, name)
    with zipfile.ZipFile(output) as archive:
        assert archive.testzip() is None, 'ZIP CRC verification failed'
        assert set(archive.namelist()) == names
        assert not any(excluded(Path(name)) for name in archive.namelist())
        for path, name in files:
            assert hashlib.sha256(archive.read(name)).digest() == hashlib.sha256(path.read_bytes()).digest(), name
        # Verify a real extraction. All paths are our own relative repository entries.
        cache = (ROOT / '.cache').resolve()
        cache.mkdir(exist_ok=True)
        assert cache.is_relative_to(ROOT.resolve())
        with tempfile.TemporaryDirectory(prefix='zip-verification-', dir=cache) as directory:
            extraction = Path(directory).resolve()
            assert extraction.is_relative_to(cache)  # constrain extraction and automatic cleanup
            for name in archive.namelist():
                assert (extraction / name).resolve().is_relative_to(extraction)
            archive.extractall(extraction)
            for path, name in files:
                assert hashlib.sha256((extraction / name).read_bytes()).digest() == hashlib.sha256(path.read_bytes()).digest(), name
    print(f'Verified {len(files)} files; CRC, required files, exclusions, extraction and every source hash match.')
    print(f'ZIP: {output}')
    print(f'Bytes: {output.stat().st_size}')
    print(f'SHA256: {hashlib.sha256(output.read_bytes()).hexdigest()}')


if __name__ == '__main__':
    main()
