import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let server, Login, Dashboard, client;
before(async () => {
  server = await createServer({ root: fileURLToPath(new URL('../', import.meta.url)), server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' });
  Login = (await server.ssrLoadModule('/src/features/auth/Login.tsx')).default;
  Dashboard = (await server.ssrLoadModule('/src/features/dashboard/Dashboard.tsx')).default;
  client = await server.ssrLoadModule('/src/features/auth/api.ts');
});
after(async () => { await server?.close(); });
test('collection arrows preserve other pages when records share the default display order', async () => {
  const { collectionOrder } = await server.ssrLoadModule('/src/features/dashboard/order.ts');
  const rows = Array.from({ length: 25 }, (_, i) => ({ id: String(i).padStart(2, '0'), updatedAt: '2026-11-05T00:00:00.000Z', sortOrder: 0 }));
  const load = async page => ({ data: rows.slice((page - 1) * 20, page * 20), pagination: { page, hasMore: page * 20 < rows.length } });
  for (const [first, second] of [[5, 6], [20, 21]]) {
    const items = await collectionOrder(rows[first], rows[second], load);
    const changed = rows.map(row => ({ ...row, sortOrder: items.find(item => item.id === row.id).sortOrder }));
    changed.sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
    const expected = rows.map(row => row.id);
    [expected[first], expected[second]] = [expected[second], expected[first]];
    assert.deepEqual(changed.map(row => row.id), expected);
    assert.ok(items.every(item => item.expectedUpdatedAt === rows[0].updatedAt));
  }
  await assert.rejects(() => collectionOrder({ ...rows[5], updatedAt: 'stale' }, rows[6], load), /collection changed/);
  await assert.rejects(() => collectionOrder(rows[5], rows[6], async page => ({ data: rows.slice(0, 20), pagination: { page, hasMore: true } })), /over 100/);
});
const user = { id: 'test-only', displayName: 'TEST ONLY', email: 'test@example.invalid', role: 'ADMIN', mustChangePassword: false };
test('login exposes labelled email/password inputs, recovery guidance and no default credentials', () => {
  const html = renderToStaticMarkup(createElement(Login, { onLogin() {} }));
  assert.match(html, /type="email"/); assert.match(html, /type="password"/);
  assert.match(html, /autoComplete="current-password"/); assert.match(html, /authorized technical maintainer/);
  assert.doesNotMatch(html, /value="|Sign up|Register/);
});
test('owner and technical dashboard navigation preserve distinct identities and role boundaries', () => {
  const owner = renderToStaticMarkup(createElement(Dashboard, { user, path: '/admin', onSignedOut() {} }));
  const technical = renderToStaticMarkup(createElement(Dashboard, { user: { ...user, role: 'SUPER_ADMIN' }, path: '/super-admin', onSignedOut() {} }));
  assert.match(owner, /workspace studio/); assert.match(owner, /Your story/); assert.match(owner, /href="\/admin\/experience"/);
  assert.doesNotMatch(owner, /href="\/super-admin|Administrator access|Security &amp; audit/);
  assert.match(technical, /workspace operations/); assert.match(technical, /Control with/); assert.match(technical, /href="\/super-admin\/users"/);
  assert.match(owner, /role="status">Loading your information/); // No private data before fetch.
});
test('temporary-password accounts have only account navigation', () => {
  const html = renderToStaticMarkup(createElement(Dashboard, { user: { ...user, mustChangePassword: true }, path: '/admin/account', onSignedOut() {} }));
  assert.match(html, /replace your temporary password/); assert.match(html, /href="\/admin\/account"/);
  assert.doesNotMatch(html, /href="\/admin\/(experience|projects|messages)"/);
});
test('API refresh coalesces concurrent requests and retries only session failures', async () => {
  const originalFetch = globalThis.fetch; const originalWindow = globalThis.window;
  globalThis.window = new EventTarget();
  let refreshed = false, rotations = 0, calls = 0;
  globalThis.fetch = async (path, options) => {
    assert.equal(options.credentials, 'same-origin'); assert.equal(options.cache, 'no-store');
    if (path.endsWith('/auth/refresh')) { rotations++; refreshed = true; return new Response(null, { status: 204 }); }
    calls++;
    return new Response(JSON.stringify(refreshed ? { data: 'private result' } : { error: { code: 'UNAUTHENTICATED' } }), { status: refreshed ? 200 : 401 });
  };
  try {
    const values = await Promise.all([client.api('/dashboard/summary'), client.api('/dashboard/summary')]);
    assert.equal(rotations, 1); assert.ok(calls >= 4); assert.ok(values.every(value => value.data === 'private result'));
    let invalidCalls = 0;
    globalThis.fetch = async () => { invalidCalls++; return new Response(JSON.stringify({ error: { code: 'INVALID_CREDENTIALS', message: 'Current password is incorrect' } }), { status: 401 }); };
    await assert.rejects(() => client.api('/administrators', 'POST', {}), { code: 'INVALID_CREDENTIALS' });
    assert.equal(invalidCalls, 1, 'A wrong reauthentication password must not be replayed');
  } finally { globalThis.fetch = originalFetch; globalThis.window = originalWindow; }
});
test('all CMS editors expose labelled fields, real draft actions and no raw data editor',async()=>{
  const {Editor}=await server.ssrLoadModule('/src/features/dashboard/Cms.tsx');
  for(const section of ['profile','experience','education','skills','projects','achievements','certifications']){
    const html=renderToStaticMarkup(createElement(Editor,{section,row:null,onCancel(){},onSaved(){}}));
    assert.match(html,/Save draft/);assert.match(html,/Leave unknown years empty/);assert.doesNotMatch(html,/contentEditable|<pre|Prisma|SQL/);
    for(const id of [...html.matchAll(/for="([^"]+)"/g)].map(m=>m[1]))assert.ok(html.includes('id="'+id+'"'));
  }
});
