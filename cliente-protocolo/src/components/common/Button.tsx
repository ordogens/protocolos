import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-brand-600 text-white shadow-card hover:bg-brand-700 focus:ring-brand-500 active:scale-[0.98]',
    secondary: 'bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-green-50 focus:ring-slate-500 active:scale-[0.98]',
    outline: 'border border-slate-300 text-slate-700 bg-transparent hover:bg-slate-100 focus:ring-slate-500 active:scale-[0.98]',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-500 active:scale-[0.98]',
  };
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    />
  );
}
