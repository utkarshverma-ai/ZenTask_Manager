import { ActivityLog, Project, ProjectStatus, Task, TaskPriority, TaskStatus, User, UserRole } from '../../types';

type ProfileRow = { id: string; email: string; full_name: string; role: string };
type ProjectRow = {
  id: string;
  name: string;
  description: string;
  status: string;
  created_by: string;
  start_date: string | null;
  due_date: string;
  created_at: string;
  project_members?: { user_id: string }[];
};
type TaskRow = {
  id: string;
  project_id: string;
  created_by: string;
  assigned_to: string | null;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  created_at: string;
  task_work_log: string;
};
type ActivityRow = {
  id: string;
  entity_type: ActivityLog['entityType'];
  entity_id: string;
  action: ActivityLog['action'];
  user_id: string | null;
  timestamp: string;
};
const projectStatus = (value: string) =>
  value === 'active' ? ProjectStatus.ACTIVE : value === 'completed' ? ProjectStatus.COMPLETED : ProjectStatus.PLANNING;
const taskStatus = (value: string) =>
  value === 'in_progress'
    ? TaskStatus.IN_PROGRESS
    : value === 'ready_for_review'
      ? TaskStatus.READY_FOR_REVIEW
      : value === 'completed'
        ? TaskStatus.DONE
        : TaskStatus.TODO;
const priority = (value: string) =>
  value === 'high' ? TaskPriority.HIGH : value === 'low' ? TaskPriority.LOW : TaskPriority.MEDIUM;
export const mapUser = (row: ProfileRow): User => ({
  id: row.id,
  email: row.email,
  name: row.full_name,
  role: row.role === 'admin' ? UserRole.ADMIN : UserRole.MEMBER,
});
export const mapProject = (row: ProjectRow): Project => ({
  id: row.id,
  name: row.name,
  description: row.description,
  status: projectStatus(row.status),
  ownerId: row.created_by,
  memberIds: (row.project_members ?? []).map((member) => member.user_id),
  startDate: row.start_date,
  dueDate: row.due_date,
  createdAt: row.created_at,
});
export const mapTask = (row: TaskRow): Task => ({
  id: row.id,
  projectId: row.project_id,
  createdBy: row.created_by,
  assigneeId: row.assigned_to,
  title: row.title,
  description: row.description,
  status: taskStatus(row.status),
  priority: priority(row.priority),
  dueDate: row.due_date,
  createdAt: row.created_at,
  workLog: row.task_work_log || '',
});
export const mapActivity = (row: ActivityRow): ActivityLog => ({
  id: row.id,
  entityType: row.entity_type,
  entityId: row.entity_id,
  action: row.action,
  userId: row.user_id,
  timestamp: row.timestamp,
});
export const toDb = {
  projectStatus: (value: ProjectStatus) => value.toLowerCase(),
  taskStatus: (value: TaskStatus) =>
    value === TaskStatus.TODO
      ? 'todo'
      : value === TaskStatus.IN_PROGRESS
        ? 'in_progress'
        : value === TaskStatus.READY_FOR_REVIEW
          ? 'ready_for_review'
          : 'completed',
  priority: (value: TaskPriority) => value.toLowerCase(),
};
