import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useToast } from '../../components/ui/ToastProvider';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 6) return setError('Use at least 6 characters for your new password.');
    if (password !== confirm) return setError('Passwords do not match.');
    setPending(true);
    setError('');
    try {
      await authService.updatePassword(password);
      setComplete(true);
      showToast('Password updated');
      window.setTimeout(() => navigate('/login', { replace: true }), 900);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Unable to update your password.');
    } finally {
      setPending(false);
    }
  };
  if (complete) return <Navigate to="/login" replace />;
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
