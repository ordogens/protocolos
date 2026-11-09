import { ActivityChip } from './ActivityChip';
import type { Protocol, Activity } from '../../types';
import { protocolImages } from '../../data/protocolImages';

interface ProtocolDetailProps {
  protocol: Protocol;
  selectedActivity?: Activity;
  onActivitySelect: (activity: Activity) => void;
  onStart: () => void;
  loading?: boolean;
}

export function ProtocolDetail({ protocol, selectedActivity, onActivitySelect, onStart, loading }: ProtocolDetailProps) {
  return (
    <div className="protocol-detail">
      <section
        className={`protocol-detail-hero protocol-detail-hero--${protocol.id}`}
        style={{ backgroundImage: `linear-gradient(0deg, rgba(5, 9, 18, .94) 0%, rgba(5, 9, 18, .18) 68%, rgba(5, 9, 18, .05) 100%), url("${protocolImages[protocol.id]}")` }}
      >
        <div className="protocol-detail-hero__badge">{protocol.icon}</div>
        <div>
          <p className="eyebrow">{protocol.category}</p>
          <h1>{protocol.name}</h1>
          <p>{protocol.description}</p>
        </div>
      </section>

      <section className="activity-section">
        <div className="section-heading">
          <h2>Ideas de actividades</h2>
          <span>{protocol.activities.length} ideas</span>
        </div>
        <div className="activity-list">
          {protocol.activities.map((activity) => (
            <ActivityChip
              key={activity.id}
              activity={activity}
              selected={selectedActivity?.id === activity.id}
              onSelect={() => onActivitySelect(activity)}
            />
          ))}
        </div>
      </section>

      <button
        onClick={onStart}
        className="detail-start-cta"
        disabled={loading || !selectedActivity}
      >
        <span aria-hidden="true">➤</span>
        {loading ? 'Preparando…' : selectedActivity ? 'Iniciar protocolo' : 'Elige una actividad'}
      </button>
    </div>
  );
}
