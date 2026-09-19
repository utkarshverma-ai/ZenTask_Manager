import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useWorkspace } from '../../../app/providers/WorkspaceProvider';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ConfirmDialog } from '../../../components/ui/Dialog';
import { useToast } from '../../../components/ui/ToastProvider';
import { EmptyState, ErrorAlert, LoadingState } from '../../../components/ui/State';
import { useMutation } from '../../../hooks/useMutation';
import { tasksService } from '../../../services/tasks.service';
import { Task, TaskDraft, UserRole } from '../../../types';
import { TaskDialog } from '../components/TaskDialog';
import { TaskFilters } from '../components/TaskFilters';
import { TaskList } from '../components/TaskList';
import { TaskDetails } from '../components/TaskDetails';

export function TasksPage() {
  const { user } = useAuth();
  const { tasks, projects, users, loading, error, refresh } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const status = searchParams.get('status') ?? '';
  const [priority, setPriority] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [sort, setSort] = useState('due-asc');
  const [editing, setEditing] = useState<Task | null | undefined>(undefined);
  const [removing, setRemoving] = useState<Task | null>(null);
  const [details, setDetails] = useState<Task | null>(null);
  const mutation = useMutation();
  const { showToast } = useToast();
  const projectId = searchParams.get('project') ?? '';
  const setProjectId = (value: string) => {
    const next = new URLSearchParams(searchParams);
    value ? next.set('project', value) : next.delete('project');
    setSearchParams(next);
  };
  const setStatusFilter = (value: string) => {
    const next = new URLSearchParams(searchParams);
    value ? next.set('status', value) : next.delete('status');
    setSearchParams(next);
  };
  const shown = useMemo(() => {
    const filtered = tasks.filter(
      (task) =>
        (!projectId || task.projectId === projectId) &&
        (!status || task.status === status) &&
        (!priority || task.priority === priority) &&
        (!assigneeId || task.assigneeId === assigneeId) &&
        `${task.title} ${task.description}`.toLowerCase().includes(search.toLowerCase()),
    );
    return filtered.sort((left, right) =>
      sort === 'due-desc'
        ? right.dueDate.localeCompare(left.dueDate)
        : sort === 'priority'
          ? { High: 3, Medium: 2, Low: 1 }[right.priority] - { High: 3, Medium: 2, Low: 1 }[left.priority]
          : sort === 'created'
            ? right.createdAt.localeCompare(left.createdAt)
            : left.dueDate.localeCompare(right.dueDate),
    );
  }, [tasks, projectId, status, priority, assigneeId, search, sort]);
  if (loading) return <LoadingState />;
  const saveTask = async (task: Task | null, draft: TaskDraft) =>
    mutation.run(async () => {
      if (task && user?.role !== UserRole.ADMIN) await tasksService.updateStatus(task.id, draft.status, draft.workLog);
      else await tasksService.save(draft, user!);
      await refresh();
      showToast(
        task ? (draft.status === 'Ready For Review' ? 'Task submitted for review' : 'Task updated') : 'Task created',
      );
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
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriority}
        onAssigneeChange={setAssigneeId}
        sort={sort}
        onSortChange={setSort}
        onClear={() => {
          setSearch('');
          setStatusFilter('');
          setPriority('');
          setAssigneeId('');
          setSort('due-asc');
          const next = new URLSearchParams(searchParams);
          next.delete('project');
          next.delete('status');
          setSearchParams(next);
        }}
      />
      {shown.length ? (
        <TaskList
          tasks={shown}
          projects={projects}
          users={users}
          currentUser={user!}
          onEdit={setEditing}
          onDelete={setRemoving}
          onView={setDetails}
        />
      ) : (
        <EmptyState title="No tasks match this view" children="Try changing your filters or search term." />
      )}
      {details && (
        <TaskDetails
          task={details}
          projects={projects}
          users={users}
          currentUser={user!}
          onClose={() => setDetails(null)}
          onEdit={() => {
            setDetails(null);
            setEditing(details);
          }}
        />
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
              showToast('Task deleted');
            })
          }
        />
      }
    </div>
  );
}
