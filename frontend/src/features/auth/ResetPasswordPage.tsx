import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useToast } from '../../components/ui/ToastProvider';
import { useAuth } from '../../app/providers/AuthProvider';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isPasswordRecovery, recoveryReady, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 6) return setError('Use at least 6 characters for your new password.');
    if (password !== confirm) return setError('Passwords do not match.');
    setPending(true);
    setError('');
    try {
      await authService.updatePassword(password);
      await logout();
      showToast('Password updated. Sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Unable to update your password.');
    } finally {
      setPending(false);
    }
  };
  if (!recoveryReady)
    return (
      <main className="auth-main reset-page">
        <p className="muted">Validating recovery link…</p>
      </main>
    );
  if (!isPasswordRecovery)
    return (
      <main className="auth-main reset-page">
        <section className="auth-card">
          <p className="eyebrow">Account recovery</p>
          <h1>Reset link unavailable</h1>
          <p className="muted">This password reset link is invalid or has expired.</p>
          <Link className="button primary wide" to="/login">
            Return to sign in
          </Link>
        </section>
      </main>
    );
  return (
    <main className="auth-main reset-page">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">Account recovery</p>
        <h1>Set a new password</h1>
        <p className="muted">Choose a new password for your ZenTask account.</p>
        <label>
          New password
          <input
            required
            minLength={6}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label>
          Confirm new password
          <input
            required
            minLength={6}
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </label>
        {error && (
          <div className="field-error" role="alert">
            {error}
          </div>
        )}
        <button className="button primary wide" disabled={pending}>
          {pending ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </main>
  );
}
