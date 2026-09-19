import { FormEvent, useState } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Project, ProjectDraft, ProjectStatus, User } from '../../../types';

export function ProjectDialog({
  project,
  users,
  onClose,
  onSave,
}: {
  project: Project | null;
  users: User[];
  onClose: () => void;
  onSave: (draft: ProjectDraft) => Promise<boolean>;
}) {
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<ProjectDraft>(
    project
      ? {
          id: project.id,
          ownerId: project.ownerId,
          name: project.name,
          description: project.description,
          status: project.status,
          startDate: project.startDate,
          dueDate: project.dueDate,
          memberIds: project.memberIds,
        }
      : { name: '', description: '', status: ProjectStatus.PLANNING, startDate: null, dueDate: '', memberIds: [] },
  );
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    const saved = await onSave(form);
    setPending(false);
    if (saved) onClose();
  };
  return (
    <Dialog open title={project ? 'Edit project' : 'Create project'} onClose={pending ? () => undefined : onClose}>
      <form className="dialog-body form-grid" onSubmit={submit}>
        <label>
          Project name
          <input
            required
            disabled={pending}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
        <label>
          Description
          <textarea
            disabled={pending}
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="Define the intended outcome and scope"
          />
        </label>
        <div className="form-columns">
          <label>
            Status
            <select
              disabled={pending}
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as ProjectStatus })}
            >
              {Object.values(ProjectStatus).map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            Start date
            <input
              disabled={pending}
              type="date"
              value={form.startDate ?? ''}
              onChange={(event) => setForm({ ...form, startDate: event.target.value || null })}
            />
          </label>
          <label>
            Due date
            <input
              required
              disabled={pending}
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
            />
          </label>
        </div>
        <fieldset disabled={pending}>
          <legend>Project team</legend>
          <div className="member-picker">
            {users.map((member) => (
              <label key={member.id}>
                <input
                  type="checkbox"
                  checked={form.memberIds.includes(member.id)}
                  onChange={() =>
                    setForm((current) => ({
                      ...current,
                      memberIds: current.memberIds.includes(member.id)
                        ? current.memberIds.filter((id) => id !== member.id)
                        : [...current.memberIds, member.id],
                    }))
                  }
                />
                {member.name || member.email}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="dialog-actions">
          <button type="button" className="button secondary" disabled={pending} onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" disabled={pending}>
            {pending ? 'Saving…' : 'Save project'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
