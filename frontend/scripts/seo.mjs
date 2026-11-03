export function siteMetadata(config) {
  let canonical = null;
  if (config.canonicalUrl) {
    const url = new URL(config.canonicalUrl);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash
      || url.pathname !== '/' || !url.hostname.includes('.') || url.hostname.endsWith('.localhost')) {
      throw new Error('canonicalUrl must be the real HTTPS homepage, without credentials, query or fragment');
    }
    canonical = url.href;
  }
  if (config.allowIndexing && !canonical) throw new Error('Indexing requires a confirmed canonicalUrl');
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  const head = [
    `<meta name="robots" content="${config.allowIndexing ? 'index, follow' : 'noindex, nofollow'}" />`,
    ...(canonical ? [`<link rel="canonical" href="${escape(canonical)}" />`, `<meta property="og:url" content="${escape(canonical)}" />`] : []),
  ].join('\n    ');
  return {
    head,
    robots: `User-agent: *\n${config.allowIndexing ? 'Allow: /' : 'Disallow: /'}\n`,
  };
}

export function structuredData(value) {
  // Prevent data from ever terminating a script element, including future CMS text.
  return JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026');
}
