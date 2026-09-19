import { CalendarDays, CheckCircle2, ClipboardList, FolderKanban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useWorkspace } from '../../../app/providers/WorkspaceProvider';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState, ErrorAlert, LoadingState } from '../../../components/ui/State';
import { TaskStatus, UserRole } from '../../../types';
import { isOverdue } from '../../../utils/workspace';
import { MetricCard } from '../components/MetricCard';
import { ProjectProgress } from '../components/ProjectProgress';
import { RecentActivity } from '../components/RecentActivity';
import { TaskList } from '../../tasks/components/TaskList';
import { TaskDetails } from '../../tasks/components/TaskDetails';
import { TaskDialog } from '../../tasks/components/TaskDialog';
import { tasksService } from '../../../services/tasks.service';
import { useMutation } from '../../../hooks/useMutation';
import { useToast } from '../../../components/ui/ToastProvider';
import { Task, TaskDraft } from '../../../types';

export function OverviewPage() {
  const { user } = useAuth();
  const { projects, tasks, users, activity, loading, error, refresh } = useWorkspace();
  const [details, setDetails] = useState<Task | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const mutation = useMutation();
  const { showToast } = useToast();
  if (loading) return <LoadingState />;
  if (error) return <ErrorAlert message={error} onRetry={() => void refresh()} />;

  const scopedTasks = user?.role === UserRole.ADMIN ? tasks : tasks.filter((task) => task.assigneeId === user?.id);
  const dueSoon = scopedTasks.filter(
    (task) =>
      task.status !== TaskStatus.DONE &&
      !isOverdue(task) &&
      new Date(`${task.dueDate}T23:59:59`).getTime() - Date.now() < 7 * 86400000,
  ).length;
  const overdue = scopedTasks.filter(isOverdue).length;
  const waitingForReview = tasks.filter((task) => task.status === TaskStatus.READY_FOR_REVIEW).length;
  const attention = scopedTasks
    .filter((task) => isOverdue(task) || task.status === TaskStatus.READY_FOR_REVIEW)
    .slice(0, 6);
  const metrics = [
    {
      label: 'Active projects',
      value: projects.filter((project) => project.status === 'Active').length,
      note: `${projects.length} accessible`,
      icon: FolderKanban,
    },
    {
      label: user?.role === UserRole.ADMIN ? 'Open tasks' : 'My open tasks',
      value: scopedTasks.filter((task) => task.status !== TaskStatus.DONE).length,
      note: `${scopedTasks.filter((task) => task.status === TaskStatus.DONE).length} completed`,
      icon: ClipboardList,
    },
    user?.role === UserRole.ADMIN
      ? {
          label: 'Waiting for review',
          value: waitingForReview,
          note: waitingForReview ? 'Submitted tasks need a decision' : 'Review queue is clear',
          icon: CheckCircle2,
        }
      : { label: 'Due soon', value: dueSoon, note: 'Within the next 7 days', icon: CalendarDays },
    {
      label: 'Overdue',
      value: overdue,
      note: overdue ? 'Needs a response' : 'Nothing overdue',
      icon: CheckCircle2,
      alert: overdue > 0,
    },
  ];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Overview"
        title={user?.role === UserRole.ADMIN ? 'Workspace pulse' : 'My work, in focus'}
        description={
          user?.role === UserRole.ADMIN
            ? 'A concise view of delivery across accessible projects.'
            : 'The tasks and handoffs that need your attention.'
        }
      />
      <section className="metric-grid">
        {metrics.map((metric) =>
          metric.label === 'Waiting for review' ? (
            <Link key={metric.label} to="/tasks?status=Ready%20For%20Review">
              <MetricCard {...metric} />
            </Link>
          ) : (
            <MetricCard key={metric.label} {...metric} />
          ),
        )}
      </section>
      <section className="content-grid">
        {projects.length ? (
          <ProjectProgress projects={projects} tasks={tasks} />
        ) : (
          <EmptyState title="No projects yet" children="Projects you can access will appear here." />
        )}{' '}
        {activity.length ? (
          <RecentActivity activity={activity} />
        ) : (
          <EmptyState title="No recent activity" children="Workspace changes will show up here." />
        )}
      </section>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Tasks requiring attention</h2>
            <p>Overdue work and submissions waiting for review.</p>
          </div>
          <Link to={user?.role === UserRole.ADMIN ? '/tasks?status=Ready%20For%20Review' : '/tasks'}>
            Open task list
          </Link>
        </div>
        {attention.length ? (
          <TaskList
            tasks={attention}
            projects={projects}
            users={users}
            currentUser={user ?? undefined}
            onView={setDetails}
          />
        ) : (
          <EmptyState title="Nothing needs attention" children="You're caught up for now." />
        )}
      </section>
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
      {editing && (
        <TaskDialog
          task={editing}
          projects={projects}
          users={users}
          currentUser={user!}
          onClose={() => setEditing(null)}
          onSave={(draft: TaskDraft) =>
            mutation.run(async () => {
              await tasksService.save(draft, user!);
              await refresh();
              showToast(draft.status === TaskStatus.DONE ? 'Task completed' : 'Task updated');
            })
          }
        />
      )}
    </div>
  );
}
