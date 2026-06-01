export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Completed'
}

export enum ProjectStatus {
  PLANNING = 'Planning',
  ACTIVE = 'Active',
  COMPLETED = 'Completed'
}

export enum UserRole {
  ADMIN = 'Admin',
  MEMBER = 'Member'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  owner_id: string;
  member_ids: string[];
  start_date: string;
  due_date: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  entity_type: 'project' | 'task' | 'project_member';
  entity_id: string;
  action: 'created' | 'updated' | 'deleted';
  user_id: string | null;
  timestamp: string;
}

export interface Task {
  id: string;
  project_id: string;
  created_by: string;
  assignee_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  created_at: string;
}
