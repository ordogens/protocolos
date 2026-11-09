import { cn } from '../../utils/cn';

interface SafeAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SafeArea({ className, children, ...props }: SafeAreaProps) {
  return (
    <div className={cn('relative min-h-screen bg-green-50 text-slate-900', className)} {...props}>
      {children}
    </div>
  );
}
