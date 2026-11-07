import { useEffect, useRef, useState } from 'react';
import { api, homeFor } from '../auth/api';
import type { User } from '../auth/api';
import Account from './Account';
import Administrators from './Administrators';
import { Cms, Synchronization } from './Cms';
import MediaLibrary from './MediaLibrary';
import Messages from './Messages';
import Settings from './Settings';
import { Badge, DataState, Icon, Pager, RouteLink, date, useData } from './components';

type Summary = { experience: number; education: number; skills: number; certifications: number; publishedProjects: number; draftProjects: number; messages: number; activeAdmins?: number; contentStates: { area: string; states: { status: string; _count: { _all: number } }[] }[]; media: { _count: { id: number }; _sum: { bytes: number | null } }; recentPublications: { action: string; entity: string; createdAt: string }[]; profile: { fullName: string; professionalTitle: string; status: string; city: string | null; country: string | null } | null };
const ownerAreas = [['overview', 'Overview'], ['profile', 'My profile'], ['experience', 'Work experience'], ['education', 'Education'], ['skills', 'Skills'], ['projects', 'Projects'], ['achievements', 'Achievements'], ['certifications', 'Certifications & training'], ['media', 'Media library'], ['messages', 'Messages'], ['settings', 'Portfolio settings'], ['account', 'Account settings']];
const technicalAreas = [['overview', 'System overview'], ['users', 'Administrator access'], ['portfolio', 'Portfolio overview'], ...ownerAreas.filter(([area]) => !['overview','account','messages'].includes(area!)), ['security', 'Security & audit'], ['status', 'System status'], ['messages', 'Messages'], ['account', 'My account']];

