import { useEffect, useState } from 'react';
import { ActivityLog } from '../../../types';
import { activityService } from '../../../services/activity.service';

export function TaskActivity({ taskId }: { taskId: string }) {
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    void activityService
      .listForEntity('task', taskId)
      .then((items) => {
        setActivity(items);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [taskId]);
  return (
    <section className="task-activity">
      <h3>Activity</h3>
      {state === 'loading' && <p className="muted">Loading task history…</p>}
      {state === 'error' && <p className="field-error">Task history could not be loaded.</p>}
      {state === 'ready' && !activity.length && <p className="muted">No task activity has been recorded yet.</p>}
      {activity.map((item) => (
        <div className="timeline-item" key={item.id}>
          <span />
          <p>
            <strong>{item.action === 'created' ? 'Created' : item.action === 'updated' ? 'Updated' : 'Deleted'}</strong>
            <small>{new Date(item.timestamp).toLocaleString()}</small>
          </p>
        </div>
      ))}
    </section>
  );
}
