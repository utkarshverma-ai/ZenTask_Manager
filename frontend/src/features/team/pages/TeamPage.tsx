import { Users } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useWorkspace } from '../../../app/providers/WorkspaceProvider';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useToast } from '../../../components/ui/ToastProvider';
import { ErrorAlert, LoadingState } from '../../../components/ui/State';
import { useMutation } from '../../../hooks/useMutation';
import { teamService } from '../../../services/team.service';
import { UserRole } from '../../../types';
import { TeamDialog } from '../components/TeamDialog';
import { TeamMemberCard } from '../components/TeamMemberCard';

export function TeamPage() {
  const { user } = useAuth();
  const { users, loading, error, refresh } = useWorkspace();
  const [open, setOpen] = useState(false);
  const mutation = useMutation();
  const { showToast } = useToast();
  if (loading) return <LoadingState />;
  return (
    <div className="page">
      <PageHeader
        eyebrow="Team"
        title="People and access"
        description="Registered workspace profiles and the roles that govern their access."
        action={
          user?.role === UserRole.ADMIN ? (
            <button className="button primary" onClick={() => setOpen(true)}>
              <Users aria-hidden="true" />
              Manage access
            </button>
          ) : undefined
        }
      />
      {(error || mutation.error) && <ErrorAlert message={error || mutation.error} onRetry={() => void refresh()} />}
      <div className="access-note">
        <strong>Access follows signup.</strong> People must create an account before an administrator can update their
        role. ZenTask does not currently send invitation emails.
      </div>
      <div className="team-grid">
        {users.map((member) => (
          <TeamMemberCard key={member.id} user={member} />
        ))}
      </div>
      {open && (
        <TeamDialog
          onClose={() => setOpen(false)}
          onSave={(email, role) =>
            mutation.run(async () => {
              await teamService.updateRole(email, role);
              await refresh();
              showToast('Team access updated');
            })
          }
        />
      )}
    </div>
  );
}
