import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { protocols } from '../data/protocols';
import { invitationsService } from '../services/invitationsService';
import type { Invitation, InvitationStatus } from '../types';

const statusLabel: Record<InvitationStatus, string> = {
  pending: 'Pendiente',
  scheduled: 'Programada',
  processing: 'En proceso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  failed: 'Con error',
};

export function Notifications() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void invitationsService.list()
      .then(({ invitations: saved }) => setInvitations(saved))
      .catch(() => setError('No se pudo cargar el historial. Intenta nuevamente.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 p-4 pb-20">
      <header>
        <Link to="/" className="mb-3 inline-flex min-h-11 items-center text-sm text-slate-500">← Volver</Link>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Invitaciones</h1>
        <p className="text-xs text-slate-500">Guardadas en tu cuenta</p>
      </header>

      {loading ? <p className="py-12 text-center text-slate-500">Cargando invitaciones…</p> : error ? <p role="alert" className="py-12 text-center text-rose-600">{error}</p> : invitations.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-slate-500">Aún no has creado invitaciones.</p>
          <Link to="/" className="mt-3 inline-block font-semibold text-brand-600">Ir al inicio a elegir un plan</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map((invitation) => {
            const protocol = protocols.find((item) => item.id === invitation.protocolId);
            const activity = protocol?.activities.find((item) => item.id === invitation.activityId);
            const date = invitation.scheduledAt ?? invitation.createdAt;
            return (
              <article key={invitation.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{protocol?.name ?? invitation.protocolId}</p>
                  <p className="text-sm text-slate-500">{activity?.title ?? invitation.activityId}</p>
                  <p className="mt-1 text-xs text-slate-400">{invitation.recipients.map((recipient) => `${recipient.name}: ${recipient.responseStatus === 'accepted' ? 'aceptó' : recipient.responseStatus === 'declined' ? 'rechazó' : 'sin responder'}`).join(' · ')}</p>
                  <p className="mt-1 text-xs text-slate-400">{invitation.scheduledAt ? 'Programada para' : 'Creada'}: {new Date(date).toLocaleString()}</p>
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-700">{statusLabel[invitation.status]}</span>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
