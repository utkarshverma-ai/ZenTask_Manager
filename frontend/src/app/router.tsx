import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { AuthPage } from '../features/auth/AuthPage';
import { OverviewPage } from '../features/dashboard/pages/OverviewPage';
import { ProjectDetailPage } from '../features/projects/pages/ProjectDetailPage';
import { ProjectsPage } from '../features/projects/pages/ProjectsPage';
import { TasksPage } from '../features/tasks/pages/TasksPage';
import { TeamPage } from '../features/team/pages/TeamPage';
import { useAuth } from './providers/AuthProvider';
import { WorkspaceProvider } from './providers/WorkspaceProvider';
import { LoadingState } from '../components/ui/State';
function ProtectedRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  );
}
export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<OverviewPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/team" element={<TeamPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
