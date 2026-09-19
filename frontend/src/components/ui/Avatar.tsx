import { User } from '../../types';
import { initials } from '../../utils/workspace';

export function Avatar({ user }: { user?: User }) {
  return (
    <span className="avatar" title={user?.name}>
      {user ? initials(user.name) : '—'}
    </span>
  );
}
