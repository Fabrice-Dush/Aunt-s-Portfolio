import { test } from 'node:test';
import assert from 'node:assert/strict';
import config from '../site.config.mjs';
import { siteMetadata, structuredData } from '../scripts/seo.mjs';

test('review build stays unindexed and does not invent a domain', () => {
  const result = siteMetadata(config);
  assert.match(result.head, /noindex, nofollow/);
  assert.doesNotMatch(result.head, /canonical|og:url/);
  assert.match(result.robots, /Disallow: \//);
});

test('canonical URLs are validated and indexing requires a confirmed domain', () => {
  assert.throws(() => siteMetadata({ allowIndexing: true }));
  for (const canonicalUrl of ['http://example.invalid', 'https://user:secret@example.invalid',
    'https://example.invalid/?q=test', 'https://example.invalid/#test', 'https://localhost', 'https://example.invalid/path']) {
    assert.throws(() => siteMetadata({ canonicalUrl, allowIndexing: false }));
  }
  const result = siteMetadata({ canonicalUrl: 'https://example.invalid', allowIndexing: true });
  assert.match(result.head, /rel="canonical" href="https:\/\/example.invalid\/"/);
  assert.match(result.robots, /Allow: \//);
});

test('structured content cannot terminate its JSON script element', () => {
  const source = { name: '</script><script>alert("test")</script>&' };
  const result = structuredData(source);
  assert.doesNotMatch(result, /<|>|&/);
  assert.deepEqual(JSON.parse(result), source);
});
