import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  className,
  padding = 'md',
  children,
  ...props
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-3xl border border-green-100 bg-white shadow-sm',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
