import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'vite';
import config from '../site.config.mjs';
import { siteMetadata, structuredData } from './seo.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist/index.html');
const metadata = siteMetadata(config);
// Build-only server entry stays in ignored cache, never in the public distribution.
await build({ root, publicDir: false, build: {
  ssr: 'src/entry-prerender.tsx', outDir: '.cache/prerender', emptyOutDir: true,
} });
const { render } = await import(pathToFileURL(resolve(root, '.cache/prerender/entry-prerender.js')).href);
const { html, person } = render();
const template = await readFile(output, 'utf8');
if (!template.includes('<!--app-html-->') || !template.includes('<!--site-meta-->')) {
  throw new Error('Prerender placeholders missing; run the complete frontend build');
}
const page = template.replace('<!--app-html-->', () => html)
  .replace('<!--site-meta-->', () => `${metadata.head}\n    <script type="application/ld+json">${structuredData(person)}</script>`);
await writeFile(output, page);
// Private routes have a neutral shell only. Never prerender authenticated data.
const assets = template.match(/<(?:script|link)[^>]+(?:src|href)="\/assets\/[^>]+>(?:<\/script>)?/g) ?? [];
const shell = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Private workspace | Seraphine</title>${assets.join('')}</head><body><div id="root"></div><noscript>JavaScript is required to sign in to this private workspace. <a href="/">Visit the public portfolio</a>.</noscript></body></html>`;
for (const route of ['login', 'admin', 'super-admin', ...['admin','super-admin'].flatMap(role => ['profile','experience','education','skills','projects','achievements','certifications','messages','account', ...(role === 'super-admin' ? ['users','security','status','portfolio'] : [])].map(area => role + '/' + area))]) {
  await mkdir(resolve(root, 'dist', route), { recursive: true });
  await writeFile(resolve(root, 'dist', route, 'index.html'), shell);
}
await writeFile(resolve(root, 'dist/robots.txt'), metadata.robots);
console.log(`Prerendered homepage: ${Buffer.byteLength(page)} bytes; indexing ${config.allowIndexing ? 'enabled' : 'disabled'}.`);
