import { z } from 'zod';

const email = z.string().trim().toLowerCase().email().max(191);
const common = /^(password|qwerty|letmein|welcome|admin|seraphine|nyirarukundo|123456|abcdefgh)/i;
export const password = z.string().min(15).max(128)
  .refine(value => !common.test(value) && new Set(value).size >= 8, 'Choose a longer, less predictable passphrase');
export const loginInput = z.strictObject({ email, password: z.string().min(1).max(128) });
export const changePasswordInput = z.strictObject({ currentPassword: z.string().min(1).max(128), newPassword: password });
export const createAdminInput = z.strictObject({ email, displayName: z.string().trim().min(1).max(150), temporaryPassword: password, currentPassword: z.string().min(1).max(128) });
export const recoveryInput = z.strictObject({ temporaryPassword: password, currentPassword: z.string().min(1).max(128) });
export const statusInput = z.strictObject({ isActive: z.boolean(), currentPassword: z.string().min(1).max(128) });
export const reauthInput = z.strictObject({ currentPassword: z.string().min(1).max(128) });
export const idInput = z.string().regex(/^[a-zA-Z0-9_-]{1,191}$/);
export const pageInput = z.strictObject({ page: z.coerce.number().int().min(1).max(9999).default(1) });
export const emptyInput = z.strictObject({});
