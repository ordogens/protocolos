import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ProtocolDetail as ProtocolDetailView } from '../components/protocols/ProtocolDetail';
import { protocols } from '../data/protocols';
import type { Activity } from '../types';

export function ProtocolDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const protocol = protocols.find((item) => item.id === id);
  const [selectedActivity, setSelectedActivity] = useState<Activity>();

  if (!protocol) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-xl font-bold text-slate-900">Protocolo no encontrado</h1>
        <Link to="/" className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-slate-400 underline underline-offset-4 hover:text-brand-600">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="page-stack protocol-detail-page">
      <Link to="/" className="back-link">← Volver al inicio</Link>
      <ProtocolDetailView
        protocol={protocol}
        selectedActivity={selectedActivity}
        onActivitySelect={setSelectedActivity}
        onStart={() => navigate('/iniciar', {
          state: { protocolId: protocol.id, activityId: selectedActivity?.id },
        })}
      />
    </div>
  );
}
