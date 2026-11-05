import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { api, navigate } from '../auth/api';
import type { Result } from '../auth/api';

export function Icon({ name = 'overview' }: { name?: string }) {
  const paths: Record<string, string> = {
    overview: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M5 21v-3a7 5 0 0 1 14 0v3',
    experience: 'M3 7h18v14H3z M8 7V3h8v4 M3 12h18 M10 12v3h4v-3',
    education: 'M2 8l10-5 10 5-10 5z M6 10v7l6 3 6-3v-7',
    projects: 'M3 5h7l2 3h9v12H3z', skills: 'M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
    certifications: 'M12 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12 M8 13l-1 9 5-3 5 3-1-9',
    messages: 'M3 5h18v14H3z M3 6l9 7 9-7',
    account: 'M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4 M12 14v3',
    security: 'M12 2l8 3v6c0 6-8 11-8 11S4 17 4 11V5z M8 11l3 3 5-6',
    status: 'M2 12h5l3-8 4 16 3-8h5',
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] ?? paths.projects} /></svg>;
}
export function RouteLink({ to, children, ...props }: { to: string; children: ReactNode; className?: string; 'aria-current'?: 'page' }) {
  const click = (event: MouseEvent<HTMLAnchorElement>) => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) { event.preventDefault(); navigate(to); } };
  return <a href={to} onClick={click} {...props}>{children}</a>;
}
export function useData<T>(path: string) {
  const [result, setResult] = useState<Result<T> | null>(null); const [error, setError] = useState(''); const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true; setResult(null); setError('');
    api<T>(path).then(value => { if (active) setResult(value); }).catch(error => { if (active) setError(error.message); });
    return () => { active = false; };
  }, [path, version]);
  return { result, error, reload: () => setVersion(v => v + 1) };
}
export function DataState({ error, reload }: { error: string; reload: () => void }) {
  return error ? <div className="dash-panel"><p role="alert">{error}</p><button onClick={reload}>Try again</button></div> : <p className="dash-loading" role="status">Loading your information…</p>;
}
export function Pager({ page, hasMore, onPage }: { page: number; hasMore: boolean; onPage: (value: number) => void }) {
  return <nav className="dash-pager" aria-label="Results pages"><button disabled={page === 1} onClick={() => onPage(page - 1)}>← Previous</button><span>Page {page}</span><button disabled={!hasMore} onClick={() => onPage(page + 1)}>Next →</button></nav>;
}
export function Confirm({ title, children, onCancel, onConfirm, busy }: { title: string; children: ReactNode; onCancel: () => void; onConfirm: () => void; busy: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current!; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} className="dash-dialog" aria-labelledby="confirm-title" onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}><h2 id="confirm-title">{title}</h2>{children}<div className="dash-actions"><button onClick={onCancel} disabled={busy} autoFocus>Cancel</button><button className="dash-primary" onClick={onConfirm} disabled={busy}>{busy ? 'Saving…' : 'Confirm'}</button></div></dialog>;
}
export function Badge({ value }: { value: string }) { return <span className={'dash-badge ' + value.toLowerCase()}>{value.toLowerCase().replaceAll('_', ' ')}</span>; }
export function date(value: string) { return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }
