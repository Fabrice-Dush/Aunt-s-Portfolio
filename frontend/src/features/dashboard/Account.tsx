import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../auth/api';
import type { User } from '../auth/api';
import { Confirm, DataState, date, useData } from './components';

type Session = { id: string; createdAt: string; refreshedAt: string; expiresAt: string };
export default function Account({ user, onSignedOut }: { user: User; onSignedOut: (message?: string) => void }) {
  const sessions = useData<Session[]>('/auth/sessions'); const me = useData<User>('/auth/me');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [revoke, setRevoke] = useState<Session | null>(null);
  async function change(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); setError('');
    if (values.get('newPassword') !== values.get('confirmPassword')) { setError('The new passwords do not match.'); return; }
    setBusy(true);
    try { await api('/auth/change-password', 'POST', { currentPassword: values.get('currentPassword'), newPassword: values.get('newPassword') }); form.reset(); onSignedOut('Your password has changed. Sign in with your new password.'); }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to change your password.'); }
    finally { setBusy(false); }
  }
  async function revokeSession() {
    if (!revoke) return; setBusy(true); setError('');
    try { await api('/auth/sessions/' + revoke.id, 'DELETE'); if (revoke.id === me.result?.sessionId) onSignedOut(); else sessions.reload(); setRevoke(null); }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to sign out this session.'); setRevoke(null); }
    finally { setBusy(false); }
  }
  return <><div className="dash-account-heading"><h2>{user.displayName}</h2><p>{user.email}</p></div>
    {user.mustChangePassword && <p className="dash-feedback" role="status">Before opening your workspace, replace your temporary password with one only you know.</p>}
    {error && <p className="dash-feedback error" role="alert">{error}</p>}
    <div className="dash-two-columns"><section className="dash-panel"><p className="dash-eyebrow">YOUR ACCOUNT</p><h2>Change your password</h2><p>Use a unique passphrase of 15–128 characters. A few unrelated words work well. Common or repetitive passwords are rejected.</p>
      <form onSubmit={change}><label>Current password<input name="currentPassword" type="password" autoComplete="current-password" required maxLength={128} /></label>
        <label>New password<input name="newPassword" type="password" autoComplete="new-password" required minLength={15} maxLength={128} /></label>
        <label>Repeat new password<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={15} maxLength={128} /></label>
        <p className="dash-muted">Changing your password signs you out on every device. Sign in again with your new password.</p><button className="dash-primary" disabled={busy}>{busy ? 'Saving…' : 'Change password & sign out'}</button></form>
    </section><section className="dash-panel"><p className="dash-eyebrow">WHERE YOU ARE SIGNED IN</p><h2>Your active sessions</h2><p>Sign out of any session you no longer need.</p>
      {!sessions.result ? <DataState error={sessions.error} reload={sessions.reload} /> : <ul className="dash-record-list">{sessions.result.data.map((session, index) => <li key={session.id}><strong>{session.id === me.result?.sessionId ? 'This session' : `Session ${index + 1}`}</strong><p>Started {date(session.createdAt)}</p><p>Expires {date(session.expiresAt)}</p><button onClick={() => setRevoke(session)}>Sign out this session</button></li>)}</ul>}
    </section></div>
    {revoke && <Confirm title="Sign out this session?" busy={busy} onCancel={() => setRevoke(null)} onConfirm={revokeSession}><p>That session will immediately lose access to your workspace.</p></Confirm>}
  </>;
}
