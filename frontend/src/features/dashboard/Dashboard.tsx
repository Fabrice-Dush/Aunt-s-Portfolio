import { Fragment, useEffect, useRef, useState } from 'react';
import { api, homeFor } from '../auth/api';
import type { User } from '../auth/api';
import Account from './Account';
import Administrators from './Administrators';
import { Cms, Synchronization } from './Cms';
import MediaLibrary from './MediaLibrary';
import Messages from './Messages';
import Settings from './Settings';
import { Badge, DataState, Icon, Pager, RouteLink, date, useData } from './components';
import { AppearanceControl } from '../../shared/components/ui/AppearanceControl';
import { WaterArt } from '../../shared/components/ui/WaterArt';

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
    <aside ref={sidebar} className={'dash-sidebar ' + (menu ? 'is-open' : '')} id="workspace-navigation" onKeyDown={event => { if (event.key === 'Escape' && menu) { event.preventDefault(); closeMenu(); } }}><RouteLink to={base} className="dash-brand"><span>NS<i>.</i></span><span>{technical ? 'SUPER_ADMIN' : 'ADMIN'}<b>{technical ? 'System Operations' : 'Portfolio Studio'}</b></span></RouteLink>
      <p className="dash-nav-caption">{technical ? 'TECHNICAL WORKSPACE' : 'MY WORKSPACE'}</p><nav aria-label="Workspace navigation">{areas.filter(([key]) => !user.mustChangePassword || key === 'account').map(([key, label]) => <Fragment key={key}>{(key === 'profile' || key === 'messages' || technical && key === 'security' || key === 'account') && <p className="dash-nav-group">{key === 'profile' ? 'Portfolio content' : key === 'messages' ? 'Correspondence' : 'Access & settings'}</p>}<RouteLink to={base + (key === 'overview' ? '' : '/' + key)} aria-current={section === key ? 'page' : undefined}><Icon name={key === 'users' ? 'profile' : key} /><span>{label}</span></RouteLink></Fragment>)}</nav>
      <div className="dash-sidebar-bottom"><strong>{user.displayName}</strong><small>{technical ? 'TECHNICAL ADMINISTRATOR' : 'PORTFOLIO OWNER'}</small><button onClick={logout} disabled={busy}>{busy ? 'Signing out…' : 'Sign out'}</button></div>
    </aside><div className="dash-main"><header className="dash-top"><button ref={menuButton} className="dash-menu" aria-controls="workspace-navigation" aria-expanded={menu} onClick={() => setMenu(!menu)} onKeyDown={e => { if (e.key === 'Escape' && menu) closeMenu(); }}>Menu {menu ? '−' : '+'}</button><p>{technical ? 'System Operations' : 'Portfolio Studio'} <span>/</span> {title}</p><div className="dash-top-actions"><AppearanceControl scope={technical ? 'operations' : 'studio'} /><a href="/" target="_blank" rel="noopener">View portfolio <span className="visually-hidden">(opens in a new tab)</span></a><RouteLink to={base + '/account'} className="dash-avatar"><Icon name="profile" /><span className="visually-hidden">My account</span></RouteLink></div></header>
      <main className="dash-content" id="workspace-main" tabIndex={-1}><div className={'dash-page-heading' + (section === 'overview' ? ' dash-welcome' : '')}>{section === 'overview' && <WaterArt kind={technical ? 'security' : 'ribbon'} className="dash-header-art" eager />}<p className="dash-eyebrow">{technical ? 'SUPER_ADMIN / PROTECTED WORKSPACE' : 'WELCOME BACK'}</p><h1 ref={heading} tabIndex={-1}>{section === 'overview' ? technical ? <>System Operations<span className="heading-period">.</span></> : <>Manage your portfolio<br/>with <em>ease<span className="heading-period">.</span></em></> : title}</h1>{section === 'overview' && <p>{technical ? 'Technical oversight, access control, audit and operational management.' : `Welcome, ${user.displayName}. Keep your professional story up to date, all in one calm workspace.`}</p>}{section === 'overview' && technical && <ul className="operations-assurances"><li><Icon name="security" />Protected console</li><li><Icon name="account" />Restricted access</li><li><Icon name="portfolio" />Content controls</li></ul>}</div>
        {error && <p className="dash-feedback error" role="alert">{error}</p>}
        {section === 'account' ? <Account user={user} onSignedOut={onSignedOut} /> : technical && section === 'users' ? <Administrators /> : technical && section === 'security' ? <Security /> : technical && section === 'status' ? <Status /> : section === 'overview' || technical && section === 'portfolio' ? <Overview technical={technical} base={base} /> : section === 'media' ? <MediaLibrary /> : section === 'messages' ? <Messages /> : section === 'settings' ? <Settings /> : ['profile','experience','education','skills','projects','achievements','certifications'].includes(section) ? <Cms key={section} section={section} /> : <section className="dash-panel"><p>This workspace page does not exist.</p><RouteLink to={base}>Return to overview</RouteLink></section>}
        <footer className="dash-footer"><span>NYIRARUKUNDO SERAPHINE</span><span>{technical ? 'SYSTEM OPERATIONS' : 'PORTFOLIO STUDIO'}</span><span>PRIVATE WORKSPACE</span></footer>
      </main></div></div>;
}
function Overview({ technical, base }: { technical: boolean; base: string }) {
  const data = useData<Summary>('/dashboard/summary');
  if (!data.result) return <DataState error={data.error} reload={data.reload} />;
  const summary = data.result.data;
  return <>
    {technical ? <>
      <div className="ops-summary">
        <section className="dash-panel"><Icon name="profile"/><div><p className="dash-eyebrow">ACCOUNT ACCESS</p><strong className="dash-metric">{summary.activeAdmins}</strong><h2>Active administrators</h2><RouteLink to={base + '/users'}>Manage account access</RouteLink></div></section>
        <section className="dash-panel"><Icon name="security"/><div><p className="dash-eyebrow">AUDIT ACTIVITY</p><h2>Recorded activity</h2><p>Account, session and content events.</p><RouteLink to={base + '/security'}>Open audit log</RouteLink></div></section>
        <section className="dash-panel"><Icon name="status"/><div><p className="dash-eyebrow">APPLICATION SIGNALS</p><h2>System status</h2><p>Check API and database connectivity.</p><RouteLink to={base + '/status'}>Check system status</RouteLink></div></section>
      </div>
      <div className="dash-two-columns"><AccessOverview base={base}/><ActivityOverview base={base}/></div>
    </> : <PublishingOverview summary={summary} base={base} />}
    <div className="dash-two-columns">
      <section className="dash-panel"><p className="dash-eyebrow">CONTENT MANAGEMENT</p><div className="dash-row-title"><div><h2>Your content</h2><p>Manage the entries that make up your portfolio.</p></div><RouteLink to={base + '/media'} className="content-media-link">Media library</RouteLink></div><ContentTable summary={summary} base={base}/><p className="dash-muted">Counts reflect stored records. Drafts stay private. Open a section to edit and publish confirmed content.</p></section>
      <section className="dash-panel profile-summary"><p className="dash-eyebrow">YOUR INTRODUCTION</p><h2>A professional story<br/>starts with you.</h2>{summary.profile ? <><strong>{summary.profile.fullName}</strong><p>{summary.profile.professionalTitle}</p><p>{[summary.profile.city, summary.profile.country].filter(Boolean).join(', ')}</p><Badge value={summary.profile.status}/></> : <p>Your profile has not been added yet.</p>}<div className="dash-actions"><RouteLink to={base + '/profile'} className="content-media-link">Edit introduction</RouteLink><RouteLink to={base + '/messages'} className="content-media-link">Messages ({summary.messages})</RouteLink></div><p className="dash-muted">Publishing does not establish owner launch approval.</p></section>
    </div>
    <div className="dash-two-columns">
      <section className="dash-panel"><p className="dash-eyebrow">RECENT PUBLICATIONS</p><h2>Publication activity</h2>{summary.recentPublications?.length ? <ol className="publication-activity">{summary.recentPublications.map((event,i) => <li key={i}><Icon name="portfolio"/><div><strong>{event.entity} ? {event.action === 'CONTENT_PUBLISH' ? 'published' : 'unpublished'}</strong><time dateTime={event.createdAt}>{date(event.createdAt)}</time></div></li>)}</ol> : <p className="dash-empty">No publication events yet.</p>}<p>{summary.media?._count.id ?? 0} media files ? {Math.ceil((summary.media?._sum.bytes ?? 0)/1024)} KB of main optimized files</p><RouteLink to={base + '/media'}>Manage media</RouteLink></section>
      <section className="dash-panel dash-guidance"><p className="dash-eyebrow">BEFORE PUBLICATION</p><h2>Bring the finishing details.</h2><p>Review these details with the owner before launch.</p><ul><li>Confirm career dates</li><li>Confirm qualification and training details</li><li>Approve the synthetic portrait for public use</li><li>Authorize any public contact details</li></ul><RouteLink to={base + '/projects'}>Review project records</RouteLink></section>
    </div>
    <Synchronization />
  </>;
}
function AccessOverview({ base }: { base: string }) {
  const data = useData<User[]>('/administrators?page=1');
  return <section className="dash-panel"><p className="dash-eyebrow">OWNER ACCESS</p><div className="dash-row-title"><h2>Account management</h2><RouteLink to={base + '/users'} className="content-media-link">Manage accounts</RouteLink></div><p>Regular administrator access. Technical accounts use the local maintenance workflow.</p>{!data.result ? <DataState error={data.error} reload={data.reload}/> : data.result.data.length ? <div className="dash-table-scroll" role="region" aria-label="Regular administrators" tabIndex={0}><table className="dash-table"><thead><tr><th scope="col">Administrator</th><th scope="col">Role</th><th scope="col">Status</th></tr></thead><tbody>{data.result.data.slice(0,5).map(user => <tr key={user.id}><th scope="row"><strong>{user.displayName}</strong><span className="account-email">{user.email}</span></th><td>ADMIN</td><td><Badge value={user.isActive ? 'ACTIVE' : 'DISABLED'}/></td></tr>)}</tbody></table></div> : <p className="dash-empty">No regular administrators yet.</p>}<p className="dash-muted">Showing up to five accounts from the first page.</p></section>;
}
function ActivityOverview({ base }: { base: string }) {
  const data = useData<{ id: string; action: string; createdAt: string; actor: { displayName: string } | null }[]>('/dashboard/security?page=1');
  return <section className="dash-panel"><p className="dash-eyebrow">AUDIT RECORD</p><h2>Operations activity</h2><p>Recent recorded application events.</p>{!data.result ? <DataState error={data.error} reload={data.reload}/> : data.result.data.length ? <ol className="operations-activity">{data.result.data.slice(0,5).map(event => <li key={event.id}><Icon name="security"/><div><strong>{event.action.toLowerCase().replaceAll('_',' ')}</strong><p>{event.actor?.displayName ?? 'Unauthenticated attempt'}</p><time dateTime={event.createdAt}>{date(event.createdAt)}</time></div></li>)}</ol> : <p className="dash-empty">No recorded events yet.</p>}<RouteLink to={base + '/security'}>View audit records</RouteLink></section>;
}
function PublishingOverview({ summary, base }: { summary: Summary; base: string }) {
  const states = summary.contentStates.flatMap(area => area.states);
  const total = (status: string) => states.filter(state => state.status === status).reduce((sum, state) => sum + state._count._all, 0);
  return <>
    <section className="publishing-workflow" aria-label="Publishing workflow"><h2>A simple<br/><em>publishing workflow.</em></h2><ol>
      <li><Icon name="profile"/><div><strong>Create or edit</strong><span>Add content or update an entry.</span></div></li>
      <li><Icon name="projects"/><div><strong>Save a draft</strong><span>Keep changes private while you refine.</span></div></li>
      <li><Icon name="portfolio"/><div><strong>Preview</strong><span>Review your content before publishing.</span></div></li>
      <li><Icon name="status"/><div><strong>Publish</strong><span>Verify, publish, then update the website.</span></div></li>
    </ol></section>
    <div className="publication-tiles">{[['DRAFT','Drafts','Content you are still working on.'],['PUBLISHED','Published','Records marked as published.'],['ARCHIVED','Archived','Records kept out of public view.']].map(([status,label,description]) => <div className="publication-tile" key={status}><Icon name={status === 'DRAFT' ? 'projects' : status === 'PUBLISHED' ? 'status' : 'portfolio'}/><div><h2>{label} <strong>{total(status!)}</strong></h2><p>{description}</p></div></div>)}</div>
    <p className="publication-note">Publishing records and updating the public website are separate steps. <RouteLink to={base + '/settings'}>Review website settings</RouteLink>.</p>
  </>;
}
function ContentTable({ summary, base }: { summary: Summary; base: string }) {
  const routes: Record<string,string> = { profile: 'profile', experience: 'experience', education: 'education', skill: 'skills', project: 'projects', achievement: 'achievements', certificate: 'certifications' };
  return <div className="dash-table-scroll" tabIndex={0} role="region" aria-label="Content publication inventory"><table className="dash-table"><caption>Your content by publication state</caption><thead><tr><th scope="col">Content</th><th scope="col">Draft</th><th scope="col">Published</th><th scope="col">Archived</th><th scope="col">Manage</th></tr></thead><tbody>{summary.contentStates.map(area => <tr key={area.area}><th scope="row">{area.area === 'certificate' ? 'Certifications' : area.area.charAt(0).toUpperCase() + area.area.slice(1)}</th>{['DRAFT','PUBLISHED','ARCHIVED'].map(status => <td key={status}>{area.states.find(state => state.status === status)?._count._all ?? 0}</td>)}<td>{routes[area.area] && <RouteLink to={base + '/' + routes[area.area]}>Open {area.area}</RouteLink>}</td></tr>)}</tbody></table></div>;
}
function Security() {
  const [page, setPage] = useState(1); const [search, setSearch] = useState(''); const data = useData<{ id: string; action: string; createdAt: string; entityId: string | null; actor: { displayName: string } | null }[]>('/dashboard/security?page=' + page);
  if (!data.result) return <DataState error={data.error} reload={data.reload} />;
  const events = data.result.data.filter(event => [event.action.replaceAll('_', ' '), event.actor?.displayName, event.entityId].filter(Boolean).join(' ').toLowerCase().includes(search.trim().toLowerCase()));
  return <section className="dash-panel"><p className="dash-eyebrow">SECURITY RECORD</p><h2>Content, account & session activity</h2><p>Recorded application events, newest first. Passwords and raw tokens are never recorded.</p><label className="audit-search">Search events on this page<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Event, administrator or record reference" /></label>{!data.result.data.length ? <p className="dash-empty">No security events have been recorded yet.</p> : <ol className="dash-audit">{events.map(event => <li key={event.id}><Icon name="security" /><div><strong>{event.action.toLowerCase().replaceAll('_', ' ')}</strong><p>{event.actor?.displayName ?? 'Unauthenticated attempt'}</p>{event.entityId && <small>Record reference: {event.entityId}</small>}</div><time dateTime={event.createdAt}>{date(event.createdAt)}</time></li>)}</ol>}{!!data.result.data.length && !events.length && <p role="status">No matching events on this page. Clear the search or try another page.</p>}<Pager page={page} hasMore={data.result.pagination?.hasMore ?? false} onPage={value => { setSearch(''); setPage(value); }} /></section>;
}
function Status() {
  const data = useData<{ api: string; database: string; checkedAt: string; contentEditing: string; analytics: string }>('/dashboard/status');
  if (!data.result) return <DataState error={data.error} reload={data.reload} />;
  return <section className="dash-panel"><p className="dash-eyebrow">APPLICATION SIGNALS</p><h2>System status</h2><dl className="dash-details">{Object.entries(data.result.data).map(([key, value]) => <div key={key}><dt>{{ api: 'API', database: 'Database', checkedAt: 'Checked at', contentEditing: 'Content editing', analytics: 'Visitor analytics' }[key]}</dt><dd>{key === 'checkedAt' ? date(value) : value}</dd></div>)}</dl><button onClick={data.reload}>Check again</button><p className="dash-muted">This is an on-demand connection check. Infrastructure credentials, backups and deployment controls stay in protected local or hosting tools.</p></section>;
}
