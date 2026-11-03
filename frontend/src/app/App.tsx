import { Header } from '../shared/components/layout/Header';
import { Footer } from '../shared/components/layout/Footer';
import { HomePage } from '../features/portfolio/pages/HomePage';
import { profile } from '../features/portfolio/data/profile';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div className="development-banner">DEVELOPMENT PREVIEW <span aria-hidden="true">/</span> NOT YET PUBLISHED</div>
      <Header />
      <HomePage />
      <Footer name={profile.name} />
    </>
  );
}
