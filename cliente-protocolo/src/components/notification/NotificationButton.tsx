import { cn } from '../../utils/cn';

interface NotificationButtonProps {
  channel: string;
  onSend: () => Promise<void>;
  status: 'idle' | 'sending' | 'sent' | 'failed';
}

export function NotificationButton({ channel, onSend, status }: NotificationButtonProps) {
  const isLoading = status === 'sending';
  const isSent = status === 'sent';
  const isFailed = status === 'failed';

  return (
    <button
      onClick={onSend}
      disabled={isLoading}
      className={cn(
        'w-full py-4 px-6 font-semibold shadow-card transition-all duration-100 focus:ring-0 focus:outline-none disabled:opacity-50 disabled:pointer-events-none touch-manipulation active:scale-[0.98] rounded-3xl',
        isSent || isFailed
          ? isSent ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 active:shadow-none' : 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500 active:shadow-none'
          : 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 active:shadow-none'
      )}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Enviando por {channel}...
        </>
      ) : isSent ? (
        <>✓ Enviado por {channel}</>
      ) : isFailed ? (
        <>✗ Error al enviar</>
      ) : (
        `Enviar notificación por ${channel}`
      )}
    </button>
  );
}
