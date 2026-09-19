import { Project, Task, User } from '../../../types';
import { TaskRow } from './TaskRow';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  currentUser?: User;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onView?: (task: Task) => void;
}

export function TaskList(props: TaskListProps) {
  return (
    <div className="task-list">
      <div className="task-list-header" aria-hidden="true">
        <span>Task</span>
        <span>Project</span>
        <span>Assignee</span>
        <span>Priority</span>
        <span>Due</span>
        <span>{props.onEdit || props.onDelete || props.onView ? 'Actions' : ''}</span>
      </div>
      {props.tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          projects={props.projects}
          users={props.users}
          currentUser={props.currentUser}
          onEdit={props.onEdit}
          onDelete={props.onDelete}
          onView={props.onView}
        />
      ))}
    </div>
  );
}
