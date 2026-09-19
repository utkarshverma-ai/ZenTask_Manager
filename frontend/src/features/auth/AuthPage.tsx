import { FormEvent, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../app/providers/AuthProvider';
export function AuthPage() {
  const { user, setUser, error: sessionError } = useAuth();
  const [login, setLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (user) return <Navigate to="/dashboard" replace />;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      setUser(login ? await authService.signIn(email, password) : await authService.signUp(email, password, name));
    } catch (issue) {
      const message = issue instanceof Error ? issue.message : 'Unable to authenticate.';
      setError(
        message.toLowerCase().includes('rate limit')
          ? 'Email confirmation is temporarily rate-limited. Wait a moment or ask an administrator for help.'
          : message,
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <section className="auth-aside">
        <div className="brand">
          <span>ZT</span>
          <strong>ZenTask</strong>
        </div>
        <div>
          <p className="eyebrow light">Delivery, without noise</p>
          <h1>Make ownership visible. Keep work moving.</h1>
          <p>ZenTask brings projects, assignments, deadlines, and review into one dependable workspace.</p>
        </div>
        <ul>
          {[
            'A clear view of work that needs attention',
            'Project access governed by your workspace',
            'A review trail for every handoff',
          ].map((item) => (
            <li key={item}>
              <CheckCircle2 aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section className="auth-main">
        <form className="auth-card" onSubmit={submit}>
          <p className="eyebrow">{login ? 'Welcome back' : 'Create your account'}</p>
          <h2>{login ? 'Sign in to ZenTask' : 'Start with your workspace'}</h2>
          <p className="muted">
            {login
              ? 'Use your account credentials to continue.'
              : 'Your administrator can add you to projects after you sign up.'}
          </p>
          {!login && (
            <label>
              Full name
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
              />
            </label>
          )}
          <label>
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              minLength={6}
              autoComplete={login ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
            />
          </label>
          {(error || sessionError) && (
            <div className="field-error" role="alert">
              {error || sessionError}
            </div>
          )}
          <button className="button primary wide" disabled={loading}>
            {loading ? 'Working…' : login ? 'Sign in' : 'Create account'}
            <ArrowRight aria-hidden="true" />
          </button>
          {!login && <p className="notice">You may need to confirm your email before signing in.</p>}
          <p className="switch">
            {login ? 'New to ZenTask?' : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setLogin(!login);
                setError('');
              }}
            >
              {login ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}
