import React, { useEffect, useState } from 'react';
import { Project, Task, TaskPriority, TaskStatus, User } from '../types';

interface TaskModalProps {
  task?: Task | null;
  projects: Project[];
  users: User[];
  initialProjectId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, projects, users, initialProjectId, isOpen, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<Task>>({});

  useEffect(() => {
    setForm(task || {
      project_id: initialProjectId || projects[0]?.id || '',
      assignee_id: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      due_date: ''
    });
  }, [task, isOpen, initialProjectId, projects]);

  if (!isOpen) return null;
  const selectedProject = projects.find(project => project.id === form.project_id);
  const availableUsers = users.filter(user => selectedProject?.member_ids.includes(user.id));
  const update = (field: keyof Task, value: string) => setForm(current => ({ ...current, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({ ...form, assignee_id: form.assignee_id || availableUsers[0]?.id });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-900">{task ? 'Edit task' : 'Create task'}</h3>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <Field label="Task title"><input required value={form.title || ''} onChange={event => update('title', event.target.value)} className="input" placeholder="What needs to be done?" /></Field>
          <Field label="Description"><textarea value={form.description || ''} onChange={event => update('description', event.target.value)} className="input min-h-24" placeholder="Add useful context for the assignee" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project"><select required value={form.project_id || ''} onChange={event => { update('project_id', event.target.value); update('assignee_id', ''); }} className="input">{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></Field>
            <Field label="Assignee"><select required value={form.assignee_id || ''} onChange={event => update('assignee_id', event.target.value)} className="input"><option value="">Select member</option>{availableUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</select></Field>
            <Field label="Status"><select value={form.status} onChange={event => update('status', event.target.value)} className="input">{Object.values(TaskStatus).map(status => <option key={status}>{status}</option>)}</select></Field>
            <Field label="Priority"><select value={form.priority} onChange={event => update('priority', event.target.value)} className="input">{Object.values(TaskPriority).map(priority => <option key={priority}>{priority}</option>)}</select></Field>
          </div>
          <Field label="Due date"><input required type="date" value={form.due_date || ''} onChange={event => update('due_date', event.target.value)} className="input" /></Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save task</button>
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
