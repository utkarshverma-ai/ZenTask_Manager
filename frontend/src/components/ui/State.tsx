import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react';
import { ReactNode } from 'react';
export const LoadingState = () => (
  <div className="state">
    <LoaderCircle className="spin" aria-hidden="true" />
    <p>Loading your workspace…</p>
  </div>
);
export const EmptyState = ({ title, children, action }: { title: string; children: string; action?: ReactNode }) => (
  <div className="state empty">
    <Inbox aria-hidden="true" />
    <h2>{title}</h2>
    <p>{children}</p>
    {action}
  </div>
);
export const ErrorAlert = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="alert error" role="alert">
    <AlertCircle aria-hidden="true" />
    <div>
      <strong>Something needs attention.</strong>
      <p>{message}</p>
    </div>
    {onRetry && (
      <button className="button secondary" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
);
