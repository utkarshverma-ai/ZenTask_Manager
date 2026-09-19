import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useWorkspace } from '../../../app/providers/WorkspaceProvider';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ConfirmDialog } from '../../../components/ui/Dialog';
import { EmptyState, ErrorAlert, LoadingState } from '../../../components/ui/State';
import { useMutation } from '../../../hooks/useMutation';
import { tasksService } from '../../../services/tasks.service';
import { Task, TaskDraft, UserRole } from '../../../types';
import { TaskDialog } from '../components/TaskDialog';
import { TaskFilters } from '../components/TaskFilters';
import { TaskList } from '../components/TaskList';

export function TasksPage() {
  const { user } = useAuth();
  const { tasks, projects, users, loading, error, refresh } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [editing, setEditing] = useState<Task | null | undefined>(undefined);
  const [removing, setRemoving] = useState<Task | null>(null);
  const mutation = useMutation();
  const projectId = searchParams.get('project') ?? '';
  const setProjectId = (value: string) => {
    const next = new URLSearchParams(searchParams);
    value ? next.set('project', value) : next.delete('project');
    setSearchParams(next);
  };
  const shown = useMemo(
    () =>
      tasks.filter(
        (task) =>
          (!projectId || task.projectId === projectId) &&
          (!status || task.status === status) &&
          (!priority || task.priority === priority) &&
          (!assigneeId || task.assigneeId === assigneeId) &&
          `${task.title} ${task.description}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [tasks, projectId, status, priority, assigneeId, search],
  );
  if (loading) return <LoadingState />;
  const saveTask = async (task: Task | null, draft: TaskDraft) =>
    mutation.run(async () => {
      if (task && user?.role !== UserRole.ADMIN) await tasksService.updateStatus(task.id, draft.status, draft.workLog);
      else await tasksService.save(draft, user!);
      await refresh();
    });
  return (
    <div className="page">
      <PageHeader
        eyebrow="Tasks"
        title="Task management"
        description="Filter work, clarify ownership, and move delivery through review."
        action={
          user?.role === UserRole.ADMIN ? (
            <button className="button primary" disabled={!projects.length} onClick={() => setEditing(null)}>
              <Plus aria-hidden="true" />
              New task
            </button>
          ) : undefined
        }
      />
      {(error || mutation.error) && <ErrorAlert message={error || mutation.error} onRetry={() => void refresh()} />}
      <TaskFilters
        search={search}
        projectId={projectId}
        status={status}
        priority={priority}
        assigneeId={assigneeId}
        projects={projects}
        users={users}
        showAssignee={user?.role === UserRole.ADMIN}
        onSearchChange={setSearch}
        onProjectChange={setProjectId}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onAssigneeChange={setAssigneeId}
      />
      {shown.length ? (
        <TaskList
          tasks={shown}
          projects={projects}
          users={users}
          currentUser={user!}
          onEdit={setEditing}
          onDelete={setRemoving}
        />
      ) : (
        <EmptyState title="No tasks match this view" children="Try changing your filters or search term." />
      )}
      {editing !== undefined && (
        <TaskDialog
          task={editing}
          projects={projects}
          users={users}
          currentUser={user!}
          onClose={() => setEditing(undefined)}
          onSave={(draft) => saveTask(editing, draft)}
        />
      )}
      {
        <ConfirmDialog
          open={Boolean(removing)}
          title="Delete task?"
          message="This permanently removes the task."
          confirmLabel={mutation.pending ? 'Deleting…' : 'Delete task'}
          pending={mutation.pending}
          onClose={() => setRemoving(null)}
          onConfirm={() =>
            removing &&
            mutation.run(async () => {
              await tasksService.remove(removing.id);
              await refresh();
              setRemoving(null);
            })
          }
        />
      }
    </div>
  );
}
