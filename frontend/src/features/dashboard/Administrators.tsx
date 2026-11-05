import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../auth/api';
import type { User } from '../auth/api';
import { Badge, Confirm, DataState, Pager, useData } from './components';

type Action = { user: User; kind: 'status' | 'recovery' | 'revoke-sessions' };
export default function Administrators() {
  const [page, setPage] = useState(1); const list = useData<User[]>('/administrators?page=' + page);
  const [action, setAction] = useState<Action | null>(null); const [currentPassword, setPassword] = useState(''); const [temporaryPassword, setTemporary] = useState('');
  const [busy, setBusy] = useState(false); const [feedback, setFeedback] = useState(''); const [error, setError] = useState('');
  function close() { setAction(null); setPassword(''); setTemporary(''); }
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); setBusy(true); setFeedback(''); setError('');
    try { await api('/administrators', 'POST', Object.fromEntries(values)); form.reset(); setFeedback('Administrator created. Share the temporary password privately with the authorized owner. They must replace it at first sign-in.'); list.reload(); }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to create administrator.'); }
    finally { setBusy(false); }
  }
  async function confirm() {
    if (!action) return; setBusy(true); setError(''); setFeedback('');
    try {
      await api('/administrators/' + action.user.id + (action.kind === 'status' ? '' : '/' + action.kind), action.kind === 'status' ? 'PATCH' : 'POST',
        { currentPassword, ...(action.kind === 'status' ? { isActive: !action.user.isActive } : action.kind === 'recovery' ? { temporaryPassword } : {}) });
      setFeedback('Account updated. Existing sessions have been signed out.'); close(); list.reload();
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to update administrator.'); close(); }
    finally { setBusy(false); }
  }
  return <>{feedback && <p className="dash-feedback" role="status">{feedback}</p>}{error && <p className="dash-feedback error" role="alert">{error}</p>}
    <section className="dash-panel"><p className="dash-eyebrow">OWNER ACCESS</p><h2>Regular administrators</h2><p>Account changes require your current password. Technical administrator accounts are managed only through the local maintenance workflow.</p>
      {!list.result ? <DataState error={list.error} reload={list.reload} /> : <>{list.result.data.length === 0 ? <p className="dash-empty">No regular administrators yet. Provision the authorized portfolio owner below.</p> : <ul className="dash-record-list">{list.result.data.map(user => <li key={user.id}><div className="dash-row-title"><h3>{user.displayName}</h3><Badge value={user.isActive ? 'ACTIVE' : 'DISABLED'} /></div><p>{user.email}</p>{user.mustChangePassword && <p>Temporary password must be replaced.</p>}<div className="dash-actions"><button onClick={() => setAction({ user, kind: 'status' })}>{user.isActive ? 'Deactivate' : 'Activate'}</button><button onClick={() => setAction({ user, kind: 'revoke-sessions' })}>Revoke sessions</button><button onClick={() => setAction({ user, kind: 'recovery' })}>Start recovery</button></div></li>)}</ul>}<Pager page={page} hasMore={list.result.pagination?.hasMore ?? false} onPage={setPage} /></>}
    </section><section className="dash-panel"><p className="dash-eyebrow">PROVISION ACCESS</p><h2>Create an administrator</h2><p>Confirm the recipient's identity and arrange a private way to share the temporary password before proceeding.</p>
      <form onSubmit={create} className="dash-form-grid"><label>Display name<input name="displayName" required maxLength={150} autoComplete="off" /></label><label>Administrator email<input name="email" type="email" required maxLength={191} autoComplete="off" /></label><label>Temporary passphrase<input name="temporaryPassword" type="password" required minLength={15} maxLength={128} autoComplete="new-password" /></label><label>Your current password<input name="currentPassword" type="password" required maxLength={128} autoComplete="current-password" /></label><button className="dash-primary" disabled={busy}>{busy ? 'Creating…' : 'Create ADMIN account'}</button></form>
    </section>{action && <Confirm title={action.kind === 'status' ? (action.user.isActive ? 'Deactivate administrator?' : 'Activate administrator?') : action.kind === 'recovery' ? 'Start account recovery?' : 'Revoke administrator sessions?'} busy={busy} onCancel={close} onConfirm={confirm}><p>{action.user.displayName} · {action.user.email}</p><p>All existing sessions will be revoked. {action.kind === 'recovery' && 'Share the temporary password privately. A new password will be required at sign-in.'}</p><label>Your current password<input type="password" value={currentPassword} onChange={e => setPassword(e.target.value)} maxLength={128} autoComplete="current-password" /></label>{action.kind === 'recovery' && <label>Temporary passphrase (15–128 characters)<input type="password" value={temporaryPassword} onChange={e => setTemporary(e.target.value)} minLength={15} maxLength={128} autoComplete="new-password" /></label>}</Confirm>}
  </>;
}
