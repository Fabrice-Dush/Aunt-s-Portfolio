"""Compare actual source/staged/history/build bytes with local secrets without printing them.

This is a scoped project check, not a general secret detector or a database backup.
"""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import argparse
import hashlib
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--staged', action='store_true')
parser.add_argument('--history', action='store_true')
args = parser.parse_args()

def git(*arguments):
    return subprocess.check_output(['git', *arguments], cwd=ROOT)

secrets = []
for line in (ROOT / 'backend/.env').read_text(encoding='utf-8').splitlines():
    if '=' not in line:
        continue
    key, value = line.split('=', 1)
    value = value.strip().strip('\"\'')
    if key.endswith(('_SECRET', '_KEY', '_TOKEN')) and value:
        secrets.append(value.encode())
    if key.endswith('_URL'):
        password = urlsplit(value).password
        if password and password != 'CHANGE_ME':
            secrets.extend([password.encode(), unquote(password).encode()])
assert secrets, 'Local credential comparison material is missing'

def permitted(name):
    path = Path(name)
    forbidden = {'handoff-private', '.private-media', '.cache', 'node_modules', '.git', 'dist', 'recovery-exports'}
    assert not any(part.lower() in forbidden for part in path.parts), 'Private/generated tracked path: ' + name
    assert not name.replace('\\', '/').startswith('backend/src/generated/'), 'Generated client tracked'
    assert not (path.name.startswith('.env') and not path.name.endswith('.example')), 'Real environment tracked'
    assert path.name.lower() not in {'.npmrc', '.netrc', 'credentials', 'credentials.json'}, 'Credential file tracked'
    if path.suffix.lower() == '.sql':
        assert re.fullmatch(r'backend/prisma/migrations/\d{14}_[a-z0-9_]+/migration.sql', name.replace('\\', '/')), 'Non-migration SQL tracked'
    else:
        assert path.suffix.lower() not in {'.zip', '.dump', '.db', '.sqlite', '.pem', '.key', '.pfx', '.p12'}, 'Private/backup suffix tracked'
    assert not name.endswith('.rows.json'), 'Recovery record export tracked'

def inspect(data, label):
    assert not any(secret in data for secret in secrets), 'Local credential found: ' + label
    assert not re.search(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----', data), 'Private key found: ' + label
    assert not re.search(rb'\$argon2id\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]{16,}\$[A-Za-z0-9+/]{20,}', data), 'Persisted password hash found: ' + label

if args.staged:
    names = git('diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z').decode().split('\0')[:-1]
else:
    names = sorted(set(git('ls-files', '-z').decode().split('\0')[:-1]
        + git('ls-files', '--others', '--exclude-standard', '-z').decode().split('\0')[:-1]))
for name in names:
    permitted(name)
    inspect(git('show', ':' + name) if args.staged else (ROOT / name).read_bytes(), name)

history_blobs = 0
if args.history:
    objects = git('rev-list', '--objects', '--all').decode().splitlines()
    process = subprocess.Popen(['git', 'cat-file', '--batch'], cwd=ROOT, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    try:
        for entry in objects:
            oid, _, name = entry.partition(' ')
            process.stdin.write((oid + '\n').encode()); process.stdin.flush()
            header = process.stdout.readline().decode().split()
            assert len(header) == 3 and header[1] != 'missing', 'History object unreadable'
            size = int(header[2]); data = process.stdout.read(size)
            assert len(data) == size and process.stdout.read(1) == b'\n', 'Incomplete history object'
            if header[1] == 'blob':
                if name:
                    permitted(name)
                inspect(data, 'history object ' + oid)
                history_blobs += 1
    finally:
        process.stdin.close(); process.wait()
    assert process.returncode == 0, 'History read failed'

public_files = [path for path in (ROOT / 'frontend/dist').rglob('*') if path.is_file()]
for path in public_files:
    inspect(path.read_bytes(), 'public build ' + str(path.relative_to(ROOT)))

baseline = json.loads((ROOT / '.cache/phase08-baseline.json').read_text(encoding='utf-8-sig'))
for name, expected in baseline['protectedHashes'].items():
    path = Path(name) if Path(name).is_absolute() else ROOT / name
    assert hashlib.sha256(path.read_bytes()).hexdigest() == expected, 'Protected file changed: ' + name
report = {'passed': True, 'mode': 'staged' if args.staged else 'source', 'sourceFiles': len(names), 'historyBlobs': history_blobs,
    'publicFiles': len(public_files), 'protectedHashesUnchanged': True, 'newArchiveCreated': False}
(ROOT / '.cache' / ('phase08-privacy-staged.json' if args.staged else 'phase08-privacy-source.json')).write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report))
