import { cn } from '../../utils/cn';
import { Text } from '../common/Text';

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function Header({ className, title, ...props }: HeaderProps) {
  return (
    <header className={cn('flex items-center justify-between px-4 py-3', className)} {...props}>
      {title && <Text as="h2" variant="shock">{title}</Text>}
      <div className="flex items-center gap-2" />
    </header>
  );
}
