import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = fileURLToPath(new URL('../../dist/', import.meta.url));
const html = readFileSync(join(dist, 'index.html'), 'utf8');

test('production contains meaningful portfolio HTML before JavaScript', () => {
  assert.doesNotMatch(html, /<!--app-html-->|<!--site-meta-->/);
  assert.match(html, /<main id="main-content"/);
  assert.match(html, /Water Treatment Plant Engineer/);
  for (const id of ['about', 'expertise', 'experience', 'education', 'training', 'contact']) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(html, /<details class="mobile-menu"><summary/);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.doesNotMatch(html, /mailto:|tel:|id="projects"|href="#projects"/);
  assert.match(html, /noindex, nofollow/);
  assert.doesNotMatch(html, /rel="canonical"|property="og:url"/);
  const person = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(person.name, 'Nyirarukundo Seraphine');
  assert.equal(person.jobTitle, 'Water Treatment Plant Engineer');
  assert.deepEqual(Object.keys(person).sort(), ['@context', '@type', 'address', 'jobTitle', 'name'].sort());
});

test('built assets resolve locally, portrait preload matches, and bundles stay small', () => {
  for (const match of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)) {
    assert.ok(existsSync(join(dist, match[1])), match[1]);
  }
  const image = html.match(/<img[^>]+>/)[0];
  const preload = html.match(/<link[^>]+as="image"[^>]+>/)[0];
  assert.equal([...html.matchAll(/as="image"/g)].length, 1);
  assert.equal(image.match(/sizes="([^"]+)"/)[1], preload.match(/imageSizes="([^"]+)"/i)[1]);
  assert.doesNotMatch(image, /loading="lazy"/);
  const assets = readdirSync(join(dist, 'assets'));
  let jsGzip = 0;
  let cssGzip = 0;
  for (const file of assets) {
    const bytes = readFileSync(join(dist, 'assets', file));
    // Budget initial public assets; lazy private UI must not be downloaded by guests.
    if (html.includes('/assets/' + file) && file.endsWith('.js')) jsGzip += gzipSync(bytes).length;
    if (html.includes('/assets/' + file) && file.endsWith('.css')) cssGzip += gzipSync(bytes).length;
  }
  assert.ok(jsGzip < 85_000, `JS gzip budget exceeded: ${jsGzip}`);
  assert.ok(cssGzip < 8_000, `CSS gzip budget exceeded: ${cssGzip}`);
});

test('public distribution contains only expected web files, no private source or build entry', () => {
  assert.deepEqual(readdirSync(dist).sort(), ['admin', 'assets', 'favicon.svg', 'images', 'index.html', 'login', 'robots.txt', 'super-admin']);
  assert.deepEqual(readdirSync(join(dist, 'images')).sort(), ['seraphine-portrait-small.webp', 'seraphine-portrait.webp']);
  for (const file of readdirSync(join(dist, 'assets'))) {
    assert.match(file, /^(index|Workspace)-[\w-]+\.(js|css)$/);
    assert.ok(statSync(join(dist, 'assets', file)).size > 0);
    assert.doesNotMatch(readFileSync(join(dist, 'assets', file), 'utf8'), /handoff-private|DATABASE_URL|test@example.invalid|Test fixture/);
  }
});

test('private shells contain no authenticated content and dashboard chunks are lazy', () => {
  const shell = readFileSync(join(dist, 'super-admin/security/index.html'), 'utf8');
  assert.match(shell, /noindex,nofollow/);
  assert.match(shell, /<div id="root"><\/div>/);
  assert.doesNotMatch(shell, /Account & session|passwordHash|<table|<h1/);
  const lazy = readdirSync(join(dist, 'assets')).filter(name => name.startsWith('Workspace-'));
  assert.equal(lazy.length, 2);
  for (const file of lazy) assert.ok(!html.includes(file), 'Private chunk must not be preloaded');
});
