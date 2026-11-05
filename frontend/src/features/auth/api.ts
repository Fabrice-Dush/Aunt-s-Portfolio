export type User = { id: string; email: string; displayName: string; role: 'ADMIN' | 'SUPER_ADMIN'; isActive: boolean; mustChangePassword: boolean; createdAt: string };
export type Result<T> = { data: T; pagination?: { page: number; hasMore: boolean }; sessionId?: string };
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
let refreshing: Promise<void> | undefined;
async function send(path: string, method: string, body?: unknown, headers: Record<string,string> = {}) {
  return fetch('/api/v1' + path, { method, credentials: 'same-origin', cache: 'no-store',
    headers: { 'X-Portfolio-Request': '1', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
}
async function rotate() {
  // Coordinate refresh across tabs where Web Locks is supported. Recheck access after acquiring.
  const operation = async () => {
    if ((await send('/auth/me', 'GET')).ok) return;
    const response = await send('/auth/refresh', 'POST', {});
    if (!response.ok) throw new ApiError(401, 'UNAUTHENTICATED', 'Your session has ended. Please sign in again.');
  };
  if (navigator.locks) await navigator.locks.request('portfolio-session-refresh', operation);
  else await operation();
}
export async function api<T>(path: string, method = 'GET', body?: unknown, retry = true, headers: Record<string,string> = {}): Promise<Result<T>> {
  let response = await send(path, method, body, headers);
  const failedAuth = response.status === 401 ? await response.clone().json().catch(() => ({})) : null;
  if (failedAuth?.error?.code === 'UNAUTHENTICATED' && retry && !['/auth/login', '/auth/logout'].includes(path)) {
    try { await (refreshing ??= rotate().finally(() => { refreshing = undefined; })); response = await send(path, method, body, headers); }
    catch (error) { window.dispatchEvent(new Event('portfolio-session-ended')); throw error; }
  }
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    if (response.status === 401 && result.error?.code === 'UNAUTHENTICATED') window.dispatchEvent(new Event('portfolio-session-ended'));
    throw new ApiError(response.status, result.error?.code ?? 'REQUEST_FAILED', result.error?.message ?? 'Unable to load this information. Please try again.');
  }
  return response.status === 204 ? { data: undefined as T } : response.json();
}
export function navigate(path: string, replace = false) {
  if (!window.dispatchEvent(new Event('portfolio-before-navigate', { cancelable: true }))) return;
  window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
export const homeFor = (user: User) => user.role === 'SUPER_ADMIN' ? '/super-admin' : '/admin';
