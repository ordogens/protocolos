import { cn } from '../../utils/cn';

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  className,
  children,
  ...props
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center', className)} {...props}>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full max-w-md bg-white rounded-3xl border border-green-100 p-6 shadow-card animate-in fade-in zoom-in duration-200 text-slate-900', className)}>
        {title && <h2 className="text-lg font-bold tracking-tight mb-4">{title}</h2>}
        {children}
        <button onClick={onClose} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600" aria-label="Cerrar">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
}
