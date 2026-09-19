import { Search } from 'lucide-react';
import { Project, TaskPriority, TaskStatus, User } from '../../../types';

interface TaskFiltersProps {
  search: string;
  projectId: string;
  status: string;
  priority: string;
  assigneeId: string;
  sort: string;
  projects: Project[];
  users: User[];
  showAssignee: boolean;
  onSearchChange: (value: string) => void;
  onProjectChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onAssigneeChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClear: () => void;
}

export function TaskFilters(props: TaskFiltersProps) {
  return (
    <section className="filters" aria-label="Task filters">
      <label>
        <Search aria-hidden="true" />
        <input
          aria-label="Search tasks"
          value={props.search}
          onChange={(event) => props.onSearchChange(event.target.value)}
          placeholder="Search tasks"
        />
      </label>
      <select
        aria-label="Project"
        value={props.projectId}
        onChange={(event) => props.onProjectChange(event.target.value)}
      >
        <option value="">All projects</option>
        {props.projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <select aria-label="Status" value={props.status} onChange={(event) => props.onStatusChange(event.target.value)}>
        <option value="">All statuses</option>
        {Object.values(TaskStatus).map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>
      <select
        aria-label="Priority"
        value={props.priority}
        onChange={(event) => props.onPriorityChange(event.target.value)}
      >
        <option value="">All priorities</option>
        {Object.values(TaskPriority).map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>
      {props.showAssignee && (
        <select
          aria-label="Assignee"
          value={props.assigneeId}
          onChange={(event) => props.onAssigneeChange(event.target.value)}
        >
          <option value="">All assignees</option>
          {props.users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      )}
      <select aria-label="Sort tasks" value={props.sort} onChange={(event) => props.onSortChange(event.target.value)}>
        <option value="due-asc">Due date — earliest</option>
        <option value="due-desc">Due date — latest</option>
        <option value="priority">Priority — high to low</option>
        <option value="created">Recently created</option>
      </select>
      <button className="button secondary" type="button" onClick={props.onClear}>
        Clear filters
      </button>
    </section>
  );
}
