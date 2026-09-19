import { FormEvent, useState } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Project, Task, TaskDraft, TaskPriority, TaskStatus, User, UserRole } from '../../../types';
import { formatDate } from '../../../utils/workspace';

interface TaskDialogProps {
  task: Task | null;
  projects: Project[];
  users: User[];
  currentUser: User;
  onClose: () => void;
  onSave: (draft: TaskDraft) => Promise<boolean>;
}

export function TaskDialog({ task, projects, users, currentUser, onClose, onSave }: TaskDialogProps) {
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isAssignee = task?.assigneeId === currentUser.id;
  const [pending, setPending] = useState(false);
  const [validation, setValidation] = useState('');
  const [form, setForm] = useState<TaskDraft>(
    task
      ? {
          id: task.id,
          projectId: task.projectId,
          title: task.title,
          description: task.description,
          assigneeId: task.assigneeId,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          workLog: task.workLog,
        }
      : {
          projectId: projects[0]?.id ?? '',
          title: '',
          description: '',
          assigneeId: null,
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          dueDate: '',
          workLog: '',
        },
  );
  const availableUsers = users.filter((user) =>
    projects.find((project) => project.id === form.projectId)?.memberIds.includes(user.id),
  );
  const allowedStatuses = !task
    ? [TaskStatus.TODO]
    : isAdmin
      ? Object.values(TaskStatus)
      : task.status === TaskStatus.TODO
        ? [TaskStatus.TODO, TaskStatus.IN_PROGRESS]
        : task.status === TaskStatus.IN_PROGRESS
          ? [TaskStatus.IN_PROGRESS, TaskStatus.READY_FOR_REVIEW]
          : [task.status];
  const editable = !task || isAdmin || Boolean(isAssignee);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    if (isAssignee && !isAdmin && form.status === TaskStatus.READY_FOR_REVIEW && !form.workLog.trim()) {
      setValidation('Provide a work summary before submitting this task for review.');
      return;
    }
    setPending(true);
    const saved = await onSave(form);
    setPending(false);
    if (saved) onClose();
  };
  const actionLabel = !task ? 'Create task' : isAdmin ? 'Save task' : 'Update status';

  return (
    <Dialog
      open
      title={!task ? 'Create task' : isAdmin ? 'Edit task' : 'Update task'}
      onClose={pending ? () => undefined : onClose}
    >
      <form className="dialog-body form-grid" onSubmit={submit}>
        {validation && (
          <div className="field-error" role="alert">
            {validation}
          </div>
        )}
        <label>
          Task title
          {isAdmin || !task ? (
            <input
              required
              disabled={pending}
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          ) : (
            <output>{form.title}</output>
          )}
        </label>
        <label>
          Description
          {isAdmin || !task ? (
            <textarea
              disabled={pending}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          ) : (
            <output>{form.description || 'No description.'}</output>
          )}
        </label>
        <div className="form-columns">
          <label>
            Project
            {isAdmin || !task ? (
              <select
                required
                disabled={pending}
                value={form.projectId}
                onChange={(event) => setForm({ ...form, projectId: event.target.value, assigneeId: null })}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            ) : (
              <output>{projects.find((project) => project.id === form.projectId)?.name}</output>
            )}
          </label>
          <label>
            Assignee
            {isAdmin || !task ? (
              <select
                required
                disabled={pending}
                value={form.assigneeId ?? ''}
                onChange={(event) => setForm({ ...form, assigneeId: event.target.value || null })}
              >
                <option value="">Select member</option>
                {availableUsers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            ) : (
              <output>{users.find((user) => user.id === form.assigneeId)?.name ?? 'Unassigned'}</output>
            )}
          </label>
          <label>
            Status
            <select
              disabled={!editable || pending}
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as TaskStatus })}
            >
              {allowedStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            Priority
            {isAdmin || !task ? (
              <select
                disabled={pending}
                value={form.priority}
                onChange={(event) => setForm({ ...form, priority: event.target.value as TaskPriority })}
              >
                {Object.values(TaskPriority).map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            ) : (
              <output>{form.priority}</output>
            )}
          </label>
        </div>
        <label>
          Due date
          {isAdmin || !task ? (
            <input
              required
              disabled={pending}
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
            />
          ) : (
            <output>{formatDate(form.dueDate)}</output>
          )}
        </label>
        {task && (
          <label>
            Work summary
            <textarea
              disabled={(!isAdmin && !isAssignee) || pending}
              value={form.workLog}
              onChange={(event) => setForm({ ...form, workLog: event.target.value })}
              placeholder="Describe completed work, implementation details, or blockers."
            />
          </label>
        )}
        <div className="dialog-actions">
          <button type="button" className="button secondary" disabled={pending} onClick={onClose}>
            Cancel
          </button>
          {editable && (
            <button className="button primary" disabled={pending}>
              {pending ? 'Saving…' : actionLabel}
            </button>
          )}
        </div>
      </form>
    </Dialog>
  );
}
