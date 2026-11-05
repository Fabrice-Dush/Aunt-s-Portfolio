import argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { password } from '../validators/auth.js';

const options = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;
export function hashPassword(value: string) { return argon2.hash(password.parse(value), options); }
export async function verifyPassword(hash: string, value: string) {
  try { return await argon2.verify(hash, value); } catch { return false; }
}
// Unknown users still incur the same password verification cost. No known dummy credential.
let dummy: Promise<string> | undefined;
export function dummyHash() { return dummy ??= argon2.hash(randomBytes(32).toString('hex'), options); }
