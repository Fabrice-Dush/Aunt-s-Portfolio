import type { NavigationLink } from './types';
export function Footer({ name, location, motto, links = [] }: { name: string; location: string; motto?: string | null; links?: readonly NavigationLink[] }) {
  return (
    <footer className="site-footer">
      <a className="footer-brand" href="#top" aria-label={`NS — ${name} — Back to top`}>NS<span>.</span></a>
      <span>{name}<small>Water Treatment Plant Engineer · {location}</small></span>
      <nav aria-label="Footer navigation">{links.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
      {motto && <p className="footer-motto">“{motto}”</p>}
    </footer>
  );
}
