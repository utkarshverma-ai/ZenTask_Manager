import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number;
  note: string;
  icon: LucideIcon;
  alert?: boolean;
}

export function MetricCard({ label, value, note, icon: Icon, alert }: MetricCardProps) {
  return (
    <article className={`metric ${alert ? 'alerting' : ''}`}>
      <Icon aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
