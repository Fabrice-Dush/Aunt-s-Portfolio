import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let html;
before(async () => {
  server = await createServer({
    root: fileURLToPath(new URL('../', import.meta.url)),
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
  });
  const { default: App } = await server.ssrLoadModule('/src/app/App.tsx');
  html = renderToStaticMarkup(createElement(App));
});
after(async () => { await server?.close(); });

test('rendered page has unique IDs and every local navigation target exists', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate IDs break navigation and ARIA references');
  const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
  assert.ok(anchors.length > 0);
  for (const anchor of anchors) assert.ok(ids.includes(anchor), `Missing anchor target: ${anchor}`);
  for (const match of html.matchAll(/aria-(?:controls|labelledby)="([^"]+)"/g)) {
    for (const id of match[1].split(' ')) assert.ok(ids.includes(id), `Missing ARIA target: ${id}`);
  }
  assert.match(html, /aria-label="Open navigation" aria-expanded="false"/);
});

test('rendered portfolio preserves identity, pending disclosures and section sequence', () => {
  assert.match(html, /Nyirarukundo/);
  assert.match(html, /Seraphine/);
  assert.match(html, /Water Treatment Plant Engineer/);
  assert.match(html, /PORTRAIT CONCEPT \/ OWNER APPROVAL PENDING/);
  assert.match(html, /TO VERIFY/);
  assert.match(html, /PROJECT CASE STUDIES \/ DETAILS PENDING/);
  assert.doesNotMatch(html, /href="(?:mailto:|tel:)/);
  const sections = [...html.matchAll(/<section id="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(sections, ['about', 'expertise', 'experience', 'education', 'projects', 'contact']);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
});

test('portrait uses existing local responsive assets with accessible description', () => {
  assert.match(html, /alt="Concept standing portrait[^\"]+awaiting her approval"/);
  assert.match(html, /width="1122" height="1402"/);
  assert.match(html, /fetchPriority="high"/);
  const images = [...new Set([...html.matchAll(/\/images\/[^\s",]+\.webp/g)].map(match => match[0]))];
  assert.equal(images.length, 2);
  for (const image of images) {
    assert.ok(existsSync(fileURLToPath(new URL(`../public${image}`, import.meta.url))), image);
  }
});
