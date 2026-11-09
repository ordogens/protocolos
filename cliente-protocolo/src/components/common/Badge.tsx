import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-brand-50 text-brand-600 border border-brand-100',
    secondary: 'bg-slate-100 text-slate-600 border border-slate-200',
    success: 'bg-green-50 text-green-600 border border-green-100',
    warning: 'bg-amber-100 text-amber-700 border border-amber-200',
    error: 'bg-rose-100 text-rose-700 border border-rose-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
