import { cn } from '../../utils/cn';

interface MobileContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: string;
}

export function MobileContainer({ className, maxWidth = '390px', children, ...props }: MobileContainerProps) {
  return (
    <div className={cn(`w-full max-w-[${maxWidth}] mx-auto px-4`, className)} {...props}>
      {children}
    </div>
  );
}
