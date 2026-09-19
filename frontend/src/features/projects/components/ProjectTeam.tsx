import { Avatar } from '../../../components/ui/Avatar';
import { Project, User } from '../../../types';

export function ProjectTeam({ project, users }: { project: Project; users: User[] }) {
  return (
    <article className="panel">
      <h2>Project team</h2>
      <div className="team-list">
        {project.memberIds.map((id) => {
          const member = users.find((user) => user.id === id);
          return member ? (
            <div key={member.id}>
              <Avatar user={member} />
              <span>
                <strong>{member.name}</strong>
                <small>
                  {member.email} · {member.role}
                </small>
              </span>
            </div>
          ) : null;
        })}
      </div>
    </article>
  );
}
