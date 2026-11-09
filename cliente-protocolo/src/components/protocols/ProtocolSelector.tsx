import { cn } from '../../utils/cn';
import type { Protocol } from '../../types';

interface ProtocolSelectorProps {
  protocols: Protocol[];
  onSelect: (id: string) => void;
}

export function ProtocolSelector({ protocols, onSelect }: ProtocolSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 rotate-neg">Elige un protocolo</h1>
        <p className="text-slate-600 text-base">Selecciona el tipo de plan que más te convenga hoy.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {protocols.map((protocol) => (
          <button
            key={protocol.id}
            onClick={() => onSelect(protocol.id)}
            className={cn('flex flex-col items-center justify-center gap-3 px-4 py-5 rounded-3xl border border-green-100 bg-white shadow-sm hover:bg-brand-50 hover:border-brand-200 transition-colors duration-200 touch-manipulation', 'border')}
          >
            <span className="text-4xl">{protocol.icon}</span>
            <div className="text-center">
              <span className="block font-semibold text-slate-900 text-sm">{protocol.name}</span>
              <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">{protocol.category}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
