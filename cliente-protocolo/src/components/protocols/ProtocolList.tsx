import type { Protocol } from '../../types';

interface ProtocolListProps {
  protocols: Protocol[];
  onSelect: (id: string) => void;
}

export function ProtocolList({ protocols, onSelect }: ProtocolListProps) {
  return (
    <div className="protocol-grid">
      {protocols.map((protocol) => (
        <ProtocolCard key={protocol.id} protocol={protocol} onSelect={onSelect} />
      ))}
    </div>
  );
}

import { ProtocolCard } from './ProtocolCard';
