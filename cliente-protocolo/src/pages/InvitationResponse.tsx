import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { protocols } from '../data/protocols';
import { invitationResponsesService, type ReceivedInvitation } from '../services/invitationResponsesService';

export function InvitationResponse() {
  const { token = '' } = useParams<{ token: string }>();
  const [invitation, setInvitation] = useState<ReceivedInvitation>();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void invitationResponsesService.get(token)
      .then(({ invitation: received }) => setInvitation(received))
      .catch(() => setError('Esta invitación no existe o el enlace no es válido.'));
  }, [token]);

  const answer = async (response: 'accepted' | 'declined') => {
    setSaving(true);
    setError('');
    try {
      const result = await invitationResponsesService.answer(token, response);
      setInvitation((current) => current ? { ...current, responseStatus: result.responseStatus, respondedAt: result.respondedAt } : current);
    } catch {
      setError('No se pudo guardar tu respuesta. Tal vez la invitación ya fue respondida.');
    } finally { setSaving(false); }
  };

  const protocol = protocols.find((item) => item.id === invitation?.protocolId);
  const activity = protocol?.activities.find((item) => item.id === invitation?.activityId);
  const done = invitation?.responseStatus !== 'pending';

  return <div className="page-stack invite-page">
    <header className="invite-header"><h1>{done ? 'Respuesta registrada' : '¿Aceptas la invitación?'}</h1><p>{protocol?.name ?? invitation?.protocolId ?? 'Cargando invitación…'}</p></header>
    {error ? <p role="alert" className="invite-error">{error}</p> : invitation && <section className="invite-recipient-card space-y-4">
      <h2>{activity?.title ?? invitation.activityId}</h2>
      {invitation.scheduledAt && <p>Programada para {new Date(invitation.scheduledAt).toLocaleString()}.</p>}
      {done ? <p className="text-lg font-semibold text-slate-100">{invitation.responseStatus === 'accepted' ? '✓ Aceptaste esta invitación.' : 'Declinaste esta invitación.'}</p> : <div className="grid grid-cols-2 gap-3">
        <button disabled={saving} onClick={() => { void answer('accepted'); }} className="rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white">Aceptar</button>
        <button disabled={saving} onClick={() => { void answer('declined'); }} className="rounded-2xl border border-slate-500 px-4 py-3 font-semibold text-slate-100">Rechazar</button>
      </div>}
    </section>}
    <Link to="/" className="invite-cancel">Volver al inicio</Link>
  </div>;
}
