import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useWorkspace } from '../../../app/providers/WorkspaceProvider';
import { ConfirmDialog } from '../../../components/ui/Dialog';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState, ErrorAlert, LoadingState } from '../../../components/ui/State';
import { useMutation } from '../../../hooks/useMutation';
import { projectsService } from '../../../services/projects.service';
import { UserRole } from '../../../types';
import { TaskList } from '../../tasks/components/TaskList';
import { ProjectDialog } from '../components/ProjectDialog';
import { ProjectProgress } from '../components/ProjectProgress';
import { ProjectTeam } from '../components/ProjectTeam';

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, tasks, users, loading, refresh } = useWorkspace();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const mutation = useMutation();
  if (loading) return <LoadingState />;
  const project = projects.find((item) => item.id === projectId);
  if (!project)
    return (
      <EmptyState
        title="Project unavailable"
        children="This project may have been deleted or you may not have access to it."
        action={
          <button className="button secondary" onClick={() => navigate('/projects')}>
            Back to projects
          </button>
        }
      />
    );
  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  return (
    <div className="page">
      <div className="crumb">
        <Link to="/projects">Projects</Link>
        <span>/</span>
        {project.name}
      </div>
      <PageHeader
        eyebrow={project.status}
        title={project.name}
        description={project.description || 'No project description.'}
        action={
          user?.role === UserRole.ADMIN ? (
            <div className="button-group">
              <button className="button secondary" onClick={() => setEditing(true)}>
                Edit project
              </button>
              <button className="button danger-outline" onClick={() => setConfirming(true)}>
                Delete
              </button>
            </div>
          ) : undefined
        }
      />
      {mutation.error && <ErrorAlert message={mutation.error} />}
      <section className="detail-grid">
        <ProjectProgress project={project} tasks={projectTasks} />
        <ProjectTeam project={project} users={users} />
      </section>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Related tasks</h2>
            <p>
              {projectTasks.length} task{projectTasks.length === 1 ? '' : 's'} in this project.
            </p>
          </div>
          <Link to={`/tasks?project=${project.id}`}>View in task list</Link>
        </div>
        {projectTasks.length ? (
          <TaskList tasks={projectTasks} projects={projects} users={users} />
        ) : (
          <EmptyState title="No tasks in this project" children="Tasks created for this project will appear here." />
        )}
      </section>
      {editing && (
        <ProjectDialog
          project={project}
          users={users}
          onClose={() => setEditing(false)}
          onSave={(draft) =>
            mutation.run(async () => {
              await projectsService.save(draft, user!);
              await refresh();
            })
          }
        />
      )}
      {
        <ConfirmDialog
          open={confirming}
          title="Delete project?"
          message="This permanently deletes the project and its related tasks."
          confirmLabel={mutation.pending ? 'Deleting…' : 'Delete project'}
          pending={mutation.pending}
          onClose={() => setConfirming(false)}
          onConfirm={() =>
            mutation.run(async () => {
              await projectsService.remove(project.id);
              await refresh();
              setConfirming(false);
              navigate('/projects');
            })
          }
        />
      }
    </div>
  );
}
