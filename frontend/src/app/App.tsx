import { Header } from '../shared/components/layout/Header';
import { Footer } from '../shared/components/layout/Footer';
import { HomePage } from '../features/portfolio/pages/HomePage';
import { profile } from '../features/portfolio/data/profile';
import { publishedProjects } from '../features/projects/data/projects';
import type { NavigationLink } from '../shared/components/layout/types';

const navigation: readonly NavigationLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Expertise', href: '#expertise' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  ...(publishedProjects.length ? [{ label: 'Projects', href: '#projects' } as const] : []),
  { label: 'Training', href: '#training' },
  { label: 'Contact', href: '#contact' },
];

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div id="top" tabIndex={-1} className="development-banner">PRIVATE DESIGN REVIEW <span aria-hidden="true">/</span> NOT YET PUBLISHED</div>
      <Header links={navigation} />
      <HomePage />
      <Footer name={profile.name} location={profile.location} />
    </>
  );
}
