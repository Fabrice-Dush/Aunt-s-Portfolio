import { useEffect, useState } from 'react';
import { api, homeFor } from '../auth/api';
import type { User } from '../auth/api';
import type { PublicContent } from '../portfolio/types';
import { HomePage } from '../portfolio/pages/HomePage';
import { Header } from '../../shared/components/layout/Header';
import { Footer } from '../../shared/components/layout/Footer';
import { portfolioNavigation } from '../portfolio/data/navigation';

export default function DesignPreview({ user }: { user: User }) {
  const [content, setContent] = useState<PublicContent | null>(null);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true, inFlight = false;
    const refresh = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const result = await api<PublicContent>('/cms/design-preview');
        if (!result.data.profile) throw new Error('A published profile is required for the design preview.');
        if (active) { setContent(result.data); setError(''); }
      } catch { if (active) { setContent(null); setError('The protected preview is unavailable. Sign in again or retry.'); } }
      finally { inFlight = false; }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30000);
    window.addEventListener('focus', refresh);
    window.addEventListener('pageshow', refresh);
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('pageshow', refresh); };
  }, [version]);
  const links = content ? portfolioNavigation(content) : [];
  return <div className="design-preview">
    <div id="top" tabIndex={-1} />
    <a className="skip-link" href="#main-content">Skip to preview content</a>
    <aside className="preview-notice" aria-label="Private demonstration status"><div><strong>Private portfolio demonstration</strong><p>Fictional entries are labeled SAMPLE. They are not Seraphine’s history and cannot be published from this preview.</p></div><a href={homeFor(user)}>Return to workspace</a></aside>
    {content?.profile ? <><Header links={links} scope={user.role === 'SUPER_ADMIN' ? 'operations' : 'studio'} /><HomePage content={content} profile={content.profile} preview /><Footer name={content.profile.fullName} motto={content.profile.motto} location="" links={links.filter(link => ['#experience', '#projects', '#education'].includes(link.href))} /></> : <main id="main-content" className="section" tabIndex={-1}>{error ? <><h1>Preview unavailable</h1><p role="alert">{error}</p><button onClick={() => setVersion(v => v + 1)}>Try again</button></> : <p role="status">Opening the protected design demonstration…</p>}</main>}
  </div>;
}
