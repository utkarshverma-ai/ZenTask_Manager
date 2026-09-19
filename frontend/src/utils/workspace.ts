import { Task, TaskStatus } from '../types';
export const formatDate = (date: string | null) => date ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
export const isOverdue = (task: Task) => task.status !== TaskStatus.DONE && new Date(`${task.dueDate}T23:59:59`) < new Date();
export const projectProgress = (tasks: Task[]) => tasks.length ? Math.round(tasks.filter(task => task.status === TaskStatus.DONE).length / tasks.length * 100) : 0;
export const initials = (name: string) => name.split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase() || '?';