export default function Dashboard({ user, path, onSignedOut }: { user: User; path: string; onSignedOut: (message?: string) => void }) {
  const technical = user.role === 'SUPER_ADMIN'; const base = homeFor(user); const section = path.slice(base.length + 1) || 'overview';
  const areas = technical ? technicalAreas : ownerAreas; const title = [...ownerAreas, ...technicalAreas].find(item => item[0] === section)?.[1] ?? 'Page not found';
  const [menu, setMenu] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const heading = useRef<HTMLHeadingElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null); const sidebar = useRef<HTMLElement>(null);
  useEffect(() => { setMenu(false); heading.current?.focus(); window.scrollTo({ top: 0 }); }, [path]);
  useEffect(() => { if (menu) sidebar.current?.querySelector<HTMLAnchorElement>('nav a[href]')?.focus(); }, [menu]);
  function closeMenu() { setMenu(false); menuButton.current?.focus(); }
  async function logout() { setBusy(true); setError(''); try { await api('/auth/logout', 'POST', {}, false); onSignedOut(); } catch { setError('Sign-out could not complete. Please try again.'); } finally { setBusy(false); } }
  return <div className={'workspace ' + (technical ? 'operations' : 'studio')}><a className="dash-skip" href="#workspace-main">Skip to workspace</a>
    <aside ref={sidebar} className={'dash-sidebar ' + (menu ? 'is-open' : '')} id="workspace-navigation" onKeyDown={event => { if (event.key === 'Escape' && menu) { event.preventDefault(); closeMenu(); } }}><RouteLink to={base} className="dash-brand"><span>NS<i>.</i></span><span>{technical ? 'PLATFORM' : 'THE PORTFOLIO'}<b>{technical ? 'CONTROL' : 'STUDIO'}</b></span></RouteLink>
      <p className="dash-nav-caption">{technical ? 'TECHNICAL WORKSPACE' : 'MY WORKSPACE'}</p><nav aria-label="Workspace navigation">{areas.filter(([key]) => !user.mustChangePassword || key === 'account').map(([key, label]) => <RouteLink key={key} to={base + (key === 'overview' ? '' : '/' + key)} aria-current={section === key ? 'page' : undefined}><Icon name={key === 'users' ? 'profile' : key} /><span>{label}</span></RouteLink>)}</nav>
      <div className="dash-sidebar-bottom"><strong>{user.displayName}</strong><small>{technical ? 'TECHNICAL ADMINISTRATOR' : 'PORTFOLIO OWNER'}</small><button onClick={logout} disabled={busy}>{busy ? 'Signing out…' : 'Sign out'}</button></div>
    </aside><div className="dash-main"><header className="dash-top"><button ref={menuButton} className="dash-menu" aria-controls="workspace-navigation" aria-expanded={menu} onClick={() => setMenu(!menu)} onKeyDown={e => { if (e.key === 'Escape' && menu) closeMenu(); }}>Menu {menu ? '−' : '+'}</button><p>{technical ? 'SYSTEM' : 'MY STUDIO'} <span>/</span> {title.toUpperCase()}</p><a href="/" target="_blank" rel="noopener">View portfolio ↗</a></header>
      <main className="dash-content" id="workspace-main" tabIndex={-1}><div className="dash-page-heading"><p className="dash-eyebrow">{technical ? 'PLATFORM WORKSPACE' : 'YOUR PORTFOLIO SPACE'}</p><h1 ref={heading} tabIndex={-1}>{section === 'overview' ? technical ? <>Control with <em>clarity.</em></> : <>Your story,<br /><em>your way.</em></> : title}</h1>{section === 'overview' && <p>{technical ? 'Manage account access, review security activity and keep the portfolio in view.' : `Welcome, ${user.displayName}. Your professional journey, together in one calm workspace.`}</p>}</div>
        {error && <p className="dash-feedback error" role="alert">{error}</p>}
        {section === 'account' ? <Account user={user} onSignedOut={onSignedOut} /> : technical && section === 'users' ? <Administrators /> : technical && section === 'security' ? <Security /> : technical && section === 'status' ? <Status /> : section === 'overview' || technical && section === 'portfolio' ? <Overview technical={technical} base={base} /> : section === 'media' ? <MediaLibrary /> : section === 'messages' ? <Messages /> : section === 'settings' ? <Settings /> : ['profile','experience','education','skills','projects','achievements','certifications'].includes(section) ? <Cms key={section} section={section} /> : <section className="dash-panel"><p>This workspace page does not exist.</p><RouteLink to={base}>Return to overview</RouteLink></section>}
        <footer className="dash-footer"><span>NYIRARUKUNDO SERAPHINE</span><span>{technical ? 'SYSTEM OPERATIONS' : 'PORTFOLIO STUDIO'}</span><span>PRIVATE WORKSPACE</span></footer>
      </main></div></div>;
}
function Overview({ technical, base }: { technical: boolean; base: string }) {
  const data = useData<Summary>('/dashboard/summary');
  if (!data.result) return <DataState error={data.error} reload={data.reload} />;
  const summary = data.result.data;
  const tiles: [string, number, string][] = [['Work experience', summary.experience, 'experience'], ['Education', summary.education, 'education'], ['Skills', summary.skills, 'skills'], ['Certifications', summary.certifications, 'certifications'], ['Published projects', summary.publishedProjects, 'projects'], ['Draft projects', summary.draftProjects, 'projects']];
  return <>{technical ? <div className="ops-summary"><section className="dash-panel"><p className="dash-eyebrow">01 / ACCESS</p><strong className="dash-metric">{summary.activeAdmins}</strong><h2>Active administrators</h2><RouteLink to={base + '/users'}>Manage account access →</RouteLink></section><section className="dash-panel"><p className="dash-eyebrow">02 / SECURITY</p><Icon name="security" /><h2>Recorded activity</h2><p>Review actual account and session events.</p><RouteLink to={base + '/security'}>Open audit log →</RouteLink></section><section className="dash-panel"><p className="dash-eyebrow">03 / OPERATIONS</p><Icon name="status" /><h2>Application status</h2><p>Check API and database connectivity on demand.</p><RouteLink to={base + '/status'}>Check system status →</RouteLink></section></div> : <section className="studio-profile"><div className="studio-monogram" aria-hidden="true">NS<span>.</span></div><div><p className="dash-eyebrow">PROFILE / YOUR FIRST IMPRESSION</p><h2>A professional story starts with you.</h2>{summary.profile ? <><strong>{summary.profile.fullName}</strong><p>{summary.profile.professionalTitle} · {[summary.profile.city, summary.profile.country].filter(Boolean).join(', ')}</p><Badge value={summary.profile.status} /></> : <p>Your profile has not been added yet.</p>}<RouteLink to={base + '/profile'}>View your introduction ↗</RouteLink></div></section>}
    <div className="dash-two-columns"><section className="dash-panel"><p className="dash-eyebrow">{technical ? 'CONTENT INVENTORY' : 'YOUR PROFESSIONAL JOURNEY'}</p><h2>{technical ? 'Portfolio records' : 'Your story, at a glance'}</h2><div className="dash-inventory">{tiles.map(([label, count, area]) => <RouteLink key={label} to={base + '/' + area}><Icon name={area} /><span>{label}</span><strong>{count}</strong><span aria-hidden="true">↗</span></RouteLink>)}</div><p className="dash-muted">Counts reflect stored records. Drafts stay private. Open a section to edit and publish confirmed content.</p></section>
      <section className="dash-panel dash-guidance"><p className="dash-eyebrow">BEFORE PUBLICATION</p><h2>Bring the finishing details.</h2><p>Some information still needs the owner's review before the portfolio can be published.</p><ul><li>Confirm career dates</li><li>Confirm qualification and training details</li><li>Approve the synthetic portrait for public use</li><li>Authorize any public contact details</li></ul><RouteLink to={base + '/projects'}>Review project records →</RouteLink></section></div>
    <section className="dash-panel">
      <h2>Publication & storage</h2>
      <div className="dash-inventory">{summary.contentStates?.map(area => <div key={area.area}>
        <strong>{area.area === 'certificate' ? 'Certifications' : area.area === 'skill' ? 'Skills' : area.area.charAt(0).toUpperCase() + area.area.slice(1)}</strong>
        <p>{area.states.map(state => state._count._all + ' ' + state.status.toLowerCase()).join(' · ') || 'No records'}</p>
      </div>)}</div>
      <p>{summary.media?._count.id ?? 0} media files · {Math.ceil((summary.media?._sum.bytes ?? 0)/1024)} KB of main optimized files</p>
      <h3>Recent publications</h3>
      {summary.recentPublications?.length ? <ul>{summary.recentPublications.map((event,i) => <li key={i}>
        {event.entity} · {event.action === 'CONTENT_PUBLISH' ? 'published' : 'unpublished'} · {date(event.createdAt)}
      </li>)}</ul> : <p>No publication events yet.</p>}
    </section>
    <Synchronization />
  </>;
}
function Security() {
  const [page, setPage] = useState(1); const data = useData<{ id: string; action: string; createdAt: string; entityId: string | null; actor: { displayName: string } | null }[]>('/dashboard/security?page=' + page);
  if (!data.result) return <DataState error={data.error} reload={data.reload} />;
  return <section className="dash-panel"><p className="dash-eyebrow">SECURITY RECORD</p><h2>Content, account & session activity</h2><p>Recorded application events, newest first. Passwords and raw tokens are never recorded.</p>{!data.result.data.length ? <p className="dash-empty">No security events have been recorded yet.</p> : <ol className="dash-audit">{data.result.data.map(event => <li key={event.id}><Icon name="security" /><div><strong>{event.action.toLowerCase().replaceAll('_', ' ')}</strong><p>{event.actor?.displayName ?? 'Unauthenticated attempt'}</p>{event.entityId && <small>Record reference: {event.entityId}</small>}</div><time dateTime={event.createdAt}>{date(event.createdAt)}</time></li>)}</ol>}<Pager page={page} hasMore={data.result.pagination?.hasMore ?? false} onPage={setPage} /></section>;
}
function Status() {
  const data = useData<{ api: string; database: string; checkedAt: string; contentEditing: string; analytics: string }>('/dashboard/status');
  if (!data.result) return <DataState error={data.error} reload={data.reload} />;
  return <section className="dash-panel"><p className="dash-eyebrow">APPLICATION SIGNALS</p><h2>System status</h2><dl className="dash-details">{Object.entries(data.result.data).map(([key, value]) => <div key={key}><dt>{{ api: 'API', database: 'Database', checkedAt: 'Checked at', contentEditing: 'Content editing', analytics: 'Visitor analytics' }[key]}</dt><dd>{key === 'checkedAt' ? date(value) : value}</dd></div>)}</dl><button onClick={data.reload}>Check again</button><p className="dash-muted">This is an on-demand connection check. Infrastructure credentials, backups and deployment controls stay in protected local or hosting tools.</p></section>;
}
