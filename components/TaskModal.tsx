import React, { useEffect, useState } from 'react';
import { Project, Task, TaskPriority, TaskStatus, User, UserRole } from '../types';

interface TaskModalProps {
  task?: Task | null;
  projects: Project[];
  users: User[];
  currentUser: User;
  initialProjectId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus, workLog: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, projects, users, currentUser, initialProjectId, isOpen, onClose, onSave, onUpdateStatus }) => {
  const [form, setForm] = useState<Partial<Task>>({});
  const [validationError, setValidationError] = useState('');

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isAssignee = !!task && task.assignee_id === currentUser.id;
  const isEditing = !!task;

  useEffect(() => {
    setValidationError('');
    setForm(task || {
      project_id: initialProjectId || projects[0]?.id || '',
      assignee_id: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      due_date: '',
      task_work_log: ''
    });
  }, [task, isOpen, initialProjectId, projects]);

  if (!isOpen) return null;
  const selectedProject = projects.find(project => project.id === form.project_id);
  const availableUsers = users.filter(user => selectedProject?.member_ids.includes(user.id));
  const update = (field: keyof Task, value: string) => { setValidationError(''); setForm(current => ({ ...current, [field]: value })); };

  // Determine which statuses the current user is allowed to pick
  const getAllowedStatuses = (): TaskStatus[] => {
    if (!isEditing) return [TaskStatus.TODO];
    if (isAdmin) return Object.values(TaskStatus);
    if (isAssignee) {
      const current = task!.status;
      if (current === TaskStatus.TODO) return [TaskStatus.TODO, TaskStatus.IN_PROGRESS];
      if (current === TaskStatus.IN_PROGRESS) return [TaskStatus.IN_PROGRESS, TaskStatus.READY_FOR_REVIEW];
      return [current]; // Ready For Review or Completed — no further transitions for member
    }
    return [task!.status]; // Other members — read-only
  };

  const allowedStatuses = getAllowedStatuses();
  const canEditFields = isAdmin; // Only admin can edit title, description, project, assignee, priority, due date
  const canEditWorkLog = isAdmin || isAssignee;
  const canEditStatus = isAdmin || isAssignee;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError('');

    // If member is submitting for review, validate work summary
    if (isAssignee && !isAdmin && form.status === TaskStatus.READY_FOR_REVIEW) {
      if (!form.task_work_log || form.task_work_log.trim() === '') {
        setValidationError('Please provide a work summary before submitting for review.');
        return;
      }
    }

    if (isEditing && !isAdmin && isAssignee) {
      // Member: use the dedicated status+worklog update function
      onUpdateStatus(task!.id, form.status!, form.task_work_log || '');
    } else {
      // Admin: full save
      onSave({ ...form, assignee_id: form.assignee_id || availableUsers[0]?.id });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-900">{!isEditing ? 'Create task' : isAdmin ? 'Edit task' : 'Update task'}</h3>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {validationError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{validationError}</div>}

          <Field label="Task title">
            {canEditFields ? (
              <input required value={form.title || ''} onChange={event => update('title', event.target.value)} className="input" placeholder="What needs to be done?" />
            ) : (
              <p className="input bg-slate-50 text-slate-700 cursor-not-allowed">{form.title}</p>
            )}
          </Field>

          <Field label="Description">
            {canEditFields ? (
              <textarea value={form.description || ''} onChange={event => update('description', event.target.value)} className="input min-h-24" placeholder="Add useful context for the assignee" />
            ) : (
              <p className="input bg-slate-50 text-slate-700 cursor-not-allowed min-h-16">{form.description || '—'}</p>
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project">
              {canEditFields ? (
                <select required value={form.project_id || ''} onChange={event => { update('project_id', event.target.value); update('assignee_id', ''); }} className="input">{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
              ) : (
                <p className="input bg-slate-50 text-slate-700 cursor-not-allowed">{selectedProject?.name || '—'}</p>
              )}
            </Field>
            <Field label="Assignee">
              {canEditFields ? (
                <select required value={form.assignee_id || ''} onChange={event => update('assignee_id', event.target.value)} className="input"><option value="">Select member</option>{availableUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</select>
              ) : (
                <p className="input bg-slate-50 text-slate-700 cursor-not-allowed">{users.find(u => u.id === form.assignee_id)?.name || '—'}</p>
              )}
            </Field>
            <Field label="Status">
              {canEditStatus ? (
                <select value={form.status} onChange={event => update('status', event.target.value)} className="input">{allowedStatuses.map(status => <option key={status}>{status}</option>)}</select>
              ) : (
                <p className="input bg-slate-50 text-slate-700 cursor-not-allowed">{form.status}</p>
              )}
            </Field>
            <Field label="Priority">
              {canEditFields ? (
                <select value={form.priority} onChange={event => update('priority', event.target.value)} className="input">{Object.values(TaskPriority).map(priority => <option key={priority}>{priority}</option>)}</select>
              ) : (
                <p className="input bg-slate-50 text-slate-700 cursor-not-allowed">{form.priority}</p>
              )}
            </Field>
          </div>

          <Field label="Due date">
            {canEditFields ? (
              <input required type="date" value={form.due_date || ''} onChange={event => update('due_date', event.target.value)} className="input" />
            ) : (
              <p className="input bg-slate-50 text-slate-700 cursor-not-allowed">{form.due_date || '—'}</p>
            )}
          </Field>

          {isEditing && (
            <Field label="Work Summary">
              {canEditWorkLog ? (
                <textarea value={form.task_work_log || ''} onChange={event => update('task_work_log', event.target.value)} className="input min-h-32" placeholder="Describe what you completed, implementation details, blockers, and time spent." />
              ) : (
                <p className="input bg-slate-50 text-slate-700 cursor-not-allowed min-h-16">{form.task_work_log || 'No work summary submitted yet.'}</p>
              )}
            </Field>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            {(canEditFields || canEditStatus) && <button type="submit" className="btn-primary">{!isEditing ? 'Create task' : isAssignee && !isAdmin ? 'Update status' : 'Save task'}</button>}
          </div>
        </form>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block text-sm font-medium text-slate-700">
    <span className="mb-1.5 block">{label}</span>
    {children}
  </label>
);
