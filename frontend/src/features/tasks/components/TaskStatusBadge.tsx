import { TaskStatus } from '../../../types';

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const className =
    status === TaskStatus.DONE
      ? 'done'
      : status === TaskStatus.READY_FOR_REVIEW
        ? 'review'
        : status === TaskStatus.IN_PROGRESS
          ? 'progress'
          : 'todo';
  return <span className={`badge ${className}`}>{status}</span>;
}
