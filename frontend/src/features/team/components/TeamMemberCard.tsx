import { Avatar } from '../../../components/ui/Avatar';
import { User } from '../../../types';

export function TeamMemberCard({ user }: { user: User }) {
  return (
    <article className="team-card">
      <Avatar user={user} />
      <div>
        <h2>{user.name || 'Unnamed member'}</h2>
        <p>{user.email}</p>
        <span className="role-badge">{user.role}</span>
      </div>
    </article>
  );
}
