
import { Task, TaskStatus, User } from '../types';

const USERS_KEY = 'zentask_users';
const TASKS_KEY = 'zentask_tasks';
const SESSION_KEY = 'zentask_session';

export const supabaseMock = {
  auth: {
    signUp: async (email: string, password: string) => {
      const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      if (users.find(u => u.email === email)) {
        throw new Error('User already exists');
      }
      const newUser: User = { id: Math.random().toString(36).substr(2, 9), email };
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      return { data: { user: newUser }, error: null };
    },
    signIn: async (email: string, password: string) => {
      const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const user = users.find(u => u.email === email);
      if (!user) throw new Error('Invalid credentials');
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return { data: { user }, error: null };
    },
    signOut: async () => {
      localStorage.removeItem(SESSION_KEY);
      return { error: null };
    },
    getSession: async () => {
      const session = localStorage.getItem(SESSION_KEY);
      return { data: { session: session ? JSON.parse(session) : null }, error: null };
    }
  },
  from: (table: string) => ({
    select: () => ({
      eq: (column: string, value: any) => ({
        order: (col: string, { ascending }: { ascending: boolean }) => {
          let tasks: Task[] = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
          let filtered = tasks.filter(t => t.user_id === value);
          filtered.sort((a, b) => {
            const dateA = new Date(a[col as keyof Task] as string).getTime();
            const dateB = new Date(b[col as keyof Task] as string).getTime();
            return ascending ? dateA - dateB : dateB - dateA;
          });
          return { data: filtered, error: null };
        }
      })
    }),
    insert: (data: Partial<Task>) => {
      const tasks: Task[] = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
      const newTask = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      } as Task;
      tasks.push(newTask);
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      return { data: [newTask], error: null };
    },
    update: (data: Partial<Task>) => ({
      eq: (column: string, value: any) => {
        let tasks: Task[] = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
        tasks = tasks.map(t => t.id === value ? { ...t, ...data } : t);
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
        return { error: null };
      }
    }),
    delete: () => ({
      eq: (column: string, value: any) => {
        let tasks: Task[] = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
        tasks = tasks.filter(t => t.id !== value);
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
        return { error: null };
      }
    })
  })
};
