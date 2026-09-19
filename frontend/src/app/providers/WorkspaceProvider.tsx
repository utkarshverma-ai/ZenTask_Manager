import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ActivityLog, Project, Task, User } from '../../types';
import { activityService } from '../../services/activity.service';
import { projectsService } from '../../services/projects.service';
import { realtimeService } from '../../services/realtime.service';
import { tasksService } from '../../services/tasks.service';
import { teamService } from '../../services/team.service';
type Workspace = {
  projects: Project[];
  tasks: Task[];
  users: User[];
  activity: ActivityLog[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
};
const WorkspaceContext = createContext<Workspace | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Omit<Workspace, 'loading' | 'error' | 'refresh'>>({
    projects: [],
    tasks: [],
    users: [],
    activity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = async () => {
    try {
      setError('');
      const [projects, tasks, users, activity] = await Promise.all([
        projectsService.list(),
        tasksService.list(),
        teamService.list(),
        activityService.list(),
      ]);
      setData({ projects, tasks, users, activity });
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Unable to load workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    const channel = realtimeService.subscribeToWorkspace(() => void refresh());
    return () => void realtimeService.unsubscribe(channel);
  }, []);

  return <WorkspaceContext.Provider value={{ ...data, loading, error, refresh }}>{children}</WorkspaceContext.Provider>;
}
export const useWorkspace = () => {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return value;
};
