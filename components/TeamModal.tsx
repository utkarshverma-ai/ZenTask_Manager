import React, { useState } from 'react';
import { User, UserRole } from '../types';

export const TeamModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (user: Pick<User, 'name' | 'email' | 'role'>) => void }> = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', email: '', role: UserRole.MEMBER });
  if (!isOpen) return null;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(form);
    setForm({ name: '', email: '', role: UserRole.MEMBER });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between"><h3 className="text-lg font-bold">Update team access</h3><button type="button" onClick={onClose} className="text-2xl text-slate-400">&times;</button></div>
        <p className="text-sm text-slate-500">The member must sign up first. Admins can then promote or demote the registered profile by email.</p>
        <label className="field">Email<input required type="email" className="input" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label>
        <label className="field">Access role<select className="input" value={form.role} onChange={event => setForm({ ...form, role: event.target.value as UserRole })}>{Object.values(UserRole).map(role => <option key={role}>{role}</option>)}</select></label>
        <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button className="btn-primary">Update access</button></div>
      </form>
    </div>
  );
};
