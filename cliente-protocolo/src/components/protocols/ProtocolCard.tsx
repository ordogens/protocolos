import type { Protocol } from '../../types';
import { protocolImages } from '../../data/protocolImages';

interface ProtocolCardProps {
  protocol: Protocol;
  onSelect: (id: string) => void;
}

export function ProtocolCard({ protocol, onSelect }: ProtocolCardProps) {
  return (
    <button
      onClick={() => onSelect(protocol.id)}
      className={`protocol-card protocol-card--${protocol.id}`}
      style={{ backgroundImage: `linear-gradient(180deg, rgba(5, 9, 18, .06) 18%, rgba(5, 9, 18, .9) 100%), url("${protocolImages[protocol.id]}")` }}
      aria-label={`${protocol.name}: ${protocol.category}`}
    >
      <span className="protocol-card__icon" aria-hidden="true">{protocol.icon}</span>
      <div className="protocol-card__copy">
        <span className="protocol-card__title">{protocol.name}</span>
        <span className="protocol-card__category">{protocol.category}</span>
      </div>
    </button>
  );
}
