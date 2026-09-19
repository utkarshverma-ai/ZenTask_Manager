import { Link } from 'react-router-dom';
import { Avatar } from '../../../components/ui/Avatar';
import { Project, Task, User } from '../../../types';
import { formatDate, projectProgress } from '../../../utils/workspace';

export function ProjectCard({
  project,
  tasks,
  users,
  onEdit,
}: {
  project: Project;
  tasks: Task[];
  users: User[];
  onEdit?: () => void;
}) {
  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  const progress = projectProgress(projectTasks);
  return (
    <article className="project-card">
      <div className="project-card-head">
        <span className={`project-status ${project.status.toLowerCase()}`}>{project.status}</span>
        {onEdit && (
          <button className="text-button" onClick={onEdit}>
            Edit
          </button>
        )}
      </div>
      <Link to={`/projects/${project.id}`}>
        <h2>{project.name}</h2>
        <p>{project.description || 'No project description.'}</p>
      </Link>
      <div className="progress-track">
        <i style={{ width: `${progress}%` }} />
      </div>
      <div className="project-meta">
        <span>{progress}% complete</span>
        <span>Due {formatDate(project.dueDate)}</span>
      </div>
      <footer>
        <div className="avatar-stack">
          {project.memberIds.slice(0, 4).map((id) => (
            <Avatar key={id} user={users.find((user) => user.id === id)} />
          ))}
        </div>
        <span>
          {projectTasks.filter((task) => task.status === 'Completed').length}/{projectTasks.length} tasks
        </span>
      </footer>
    </article>
  );
}
