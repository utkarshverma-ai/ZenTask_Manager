import React, { useEffect, useMemo, useState } from 'react';
import { projectService } from '../services/supabase';
import { ActivityLog, Project, ProjectStatus, Task, TaskStatus, User, UserRole } from '../types';
import { ProjectModal } from './ProjectModal';
import { TaskModal } from './TaskModal';
import { TeamModal } from './TeamModal';

export const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [search, setSearch] = useState('');
  const [taskModal, setTaskModal] = useState<{ open: boolean; task?: Task | null }>({ open: false });
  const [projectModal, setProjectModal] = useState<{ open: boolean; project?: Project | null }>({ open: false });
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    try {
      const [nextProjects, nextTasks, nextUsers, nextActivity] = await Promise.all([projectService.getProjects(), projectService.getTasks(), projectService.getUsers(), projectService.getActivityLogs()]);
      setProjects(nextProjects);
      setTasks(nextTasks);
      setUsers(nextUsers);
      setActivity(nextActivity);
      setError('');
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Unable to refresh the dashboard');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
    const channel = projectService.subscribe(refresh);
    return () => { projectService.unsubscribe(channel); };
  }, []);
  const selectedProject = projects.find(project => project.id === selectedProjectId);
  const visibleTasks = useMemo(() => tasks
    .filter(task => selectedProjectId === 'all' || task.project_id === selectedProjectId)
    .filter(task => statusFilter === 'All' || task.status === statusFilter)
    .filter(task => task.title.toLowerCase().includes(search.toLowerCase()) || task.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.due_date.localeCompare(b.due_date)), [tasks, selectedProjectId, statusFilter, search]);
  const completed = tasks.filter(task => task.status === TaskStatus.DONE).length;
  const overdue = tasks.filter(task => task.status !== TaskStatus.DONE && new Date(`${task.due_date}T23:59:59`) < new Date()).length;
  const progress = (projectTasks: Task[]) => projectTasks.length ? Math.round(projectTasks.filter(task => task.status === TaskStatus.DONE).length / projectTasks.length * 100) : 0;
  const taskProject = (task: Task) => projects.find(project => project.id === task.project_id);
  const taskAssignee = (task: Task) => users.find(member => member.id === task.assignee_id);

  const execute = async (operation: () => Promise<unknown>) => { try { await operation(); await refresh(); } catch (issue) { setError(issue instanceof Error ? issue.message : 'Operation failed'); } };
  const saveTask = (task: Partial<Task>) => execute(() => projectService.saveTask(task, user));
  const saveProject = (project: Partial<Project>) => execute(() => projectService.saveProject(project, user));
  const deleteTask = (id: string) => { if (confirm('Delete this task?')) execute(() => projectService.deleteTask(id)); };
  const deleteProject = (id: string) => { if (confirm('Delete this project and all of its tasks?')) { execute(() => projectService.deleteProject(id)); setSelectedProjectId('all'); } };

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-sm font-semibold text-blue-600">TEAM WORKSPACE</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Execution dashboard</h2><p className="mt-1 text-slate-500">Track ownership, deadlines, and delivery across every project.</p></div>
        <div className="flex flex-wrap gap-2">
          {user.role === UserRole.ADMIN && <button className="btn-secondary" onClick={() => setTeamModalOpen(true)}>Manage access</button>}
          {user.role === UserRole.ADMIN && <button className="btn-secondary" onClick={() => setProjectModal({ open: true })}>+ New project</button>}
          <button disabled={!projects.length} className="btn-primary disabled:opacity-50" onClick={() => setTaskModal({ open: true })}>+ New task</button>
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <Metric label="Total projects" value={projects.length} note="Accessible workspace" />
        <Metric label="Active projects" value={projects.filter(project => project.status === ProjectStatus.ACTIVE).length} note="Currently executing" />
        <Metric label="Completed projects" value={projects.filter(project => project.status === ProjectStatus.COMPLETED).length} note="Delivered" />
        <Metric label="Total tasks" value={tasks.length} note={`${completed} completed`} />
        <Metric label="Pending tasks" value={tasks.length - completed} note="Still in progress" />
        <Metric label="Overdue tasks" value={overdue} note={overdue ? 'Needs attention' : 'Everything on track'} alert={overdue > 0} />
        <Metric label="Team members" value={users.length} note="Registered profiles" />
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between"><div><h3 className="text-lg font-bold text-slate-900">Projects</h3><p className="text-sm text-slate-500">Select a project to focus the task list.</p></div></div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button onClick={() => setSelectedProjectId('all')} className={`min-w-52 rounded-2xl border p-4 text-left transition ${selectedProjectId === 'all' ? 'border-blue-500 bg-blue-600 text-white shadow-md' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
            <p className="text-sm font-semibold">All projects</p><p className={`mt-4 text-2xl font-bold ${selectedProjectId === 'all' ? 'text-white' : 'text-slate-900'}`}>{progress(tasks)}%</p><p className={`text-xs ${selectedProjectId === 'all' ? 'text-blue-100' : 'text-slate-400'}`}>overall completion</p>
          </button>
          {projects.map(project => {
            const projectTasks = tasks.filter(task => task.project_id === project.id);
            const percentage = progress(projectTasks);
            return <button key={project.id} onClick={() => setSelectedProjectId(project.id)} className={`min-w-64 rounded-2xl border p-4 text-left transition ${selectedProjectId === project.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
              <div className="flex items-center justify-between gap-2"><p className="truncate font-semibold text-slate-900">{project.name}</p><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">{project.status}</span></div>
              <p className="mt-1 truncate text-xs text-slate-500">Due {formatDate(project.due_date)}</p>
              <div className="mt-5 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${percentage}%` }} /></div><span className="text-xs font-bold text-slate-600">{percentage}%</span></div>
            </button>;
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div><h3 className="font-bold text-slate-900">{selectedProject?.name || 'All tasks'}</h3><p className="text-xs text-slate-500">{visibleTasks.length} tasks shown</p></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input value={search} onChange={event => setSearch(event.target.value)} className="input sm:w-56" placeholder="Search tasks..." />
              <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as 'All' | TaskStatus)} className="input"><option>All</option>{Object.values(TaskStatus).map(status => <option key={status}>{status}</option>)}</select>
              {selectedProject && user.role === UserRole.ADMIN && <><button className="btn-secondary" onClick={() => setProjectModal({ open: true, project: selectedProject })}>Edit project</button><button className="btn-danger" onClick={() => deleteProject(selectedProject.id)}>Delete</button></>}
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? <div className="p-12 text-center text-sm text-slate-400">Loading workspace...</div> : visibleTasks.length ? visibleTasks.map(task => <article key={task.id} className="group p-4 transition hover:bg-slate-50 sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`status ${statusStyle(task.status)}`}>{task.status}</span><span className="text-xs font-semibold text-slate-400">{task.priority} priority</span></div><h4 className="mt-2 font-semibold text-slate-900">{task.title}</h4><p className="mt-1 text-sm text-slate-500">{task.description}</p></div>
              <div className="flex shrink-0 gap-1"><button onClick={() => setTaskModal({ open: true, task })} className="btn-icon">Edit</button>{user.role === UserRole.ADMIN && <button onClick={() => deleteTask(task.id)} className="btn-icon text-red-600">Delete</button>}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500"><span>Project: <b className="text-slate-700">{taskProject(task)?.name}</b></span><span>Owner: <b className="text-slate-700">{taskAssignee(task)?.name}</b></span><span>Due: <b className={new Date(`${task.due_date}T23:59:59`) < new Date() && task.status !== TaskStatus.DONE ? 'text-red-600' : 'text-slate-700'}>{formatDate(task.due_date)}</b></span></div>
          </article>) : <div className="p-12 text-center text-sm text-slate-400">No tasks match this view.</div>}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_22rem]"><div><h3 className="text-lg font-bold text-slate-900">Team directory</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{users.map(member => <div key={member.id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{initials(member.name)}</div><p className="mt-3 font-semibold text-slate-800">{member.name}</p><p className="truncate text-xs text-slate-500">{member.email}</p><span className="mt-3 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">{member.role}</span></div>)}</div></div><div><h3 className="text-lg font-bold text-slate-900">Recent activity</h3><div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">{activity.length ? activity.map(item => <div key={item.id} className="p-3 text-xs text-slate-600"><b className="capitalize text-slate-800">{item.entity_type.replace('_', ' ')}</b> {item.action}<p className="mt-1 text-[11px] text-slate-400">{new Date(item.timestamp).toLocaleString()}</p></div>) : <p className="p-4 text-xs text-slate-400">No activity yet.</p>}</div></div></section>

      <TaskModal isOpen={taskModal.open} task={taskModal.task} projects={projects} users={users} initialProjectId={selectedProjectId !== 'all' ? selectedProjectId : undefined} onClose={() => setTaskModal({ open: false })} onSave={saveTask} />
      <ProjectModal isOpen={projectModal.open} project={projectModal.project} users={users} onClose={() => setProjectModal({ open: false })} onSave={saveProject} />
      <TeamModal isOpen={teamModalOpen} onClose={() => setTeamModalOpen(false)} onSave={member => execute(() => projectService.updateMemberRole(member.email, member.role))} />
    </div>
  );
};

const Metric = ({ label, value, note, alert = false }: { label: string; value: string | number; note: string; alert?: boolean }) => <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className={`mt-2 text-2xl font-bold ${alert ? 'text-red-600' : 'text-slate-900'}`}>{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div>;
const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const initials = (name: string) => name.split(' ').map(part => part[0]).join('').slice(0, 2);
const statusStyle = (status: TaskStatus) => status === TaskStatus.DONE ? 'bg-emerald-50 text-emerald-700' : status === TaskStatus.IN_PROGRESS ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600';
