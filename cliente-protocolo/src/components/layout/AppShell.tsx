import { cn } from '../../utils/cn';

interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AppShell({ className, children, ...props }: AppShellProps) {
  return (
    <div className={cn('min-h-screen bg-green-50 text-slate-900 flex flex-col', className)} {...props}>
      {children}
    </div>
  );
}
