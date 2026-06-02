import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { ActivityLog, Project, ProjectStatus, Task, TaskPriority, TaskStatus, User, UserRole } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
}) : null;

const client = () => {
  if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  return supabase;
};
const raise = (error: { message: string } | null) => { if (error) throw new Error(error.message); };
const projectStatusToDb = (status?: ProjectStatus) => status?.toLowerCase();
const taskStatusToDb = (status?: TaskStatus) => status === TaskStatus.TODO ? 'todo' : status === TaskStatus.IN_PROGRESS ? 'in_progress' : status === TaskStatus.READY_FOR_REVIEW ? 'ready_for_review' : status === TaskStatus.DONE ? 'completed' : undefined;
const priorityToDb = (priority?: TaskPriority) => priority?.toLowerCase();
const projectStatusFromDb = (status: string) => status === 'active' ? ProjectStatus.ACTIVE : status === 'completed' ? ProjectStatus.COMPLETED : ProjectStatus.PLANNING;
const taskStatusFromDb = (status: string) => status === 'in_progress' ? TaskStatus.IN_PROGRESS : status === 'ready_for_review' ? TaskStatus.READY_FOR_REVIEW : status === 'completed' ? TaskStatus.DONE : TaskStatus.TODO;
const priorityFromDb = (priority: string) => priority === 'high' ? TaskPriority.HIGH : priority === 'low' ? TaskPriority.LOW : TaskPriority.MEDIUM;
const mapUser = (row: any): User => ({ id: row.id, email: row.email, name: row.full_name, role: row.role === 'admin' ? UserRole.ADMIN : UserRole.MEMBER });
const mapProject = (row: any): Project => ({ ...row, owner_id: row.created_by, status: projectStatusFromDb(row.status), member_ids: (row.project_members || []).map((member: any) => member.user_id) });
const mapTask = (row: any): Task => ({ ...row, assigned_to: undefined, assignee_id: row.assigned_to || '', status: taskStatusFromDb(row.status), priority: priorityFromDb(row.priority), task_work_log: row.task_work_log || '' });

const loadProfile = async (id: string, fallback?: { email?: string; user_metadata?: Record<string, string> }): Promise<User> => {
  const { data, error } = await client().from('profiles').select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') raise(error);
  if (!data) return { id, email: fallback?.email || '', name: fallback?.user_metadata?.full_name || '', role: UserRole.MEMBER };
  if (data.role === 'member') {
    const { data: bootstrapped, error: bootstrapError } = await client().rpc('bootstrap_initial_admin');
    raise(bootstrapError);
    if (bootstrapped) return { ...mapUser(data), role: UserRole.ADMIN };
  }
  return mapUser(data);
};

export const supabaseAuth = {
  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await client().auth.signUp({ email, password, options: { data: { full_name: name } } });
    raise(error);
    if (!data.user) throw new Error('Signup did not return a user');
    if (!data.session) throw new Error('Account created. Confirm your email, then sign in.');
    return loadProfile(data.user.id, data.user);
  },
  signIn: async (email: string, password: string) => {
    const { data, error } = await client().auth.signInWithPassword({ email, password });
    raise(error);
    return loadProfile(data.user.id, data.user);
  },
  signOut: async () => {
    const { error } = await client().auth.signOut();
    raise(error);
  },
  getSession: async () => {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    raise(error);
    return data.session ? loadProfile(data.session.user.id, data.session.user) : null;
  }
};

const syncMembers = async (projectId: string, memberIds: string[], ownerId: string) => {
  const db = client();
  const desired = Array.from(new Set([ownerId, ...memberIds]));
  const { data, error } = await db.from('project_members').select('user_id').eq('project_id', projectId);
  raise(error);
  const existing = (data || []).map(member => member.user_id);
  const additions = desired.filter(id => !existing.includes(id)).map(user_id => ({ project_id: projectId, user_id, role: user_id === ownerId ? 'owner' : 'member' }));
  if (additions.length) raise((await db.from('project_members').insert(additions)).error);
  const removals = existing.filter(id => id !== ownerId && !desired.includes(id));
  if (removals.length) raise((await db.from('project_members').delete().eq('project_id', projectId).in('user_id', removals)).error);
};

export const projectService = {
  getUsers: async () => {
    const { data, error } = await client().from('profiles').select('*').order('full_name');
    raise(error);
    return (data || []).map(mapUser);
  },
  updateMemberRole: async (email: string, role: UserRole) => {
    const { data, error } = await client().from('profiles').update({ role: role.toLowerCase() }).eq('email', email).select().single();
    raise(error);
    return mapUser(data);
  },
  getProjects: async () => {
    const { data, error } = await client().from('projects').select('*, project_members(user_id)').order('created_at', { ascending: false });
    raise(error);
    return (data || []).map(mapProject);
  },
  saveProject: async (project: Partial<Project>, currentUser: User) => {
    const payload = { name: project.name, description: project.description, status: projectStatusToDb(project.status), start_date: project.start_date || null, due_date: project.due_date };
    if (project.id) {
      raise((await client().from('projects').update(payload).eq('id', project.id)).error);
      await syncMembers(project.id, project.member_ids || [], project.owner_id || currentUser.id);
      return;
    }
    const { data, error } = await client().from('projects').insert({ ...payload, created_by: currentUser.id }).select().single();
    raise(error);
    await syncMembers(data.id, project.member_ids || [], currentUser.id);
  },
  deleteProject: async (id: string) => raise((await client().from('projects').delete().eq('id', id)).error),
  getTasks: async () => {
    const { data, error } = await client().from('tasks').select('*').order('due_date');
    raise(error);
    return (data || []).map(mapTask);
  },
  saveTask: async (task: Partial<Task>, currentUser: User) => {
    const payload = { project_id: task.project_id, title: task.title, description: task.description, assigned_to: task.assignee_id || null, status: taskStatusToDb(task.status), priority: priorityToDb(task.priority), due_date: task.due_date, task_work_log: task.task_work_log || '' };
    raise(task.id ? (await client().from('tasks').update(payload).eq('id', task.id)).error : (await client().from('tasks').insert({ ...payload, created_by: currentUser.id })).error);
  },
  updateTaskStatus: async (taskId: string, status: TaskStatus, taskWorkLog: string) => {
    const payload = { status: taskStatusToDb(status), task_work_log: taskWorkLog };
    raise((await client().from('tasks').update(payload).eq('id', taskId)).error);
  },
  deleteTask: async (id: string) => raise((await client().from('tasks').delete().eq('id', id)).error),
  getActivityLogs: async () => {
    const { data, error } = await client().from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(8);
    raise(error);
    return (data || []) as ActivityLog[];
  },
  subscribe: (onChange: () => void): RealtimeChannel => client().channel('zentask-dashboard')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'project_members' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, onChange)
    .subscribe(),
  unsubscribe: async (channel: RealtimeChannel) => { await client().removeChannel(channel); }
};
