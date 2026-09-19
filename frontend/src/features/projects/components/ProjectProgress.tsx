import { Project, Task } from '../../../types';
import { formatDate, projectProgress } from '../../../utils/workspace';

export function ProjectProgress({ project, tasks }: { project: Project; tasks: Task[] }) {
  const progress = projectProgress(tasks);
  return (
    <article className="panel">
      <h2>Delivery progress</h2>
      <strong className="progress-number">{progress}%</strong>
      <div className="progress-track large">
        <i style={{ width: `${progress}%` }} />
      </div>
      <dl className="facts">
        <div>
          <dt>Start date</dt>
          <dd>{formatDate(project.startDate)}</dd>
        </div>
        <div>
          <dt>Due date</dt>
          <dd>{formatDate(project.dueDate)}</dd>
        </div>
        <div>
          <dt>Completed</dt>
          <dd>
            {tasks.filter((task) => task.status === 'Completed').length} of {tasks.length}
          </dd>
        </div>
      </dl>
    </article>
  );
}
