import { FormEvent, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../app/providers/AuthProvider';
import { useToast } from '../../components/ui/ToastProvider';
export function AuthPage() {
  const { user, setUser, error: sessionError } = useAuth();
  const { showToast } = useToast();
  const [login, setLogin] = useState(true);
  const [resetRequest, setResetRequest] = useState(false);
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
      if (resetRequest) {
        await authService.requestPasswordReset(email);
        showToast('Password reset link sent. Check your inbox.', 'info');
      } else {
        setUser(login ? await authService.signIn(email, password) : await authService.signUp(email, password, name));
      }
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
          <p className="eyebrow">
            {resetRequest ? 'Account recovery' : login ? 'Welcome back' : 'Create your account'}
          </p>
          <h2>{resetRequest ? 'Reset your password' : login ? 'Sign in to ZenTask' : 'Start with your workspace'}</h2>
          <p className="muted">
            {resetRequest
              ? 'Enter your email and we’ll send a secure reset link.'
              : login
                ? 'Use your account credentials to continue.'
                : 'Your administrator can add you to projects after you sign up.'}
          </p>
          {!login && !resetRequest && (
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
          {!resetRequest && (
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
          )}
          {(error || sessionError) && (
            <div className="field-error" role="alert">
              {error || sessionError}
            </div>
          )}
          <button className="button primary wide" disabled={loading}>
            {loading ? 'Working…' : resetRequest ? 'Send reset link' : login ? 'Sign in' : 'Create account'}
            <ArrowRight aria-hidden="true" />
          </button>
          {!login && !resetRequest && <p className="notice">You may need to confirm your email before signing in.</p>}
          {login && !resetRequest && (
            <button
              className="text-button auth-link"
              type="button"
              onClick={() => {
                setResetRequest(true);
                setError('');
              }}
            >
              Forgot password?
            </button>
          )}
          <p className="switch">
            {resetRequest ? 'Remembered your password?' : login ? 'New to ZenTask?' : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                if (resetRequest) setResetRequest(false);
                else setLogin(!login);
                setError('');
              }}
            >
              {resetRequest ? 'Sign in' : login ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}
