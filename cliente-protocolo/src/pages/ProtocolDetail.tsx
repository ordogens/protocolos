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
        <Link to="/protocolos" className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-slate-400 underline underline-offset-4 hover:text-brand-600">
          Volver a la selección
        </Link>
      </div>
    );
  }

  return (
    <div className="page-stack protocol-detail-page">
      <Link to="/protocolos" className="back-link">← Volver a protocolos</Link>
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
