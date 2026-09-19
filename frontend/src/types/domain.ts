export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  READY_FOR_REVIEW = 'Ready For Review',
  DONE = 'Completed',
}
export enum ProjectStatus {
  PLANNING = 'Planning',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
}
export enum UserRole {
  ADMIN = 'Admin',
  MEMBER = 'Member',
}
export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  ownerId: string;
  memberIds: string[];
  startDate: string | null;
  dueDate: string;
  createdAt: string;
}
export interface Task {
  id: string;
  projectId: string;
  createdBy: string;
  assigneeId: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  workLog: string;
}
export interface ActivityLog {
  id: string;
  entityType: 'project' | 'task' | 'project_member';
  entityId: string;
  action: 'created' | 'updated' | 'deleted';
  userId: string | null;
  timestamp: string;
}
export type ProjectDraft = Pick<Project, 'name' | 'description' | 'status' | 'startDate' | 'dueDate' | 'memberIds'> &
  Partial<Pick<Project, 'id' | 'ownerId'>>;
export type TaskDraft = Pick<
  Task,
  'projectId' | 'title' | 'description' | 'assigneeId' | 'status' | 'priority' | 'dueDate' | 'workLog'
> &
  Partial<Pick<Task, 'id'>>;
