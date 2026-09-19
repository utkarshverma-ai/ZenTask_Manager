import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export function Dialog({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!open) return; closeRef.current?.focus(); const key = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; document.addEventListener('keydown', key); return () => document.removeEventListener('keydown', key); }, [open, onClose]);
  if (!open) return null;
  return <div className="dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header className="dialog-header"><h2 id="dialog-title">{title}</h2><button ref={closeRef} type="button" className="icon-button" onClick={onClose} aria-label="Close dialog"><X aria-hidden="true" /></button></header>{children}</section></div>;
}
export function ConfirmDialog({ open, title, message, confirmLabel, onClose, onConfirm }: { open: boolean; title: string; message: string; confirmLabel: string; onClose: () => void; onConfirm: () => void }) { return <Dialog open={open} title={title} onClose={onClose}><div className="dialog-body"><p className="muted">{message}</p><div className="dialog-actions"><button className="button secondary" onClick={onClose}>Cancel</button><button className="button danger" onClick={onConfirm}>{confirmLabel}</button></div></div></Dialog>; }
