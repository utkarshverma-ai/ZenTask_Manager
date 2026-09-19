import { FormEvent, useState } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { UserRole } from '../../../types';

export function TeamDialog({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (email: string, role: UserRole) => Promise<boolean>;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(UserRole.MEMBER);
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    const saved = await onSave(email, role);
    setPending(false);
    if (saved) onClose();
  };
  return (
    <Dialog open title="Update team access" onClose={pending ? () => undefined : onClose}>
      <form className="dialog-body form-grid" onSubmit={submit}>
        <p className="muted">
          The person must have signed up already. This updates the role on their registered profile; it does not send an
          invitation.
        </p>
        <label>
          Email
          <input
            required
            disabled={pending}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Access role
          <select disabled={pending} value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
            {Object.values(UserRole).map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <div className="dialog-actions">
          <button type="button" className="button secondary" disabled={pending} onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" disabled={pending}>
            {pending ? 'Saving…' : 'Update access'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
