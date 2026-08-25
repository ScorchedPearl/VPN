'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';

const ACCESS_PASSWORD = 'oki';
const SESSION_KEY = 'caps-lock-access';

export default function PasswordGate({ children }: { children: ReactNode }) {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setUnlocked(window.sessionStorage.getItem(SESSION_KEY) === 'granted');
    setReady(true);
  }, []);

  function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password === ACCESS_PASSWORD) {
      window.sessionStorage.setItem(SESSION_KEY, 'granted');
      setUnlocked(true);
      return;
    }
    setError('That password is not correct.');
    setPassword('');
  }

  if (!ready || !unlocked) {
    return (
      <main className="password-gate">
        <section className="password-gate-card" aria-labelledby="access-title">
          <div className="kicker" style={{ marginBottom: 16 }}>OOSC · IIIT Allahabad</div>
          <h1 id="access-title" className="display" style={{ fontSize: 'clamp(46px, 8vw, 96px)' }}>
            CAPS <span className="accent-text">LOCK</span>
          </h1>
          <p className="subhead" style={{ marginTop: 18 }}>Enter the event password to unlock the presentation.</p>
          <form onSubmit={unlock} className="password-gate-form">
            <label htmlFor="presentation-password">Event password</label>
            <input
              id="presentation-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              autoFocus
              autoComplete="current-password"
              aria-describedby={error ? 'password-error' : undefined}
            />
            {error && <p id="password-error" className="password-gate-error" role="alert">{error}</p>}
            <button type="submit">Unlock presentation</button>
          </form>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
