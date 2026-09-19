import { CalendarDays, FolderKanban, UserRound } from 'lucide-react';
import { Dialog } from '../../../components/ui/Dialog';
import { Project, Task, User, UserRole } from '../../../types';
import { formatDate, isOverdue } from '../../../utils/workspace';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskActivity } from './TaskActivity';

interface Props {
  task: Task;
  projects: Project[];
  users: User[];
  currentUser: User;
  onClose: () => void;
  onEdit: () => void;
}
export function TaskDetails({ task, projects, users, currentUser, onClose, onEdit }: Props) {
  const project = projects.find((item) => item.id === task.projectId);
  const assignee = users.find((item) => item.id === task.assigneeId);
  const actionable = currentUser.role === UserRole.ADMIN || task.assigneeId === currentUser.id;
  return (
    <Dialog open title="Task details" onClose={onClose}>
      <article className="dialog-body task-details">
        <div className="task-details-head">
          <div>
            <TaskStatusBadge status={task.status} />
            {isOverdue(task) && <span className="overdue">Overdue</span>}
          </div>
          {actionable && (
            <button className="button secondary" onClick={onEdit}>
              {currentUser.role === UserRole.ADMIN ? 'Edit task' : 'Update task'}
            </button>
          )}
        </div>
        <h2>{task.title}</h2>
        <p className="task-description">{task.description || 'No description provided.'}</p>
        <dl className="task-facts">
          <div>
            <dt>
              <FolderKanban aria-hidden="true" />
              Project
            </dt>
            <dd>{project?.name ?? 'Unavailable'}</dd>
          </div>
          <div>
            <dt>
              <UserRound aria-hidden="true" />
              Assignee
            </dt>
            <dd>{assignee?.name ?? 'Unassigned'}</dd>
          </div>
          <div>
            <dt>
              <CalendarDays aria-hidden="true" />
              Due date
            </dt>
            <dd>{formatDate(task.dueDate)}</dd>
          </div>
          <div>
            <dt>Priority</dt>
            <dd>{task.priority}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{new Date(task.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>
        <section className="work-summary">
          <h3>Work summary</h3>
          <p>{task.workLog || 'No work summary has been submitted.'}</p>
        </section>
        <TaskActivity taskId={task.id} />
      </article>
    </Dialog>
  );
}
