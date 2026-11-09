import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  className,
  label,
  error,
  id,
  ...props
}: InputProps) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</label>
      )}
      <input
        id={id}
        className={cn(
          'flex h-10 w-full rounded-2xl border border-slate-200 bg-green-50 text-sm pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none',
          error && 'border-rose-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}
