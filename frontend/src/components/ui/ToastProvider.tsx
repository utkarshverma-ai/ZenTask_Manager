import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';
type Toast = { id: number; message: string; kind: ToastKind };
type ToastContextValue = { showToast: (message: string, kind?: ToastKind) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const value = useMemo(
    () => ({
      showToast(message: string, kind: ToastKind = 'success') {
        const id = Date.now();
        setToasts((current) => [...current.filter((toast) => toast.message !== message), { id, message, kind }]);
        window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4500);
      },
    }),
    [],
  );
  const icons = { success: CheckCircle2, error: XCircle, info: Info };
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-relevant="additions" role="status">
        {toasts.map((toast) => {
          const Icon = icons[toast.kind];
          return (
            <div className={`toast ${toast.kind}`} key={toast.id}>
              <Icon aria-hidden="true" />
              <span>{toast.message}</span>
              <button
                aria-label="Dismiss notification"
                className="icon-button"
                onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
              >
                <X aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}
