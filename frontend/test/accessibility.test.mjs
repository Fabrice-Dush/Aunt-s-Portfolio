import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let server;
before(async () => {
  server = await createServer({
    root: fileURLToPath(new URL('../', import.meta.url)),
    cacheDir: fileURLToPath(new URL(`../.cache/vite-source/accessibility-${process.pid}`, import.meta.url)),
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom',
  });
});
after(async () => { await server?.close(); });

test('prerendered contact form cannot submit private message fields in a GET URL', async () => {
  const { ContactForm } = await server.ssrLoadModule('/src/features/portfolio/components/ContactForm.tsx');
  const html = renderToStaticMarkup(createElement(ContactForm));
  const form = html.match(/<form\b[^>]*>/)?.[0];
  assert.ok(form);
  assert.match(form, /method="post"/);
  assert.match(form, /action="\/api\/v1\/contact"/);
  assert.match(html, /<fieldset[^>]+disabled=""/);
  assert.match(html, /<button[^>]+disabled=""/);
  assert.match(html, /<noscript>Enable JavaScript to send a message/);
  assert.match(html, /name="senderEmail"/);
  assert.match(html, /name="content"/);
});

const luminance = color => {
  const channels = color.match(/../g).map(channel => parseInt(channel, 16) / 255)
    .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};
const contrast = (first, second) => {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};
test('shared light/dark control and text tokens retain accessible contrast', async () => {
  const styles = await readFile(new URL('../src/shared/styles/global.css', import.meta.url), 'utf8');
  const palettes = [styles.match(/:root \{([\s\S]*?)\}/)[1], styles.match(/:root\[data-theme=dark\] \{([\s\S]*?)\}/)[1]];
  for (const source of palettes) {
    const tokens = Object.fromEntries([...source.matchAll(/--([a-z-]+):\s*#([\da-f]{6})\b/g)].map(match => [match[1], match[2]]));
    for (const name of ['page','panel','surface']) {
      assert.ok(contrast(tokens.control, tokens[name]) >= 3, `Control against ${name}`);
      assert.ok(contrast(tokens.ink, tokens[name]) >= 4.5, `Text against ${name}`);
      assert.ok(contrast(tokens.muted, tokens[name]) >= 4.5, `Secondary text against ${name}`);
      assert.ok(contrast(tokens.blue, tokens[name]) >= 4.5, `Accent text against ${name}`);
    }
  }
});

test('contact text-link hover maintains AA contrast against its section background', async () => {
  const styles = await readFile(new URL('../src/shared/styles/global.css', import.meta.url), 'utf8');
  const hoverColor = styles.match(/\.text-link:hover\s*\{\s*color:\s*#([\da-f]{6})\s*;/i)?.[1];
  const sectionColor = styles.match(/\.section-contact\s*\{\s*background:\s*#([\da-f]{6})\s*;/i)?.[1];
  assert.ok(hoverColor && sectionColor, 'The hover foreground and contact surface must be explicit');
  assert.ok(contrast(hoverColor, sectionColor) >= 4.5, `${hoverColor} against ${sectionColor}`);
});

test('hero text-button hover maintains AA contrast throughout its background gradient', async () => {
  const styles = await readFile(new URL('../src/shared/styles/global.css', import.meta.url), 'utf8');
  const hoverColor = styles.match(/\.button-text:hover\s*\{\s*color:\s*#([\da-f]{6})\s*;/i)?.[1];
  const gradient = styles.match(/\.hero\s*\{\s*background:\s*linear-gradient\(([^;]+)\)/i)?.[1];
  assert.ok(hoverColor && gradient, 'The hover foreground and hero gradient must be explicit');
  const stops = [...gradient.matchAll(/#([\da-f]{6}|[\da-f]{3})\b/gi)]
    .map(match => match[1].length === 3 ? [...match[1]].map(channel => channel + channel).join('') : match[1]);
  assert.ok(stops.length >= 2);
  for (const stop of stops) assert.ok(contrast(hoverColor, stop) >= 4.5, `${hoverColor} against ${stop}`);
});
