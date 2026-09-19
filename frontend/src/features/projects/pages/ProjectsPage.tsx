import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useWorkspace } from '../../../app/providers/WorkspaceProvider';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState, ErrorAlert, LoadingState } from '../../../components/ui/State';
import { useMutation } from '../../../hooks/useMutation';
import { projectsService } from '../../../services/projects.service';
import { Project, UserRole } from '../../../types';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectDialog } from '../components/ProjectDialog';

export function ProjectsPage() {
  const { user } = useAuth();
  const { projects, tasks, users, loading, error, refresh } = useWorkspace();
  const [editing, setEditing] = useState<Project | null | undefined>(undefined);
  const mutation = useMutation();
  if (loading) return <LoadingState />;
  return (
    <div className="page">
      <PageHeader
        eyebrow="Projects"
        title="Project portfolio"
        description="Plan scope, assign delivery teams, and keep every deadline visible."
        action={
          user?.role === UserRole.ADMIN ? (
            <button className="button primary" onClick={() => setEditing(null)}>
              <Plus aria-hidden="true" />
              New project
            </button>
          ) : undefined
        }
      />
      {(error || mutation.error) && <ErrorAlert message={error || mutation.error} onRetry={() => void refresh()} />}
      {projects.length ? (
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={tasks}
              users={users}
              onEdit={user?.role === UserRole.ADMIN ? () => setEditing(project) : undefined}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={user?.role === UserRole.ADMIN ? 'Create the first project' : 'No project access yet'}
          children={
            user?.role === UserRole.ADMIN
              ? 'Start with a project, then assign its team and tasks.'
              : 'Ask an administrator to add you to a project.'
          }
          action={
            user?.role === UserRole.ADMIN ? (
              <button className="button primary" onClick={() => setEditing(null)}>
                Create project
              </button>
            ) : undefined
          }
        />
      )}
      {editing !== undefined && (
        <ProjectDialog
          project={editing}
          users={users}
          onClose={() => setEditing(undefined)}
          onSave={(draft) =>
            mutation.run(async () => {
              await projectsService.save(draft, user!);
              await refresh();
            })
          }
        />
      )}
    </div>
  );
}
