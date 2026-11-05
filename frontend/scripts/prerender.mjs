import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'vite';
import { createHash } from 'node:crypto';
import config from '../site.config.mjs';
import { siteMetadata, structuredData } from './seo.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const distribution = process.env.PORTFOLIO_BUILD_TEST === '1' ? '.cache/test-public' : 'dist';
const output = resolve(root, distribution, 'index.html');
const snapshot = JSON.parse(await readFile(resolve(root, process.env.PORTFOLIO_BUILD_TEST === '1' ? '.cache/test-public-content.json' : '.cache/public-content.json'), 'utf8'));
const metadata = siteMetadata({ ...config, allowIndexing: config.allowIndexing && snapshot.data.settings?.allowIndexing === true });
// Build-only server entry stays in ignored cache, never in the public distribution.
await build({ root, publicDir: false, build: {
  ssr: 'src/entry-prerender.tsx', outDir: '.cache/prerender', emptyOutDir: true,
} });
const { render } = await import(pathToFileURL(resolve(root, '.cache/prerender/entry-prerender.js')).href);
const { html, person } = render(snapshot.data);
const template = await readFile(output, 'utf8');
if (!template.includes('<!--app-html-->') || !template.includes('<!--site-meta-->')) {
  throw new Error('Prerender placeholders missing; run the complete frontend build');
}
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const title = snapshot.data.settings?.siteTitle || snapshot.data.profile?.fullName || 'Professional portfolio';
const description = snapshot.data.settings?.description || snapshot.data.profile?.summary || '';
const page = template.replace('<!--app-html-->', () => html)
  .replace(/<title>.*?<\/title>/s, () => `<title>${escape(title)}</title>`)
  .replace(/(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*("\s*\/?>)/g, (_match,before,after) => before + escape(description) + after)
  .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*("\s*\/?>)/g, (_match,before,after) => before + escape(title) + after)
  .replace('<!--site-meta-->', () => `${metadata.head}\n    ${person ? `<script type="application/ld+json">${structuredData(person)}</script>` : ''}<script id="public-content" type="application/json">${structuredData(snapshot)}</script>`);
await writeFile(output, page);
await writeFile(resolve(root, distribution, '.publication.json'), JSON.stringify({ revision: snapshot.revision, htmlHash: createHash('sha256').update(page).digest('hex') }));
// Private routes have a neutral shell only. Never prerender authenticated data.
const assets = template.match(/<(?:script|link)[^>]+(?:src|href)="\/assets\/[^>]+>(?:<\/script>)?/g) ?? [];
const shell = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Private workspace | Seraphine</title>${assets.join('')}</head><body><div id="root"></div><noscript>JavaScript is required to sign in to this private workspace. <a href="/">Visit the public portfolio</a>.</noscript></body></html>`;
for (const route of ['login', 'admin', 'super-admin', ...['admin','super-admin'].flatMap(role => ['profile','experience','education','skills','projects','achievements','certifications','media','settings','messages','account', ...(role === 'super-admin' ? ['users','security','status','portfolio'] : [])].map(area => role + '/' + area))]) {
  await mkdir(resolve(root, distribution, route), { recursive: true });
  await writeFile(resolve(root, distribution, route, 'index.html'), shell);
}
await writeFile(resolve(root, distribution, 'robots.txt'), metadata.robots);
console.log(`Prerendered homepage: ${Buffer.byteLength(page)} bytes; indexing ${config.allowIndexing ? 'enabled' : 'disabled'}.`);
