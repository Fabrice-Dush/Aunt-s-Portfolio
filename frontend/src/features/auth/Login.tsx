import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from './api';
import type { User } from './api';

export default function Login({ onLogin, notice }: { onLogin: (user: User) => void; notice?: string }) {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const values = new FormData(form);
    setError(''); setBusy(true);
    try {
      const { data } = await api<User>('/auth/login', 'POST', { email: values.get('email'), password: values.get('password') }, false);
      form.reset(); onLogin(data);
    } catch (error) { setError(error instanceof Error ? error.message : 'Sign-in failed. Try again.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><a className="auth-brand" href="/" aria-label="Return to the portfolio">NS<span>.</span></a>
    <div className="auth-intro"><p className="dash-eyebrow">NYIRARUKUNDO SERAPHINE / PRIVATE WORKSPACE</p><h1>A space for<br />your <em>story.</em></h1><p>Your professional journey, thoughtfully cared for.</p><a href="/">Explore the portfolio ↗</a></div>
    <section className="auth-card" aria-labelledby="login-title"><p className="dash-eyebrow">WELCOME BACK</p><h2 id="login-title">Sign in to your workspace</h2><p>Use your administrator account to continue.</p>
      {notice && <p className="dash-feedback" role="status">{notice}</p>}
      <form onSubmit={submit}><label>Email address<input name="email" type="email" autoComplete="username" maxLength={191} required autoFocus /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" maxLength={128} required /></label>
        {error && <p className="dash-feedback error" role="alert">{error}</p>}
        <button className="dash-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in →'}</button></form>
      <details className="recovery-help"><summary>Need help signing in?</summary><p>Ask your authorized technical maintainer to arrange account recovery. Recovery is handled privately; this website does not send password emails.</p></details>
    </section><p className="auth-footnote">Portfolio Studio · Authorized administrators only</p></main>;
}
