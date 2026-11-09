import { cn } from '../../utils/cn';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  loading?: boolean;
}

export function PrimaryButton({
  className,
  fullWidth = true,
  loading = false,
  children,
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={cn(
        'w-full btn-primary text-white font-semibold text-lg py-5 rounded-3xl flex items-center justify-center gap-2 shadow-card disabled:opacity-50 disabled:pointer-events-none focus:ring-0 focus:outline-none',
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Enviando...
        </>
      ) : (
        children
      )}
    </button>
  );
}
