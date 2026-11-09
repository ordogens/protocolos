import { cn } from '../../utils/cn';

interface NotificationStatusProps {
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
}

export function NotificationStatus({ status, sentAt }: NotificationStatusProps) {
  const variants = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Pendiente' },
    sent: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', label: 'Enviado' },
    failed: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', label: 'Error' },
  };
  const v = variants[status];

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors', v.bg, v.text, v.border)}>
      {v.label}
      {status === 'sent' && sentAt && <span className="ml-2 opacity-70 font-medium">{new Date(sentAt).toLocaleString()}</span>}
    </span>
  );
}
