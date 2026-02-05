
export enum TaskStatus {
  TODO = 'Todo',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  due_date: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}

export type SortOrder = 'asc' | 'desc';
