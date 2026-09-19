import { ActivityLog } from '../../../types';

export function RecentActivity({ activity }: { activity: ActivityLog[] }) {
  return (
    <article className="panel">
      <div className="panel-head">
        <div>
          <h2>Recent activity</h2>
          <p>Latest workspace changes.</p>
        </div>
      </div>
      <ol className="activity-list">
        {activity.slice(0, 6).map((item) => (
          <li key={item.id}>
            <span className="activity-dot" />
            <div>
              <strong>{item.entityType.replace('_', ' ')}</strong> {item.action}
              <small>{new Date(item.timestamp).toLocaleString()}</small>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}
