import { emitKeypressEvents } from 'node:readline';
import { z } from 'zod';
import { accountsService } from '../src/services/accounts.service.js';
import { disconnectDatabase, getDatabase } from '../src/config/database.js';
import { password as passwordSchema } from '../src/validators/auth.js';

// TTY-only input. Passwords never enter argv, environment variables, history or logs.
async function prompt(label: string, secret = false): Promise<string> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Use a local interactive terminal');
  process.stdout.write(label);
  emitKeypressEvents(process.stdin); process.stdin.setRawMode(true); process.stdin.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    const end = () => { process.stdin.off('keypress', onKey); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write('\n'); };
    const onKey = (text: string, key: { name?: string; ctrl?: boolean }) => {
      if (key.ctrl && key.name === 'c') { end(); reject(new Error('Cancelled')); }
      else if (key.name === 'return') { end(); resolve(value); }
      else if (key.name === 'backspace') { if (value.length) { value = value.slice(0, -1); if (!secret) process.stdout.write('\b \b'); } }
      else if (text && !key.ctrl && !/[\x00-\x1f\x7f]/.test(text) && value.length + text.length <= 191) { value += text; if (!secret) process.stdout.write(text); }
    };
    process.stdin.on('keypress', onKey);
  });
}
try {
  const operation = process.argv[2];
  if (!['bootstrap', 'recover', 'cleanup'].includes(operation ?? '')) throw new Error('Choose bootstrap, recover or cleanup');
  if (operation === 'cleanup') {
    if (await prompt('Delete expired session records only? Type CLEANUP: ') !== 'CLEANUP') throw new Error('Cancelled');
    // Retain revoked sessions until absolute expiration so replay detection remains possible.
    const result = await getDatabase().authSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    console.log(`Removed ${result.count} expired sessions.`);
  } else {
    const email = z.string().trim().toLowerCase().email().max(191).parse(await prompt('Authorized technical administrator email: '));
    const displayName = operation === 'bootstrap' ? z.string().trim().min(1).max(150).parse(await prompt('Display name: ')) : '';
    if (await prompt(`Type ${operation.toUpperCase()} to confirm local ${operation}: `) !== operation.toUpperCase()) throw new Error('Cancelled');
    const password = passwordSchema.parse(await prompt('New passphrase (hidden, 15–128 characters): ', true));
    if (password !== await prompt('Repeat passphrase (hidden): ', true)) throw new Error('Passphrases did not match');
    if (operation === 'bootstrap') await accountsService().bootstrap({ email, displayName, password });
    else await accountsService().recoverMaintainer(email, password);
    console.log('Account operation completed and audited. No credentials displayed.');
  }
} catch {
  console.error('Account operation did not complete. Check input, existing account status and local database configuration. No credentials were logged.');
  process.exitCode = 1;
} finally { await disconnectDatabase(); }
