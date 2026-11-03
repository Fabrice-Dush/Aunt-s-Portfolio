import { readFile, writeFile } from 'node:fs/promises';
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
await writeFile(resolve(root, 'dist/robots.txt'), metadata.robots);
console.log(`Prerendered homepage: ${Buffer.byteLength(page)} bytes; indexing ${config.allowIndexing ? 'enabled' : 'disabled'}.`);
