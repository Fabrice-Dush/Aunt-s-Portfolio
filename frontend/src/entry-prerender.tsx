import { renderToString } from 'react-dom/server';
import App from './app/App';
import type { PublicContent } from './features/portfolio/types';
export function render(content: PublicContent) {
  return { html: renderToString(<App initialContent={content} />), person: content.profile ? {
    '@context': 'https://schema.org', '@type': 'Person', name: content.profile.fullName, jobTitle: content.profile.professionalTitle,
    address: { '@type': 'PostalAddress', addressLocality: content.profile.city, addressCountry: content.profile.country },
  } : null };
}