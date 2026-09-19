import { Link } from 'react-router-dom';
import { Avatar } from '../../../components/ui/Avatar';
import { Project, Task, User, UserRole } from '../../../types';
import { formatDate, isOverdue } from '../../../utils/workspace';
import { TaskStatusBadge } from './TaskStatusBadge';

interface TaskRowProps {
  task: Task;
  projects: Project[];
  users: User[];
  currentUser?: User;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export function TaskRow({ task, projects, users, currentUser, onEdit, onDelete }: TaskRowProps) {
  const assignee = users.find((user) => user.id === task.assigneeId);
  const canEdit = currentUser && (currentUser.role === UserRole.ADMIN || task.assigneeId === currentUser.id);
  return (
    <article className="task-row">
      <div className="task-title">
        <div>
          <TaskStatusBadge status={task.status} />
          {isOverdue(task) && <span className="overdue">Overdue</span>}
        </div>
        <strong>{task.title}</strong>
        <p>{task.description || 'No description.'}</p>
      </div>
      <div className="task-cell project-cell">
        <Link to={`/projects/${task.projectId}`}>
          {projects.find((project) => project.id === task.projectId)?.name ?? 'Project'}
        </Link>
      </div>
      <div className="task-cell assignee-cell">
        <Avatar user={assignee} />
        <span>{assignee?.name ?? 'Unassigned'}</span>
      </div>
      <div className="task-cell">
        <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
      </div>
      <div className="task-cell due-cell">
        <span>{formatDate(task.dueDate)}</span>
      </div>
      <div className="task-actions">
        {canEdit && (
          <button className="button secondary" onClick={() => onEdit?.(task)}>
            {currentUser?.role === UserRole.ADMIN ? 'Edit' : 'Update'}
          </button>
        )}
        {currentUser?.role === UserRole.ADMIN && (
          <button className="text-button destructive" onClick={() => onDelete?.(task)}>
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
