import { useEffect, useState } from 'react';
import { api, homeFor, navigate } from './api';
import type { User } from './api';
import Login from './Login';
import Dashboard from '../dashboard/Dashboard';
import '../dashboard/dashboard.css';

export default function Workspace() {
  const [user, setUser] = useState<User | null>(null); const [checking, setChecking] = useState(true);
  const [path, setPath] = useState(window.location.pathname.replace(/\/$/, ''));
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true;
    const ended = () => { setUser(null); };
    const pop = () => setPath(window.location.pathname.replace(/\/$/, ''));
    window.addEventListener('popstate', pop); window.addEventListener('portfolio-session-ended', ended);
    api<User>('/auth/me').then(result => { if (active) setUser(result.data); }).catch(error => {
      if (active && error.status !== 401) setError(error.message);
    }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; window.removeEventListener('popstate', pop); window.removeEventListener('portfolio-session-ended', ended); };
  }, []);
  useEffect(() => {
    document.title = user?.role === 'SUPER_ADMIN' ? 'System Operations | Seraphine' : 'Portfolio Studio | Seraphine';
    if (checking) return;
    // One effect owns authentication redirects; submit/session callbacks only update state.
    // Competing document replacements can cancel the newly opening workspace's requests.
    const home = user ? homeFor(user) : '/login';
    const target = !user ? '/login'
      : user.mustChangePassword ? home + '/account'
      : path === '/login' || !path.startsWith(home + '/') && path !== home ? home : null;
    if (target && path !== target) navigate(target, true);
  }, [checking, user, path]);
  if (checking) return <main className="auth-loading" role="status">Opening your workspace…</main>;
  if (error) return <main className="auth-loading"><h1>Workspace unavailable</h1><p role="alert">{error}</p><button onClick={() => window.location.reload()}>Try again</button><a href="/">Return to portfolio</a></main>;
  if (!user) return <Login onLogin={setUser} notice={notice} />;
  if (!path.startsWith(homeFor(user)) || (user.mustChangePassword && !path.endsWith('/account'))) return <main className="auth-loading" role="status">Opening your workspace…</main>;
  return <Dashboard user={user} path={path} onSignedOut={(message) => { setNotice(message ?? 'You have been signed out.'); setUser(null); }} />;
}
