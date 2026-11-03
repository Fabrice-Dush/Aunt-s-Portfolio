import { renderToString } from 'react-dom/server';
import App from './app/App';
import { profile } from './features/portfolio/data/profile';

export function render() {
  return {
    html: renderToString(<App />),
    person: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.name,
      jobTitle: profile.title,
      address: { '@type': 'PostalAddress', addressLocality: 'Kigali', addressCountry: 'RW' },
    },
  };
}
