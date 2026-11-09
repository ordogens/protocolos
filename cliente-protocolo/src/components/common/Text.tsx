import { cn } from '../../utils/cn';

interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  variant?: 'heading' | 'body' | 'caption' | 'muted' | 'shock';
}

const TagMap: Record<string, React.ElementType> = {
  h1: 'h1', h2: 'h2', h3: 'h3', p: 'p', span: 'span',
};

export function Text({
  as: C = 'span',
  variant = 'body',
  className,
  children,
  ...props
}: TextProps) {
  const Tag = TagMap[C] ?? 'span';
  const variants = {
    heading: 'text-slate-900 font-bold tracking-tight text-xl md:text-2xl',
    body: 'text-slate-600 text-base',
    caption: 'text-slate-400 text-xs font-semibold uppercase tracking-wider',
    muted: 'text-slate-500 text-sm',
    shock: 'text-slate-900 font-black uppercase tracking-tighter text-4xl md:text-5xl',
  };

  return (
    <Tag className={cn(variants[variant], className)} {...props}>
      {children}
    </Tag>
  );
}
