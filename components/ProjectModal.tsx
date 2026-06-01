import React, { useEffect, useState } from 'react';
import { Project, ProjectStatus, User } from '../types';

interface ProjectModalProps {
  project?: Project | null;
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, users, isOpen, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<Project>>({});
  useEffect(() => setForm(project || { status: ProjectStatus.PLANNING, member_ids: [], start_date: '', due_date: '' }), [project, isOpen]);
  if (!isOpen) return null;

  const toggleMember = (id: string) => {
    const ids = form.member_ids || [];
    setForm(current => ({ ...current, member_ids: ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id] }));
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-900">{project ? 'Edit project' : 'Create project'}</h3>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700">&times;</button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-6">
          <label className="field">Project name<input required value={form.name || ''} onChange={event => setForm({ ...form, name: event.target.value })} className="input" placeholder="e.g. Product launch" /></label>
          <label className="field">Description<textarea value={form.description || ''} onChange={event => setForm({ ...form, description: event.target.value })} className="input min-h-24" placeholder="Define the outcome and scope" /></label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="field">Status<select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as ProjectStatus })} className="input">{Object.values(ProjectStatus).map(status => <option key={status}>{status}</option>)}</select></label>
            <label className="field">Start date<input type="date" value={form.start_date || ''} onChange={event => setForm({ ...form, start_date: event.target.value })} className="input" /></label>
            <label className="field">Due date<input required type="date" value={form.due_date || ''} onChange={event => setForm({ ...form, due_date: event.target.value })} className="input" /></label>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Project team</p>
            <div className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-2">
              {users.map(user => <label key={user.id} className="flex items-center gap-2 rounded-lg p-2 text-sm text-slate-700 hover:bg-slate-50"><input type="checkbox" checked={form.member_ids?.includes(user.id) || false} onChange={() => toggleMember(user.id)} className="accent-blue-600" />{user.name}</label>)}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Save project</button></div>
        </form>
      </div>
    </div>
  );
};
