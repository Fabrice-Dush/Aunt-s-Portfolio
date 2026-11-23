import { useEffect, useState } from 'react';

export function AppearanceControl({ scope = 'public' }: { scope?: 'public' | 'studio' | 'operations' }) {
  const [dark, setDark] = useState(scope === 'operations');
  useEffect(() => {
    const key = 'seraphine-appearance-' + scope;
    function apply(saved?: string | null) {
      let value = scope === 'operations' ? 'dark' : 'light';
      if (saved === undefined) { try { saved = localStorage.getItem(key); } catch { /* use default */ } }
      if (saved === 'dark' || saved === 'light') value = saved;
      // The head script already applied this preference before paint. Avoid
      // invalidating root styles again during hydration when it is unchanged.
      if (document.documentElement.dataset.theme !== value) document.documentElement.dataset.theme = value;
      if (document.documentElement.style.colorScheme !== value) document.documentElement.style.colorScheme = value;
      setDark(value === 'dark');
    }
    apply();
    const sync = (event: StorageEvent) => { if (event.key === key || event.key === null) apply(event.newValue); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [scope]);
  function toggle() {
    const value = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = value;
    document.documentElement.style.colorScheme = value;
    try { localStorage.setItem('seraphine-appearance-' + scope, value); } catch { /* session-only appearance */ }
    setDark(!dark);
  }
  return <button type="button" className="appearance-control" role="switch" aria-checked={dark} aria-label="Dark appearance" onClick={toggle}>
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></svg>
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z"/></svg>
  </button>;
}
