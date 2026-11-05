import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
const path = new URL('../.env', import.meta.url);
const source = readFileSync(path, 'utf8');
const matches = [...source.matchAll(/^JWT_SECRET=(.*)$/gm)];
if (matches.length > 1) throw new Error('Duplicate JWT_SECRET entries; review locally.');
if (matches.length && matches[0][1].trim()) {
  if (!/^[a-f0-9]{128}$/i.test(matches[0][1].trim())) throw new Error('Existing JWT_SECRET is invalid; review locally without exposing it.');
  console.log('Existing signing key preserved.');
} else {
  const entry = 'JWT_SECRET=' + randomBytes(64).toString('hex');
  writeFileSync(path, matches.length ? source.replace(/^JWT_SECRET=.*$/m, entry) : source + '\n' + entry + '\n', { mode: 0o600 });
  console.log('Signing key saved in the ignored backend/.env. No key was displayed.');
}
