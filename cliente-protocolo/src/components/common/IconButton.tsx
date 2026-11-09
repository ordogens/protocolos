import { cn } from '../../utils/cn';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function IconButton({
  className,
  icon,
  size = 'md',
  variant = 'ghost',
  ...props
}: IconButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-brand-600 text-white shadow-card hover:bg-brand-700 focus:ring-brand-500 active:scale-[0.98]',
    secondary: 'bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-green-50 focus:ring-slate-500 active:scale-[0.98]',
    ghost: 'text-slate-600 hover:bg-green-50 focus:ring-slate-500 active:scale-[0.98]',
  };
  const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} aria-label={props['aria-label'] ?? 'Botón'} {...props}>
      {icon}
    </button>
  );
}
