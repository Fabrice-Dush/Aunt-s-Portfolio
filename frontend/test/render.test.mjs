import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { content } from './fixtures/public-content.mjs';

let server;
let html;
before(async () => {
  server = await createServer({
    root: fileURLToPath(new URL('../', import.meta.url)),
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, include: [] },
    appType: 'custom',
  });
  const { default: App } = await server.ssrLoadModule('/src/app/App.tsx');
  html = renderToStaticMarkup(createElement(App, { initialContent: content }));
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
  assert.match(html, /<details class="mobile-menu"><summary[^>]+aria-controls="mobile-nav"/);
  assert.doesNotMatch(html, /<details[^>]+\bopen(?:=|\s|>)/);
});

test('rendered portfolio preserves identity, pending disclosures and section sequence', () => {
  assert.match(html, /Nyirarukundo/);
  assert.match(html, /Seraphine/);
  assert.match(html, /Water Treatment Plant Engineer/);
  assert.match(html, /PORTRAIT CONCEPT \/ OWNER APPROVAL PENDING/);
  assert.doesNotMatch(html, /TO VERIFY|2015|2022|Kigali Independent University/);
  assert.doesNotMatch(html, /id="projects"|href="#projects"|PROJECT CASE STUDIES/);
  assert.match(html, /TEST ONLY skill/);
  assert.doesNotMatch(html, /Mobile laboratory testing|id="training"/);
  assert.doesNotMatch(html, /href="(?:mailto:|tel:)/);
  const sections = [...html.matchAll(/<section id="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(sections, ['about', 'expertise', 'contact']);
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

test('projects omit drafts and render approved content with optional fields safely', async () => {
  const { Projects } = await server.ssrLoadModule('/src/features/projects/components/Projects.tsx');
  const fixture = { id: 'test-only', name: 'Test fixture <not client content>', category: 'Test category',
    description: 'Test description', role: 'Test role', publicationApproved: false };
  assert.equal(renderToStaticMarkup(createElement(Projects, { projects: [] })), '');
  assert.equal(renderToStaticMarkup(createElement(Projects, { projects: [fixture] })), '');
  const rendered = renderToStaticMarkup(createElement(Projects, { projects: [{ ...fixture, publicationApproved: true,
    period: 'Test period', outcomes: ['Test outcome'], supportingInformation: 'Test context',
    images: [{ src: '/test-only.webp', alt: 'Test image', width: 600, height: 400 }],
  }] }));
  assert.match(rendered, /Test fixture &lt;not client content&gt;/);
  assert.match(rendered, /loading="lazy"/);
  assert.match(rendered, /Test period/);
  assert.match(rendered, /Test outcome/);
});

test('contact has no submission claim and only renders explicitly approved links', async () => {
  const { Contact } = await server.ssrLoadModule('/src/features/portfolio/components/Contact.tsx');
  const empty = renderToStaticMarkup(createElement(Contact, { contact: {} }));
  assert.doesNotMatch(empty, /<form|mailto:|tel:|message sent/i);
  const unapproved = renderToStaticMarkup(createElement(Contact, { contact: {
    email: { value: 'test@example.invalid', publicationApproved: false },
  } }));
  assert.doesNotMatch(unapproved, /test@example|mailto:/);
  const approved = renderToStaticMarkup(createElement(Contact, { contact: {
    email: { value: 'test@example.invalid', publicationApproved: true },
  } }));
  assert.match(approved, /href="mailto:test@example.invalid"/);
});

test('training does not invent certificate metadata and supports confirmed records', async () => {
  const { Training } = await server.ssrLoadModule('/src/features/certifications/components/Training.tsx');
  assert.equal(renderToStaticMarkup(createElement(Training, { entries: [] })), '');
  const area = renderToStaticMarkup(createElement(Training, { entries: [{ area: 'Test training' }] }));
  assert.match(area, /Test training/);
  assert.doesNotMatch(area, /undefined|null/);
  const certificate = renderToStaticMarkup(createElement(Training, { entries: [{ area: 'Test training',
    certificate: { title: 'Test award', issuer: 'Test issuer', year: 'Test year' },
  }] }));
  assert.match(certificate, /Test award/);
  assert.match(certificate, /Test issuer/);
});

test('verified career periods do not retain a provisional badge', async () => {
  const { Experience } = await server.ssrLoadModule('/src/features/experience/components/Experience.tsx');
  const rendered = renderToStaticMarkup(createElement(Experience, { positions: [{
    title: 'Test role', employer: 'Test employer', period: 'Test period', responsibilities: 'Test duty', provisional: false,
  }] }));
  assert.doesNotMatch(rendered, /TO VERIFY/);
});
test('database-shaped published content renders safely and unavailable content has no stale sections',async()=>{
  const {default:App}=await server.ssrLoadModule('/src/app/App.tsx');
  const hostile='<script>STORED_XSS_SENTINEL</script>';
  const rendered=renderToStaticMarkup(createElement(App,{initialContent:{...content,profile:{...content.profile,biography:hostile},projects:[{id:'test',slug:'test',title:'TEST ONLY project',summary:hostile,body:null,role:null,result:null,year:null,organization:null,startYear:null,endYear:null,featured:false,media:[]}],achievements:[{id:'test',title:'TEST ONLY milestone',description:hostile,year:null,project:null}],certifications:[{id:'test',title:'TEST ONLY training',issuer:null,year:null,credentialDetails:hostile,media:null}]}}));
  assert.doesNotMatch(rendered,/<script>STORED_XSS_SENTINEL/);assert.match(rendered,/&lt;script&gt;STORED_XSS_SENTINEL/);
  assert.match(rendered,/id="projects"/);assert.match(rendered,/id="achievements"/);assert.match(rendered,/id="training"/);
  const unavailable=renderToStaticMarkup(createElement(App));assert.match(unavailable,/Portfolio temporarily unavailable/);assert.doesNotMatch(unavailable,/TEST ONLY|id="about"|id="expertise"|\/images\//);
});
