import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { FriendSelector } from '../components/notification/FriendSelector';
import { protocols } from '../data/protocols';
import { protocolImages } from '../data/protocolImages';
import { useNotificationStore } from '../stores/notificationStore';
import type { NotificationChannel, ProtocolId } from '../types';

const channels: { value: NotificationChannel; label: string }[] = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
];

interface StartLocationState {
  protocolId?: ProtocolId;
  activityId?: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

export function StartProtocol() {
  const location = useLocation();
  const state = (location.state ?? {}) as StartLocationState;
  const protocol = protocols.find((item) => item.id === state.protocolId);
  const activity = protocol?.activities.find((item) => item.id === state.activityId);
  const { send } = useNotification();
  const savedFriend = useNotificationStore((store) => store.friend);
  const setFriend = useNotificationStore((store) => store.setFriend);
  const [recipient, setRecipient] = useState(savedFriend);
  const [scheduledDate, setScheduledDate] = useState(state.scheduledDate ?? '');
  const [scheduledTime, setScheduledTime] = useState(state.scheduledTime ?? '');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const isScheduled = Boolean(scheduledDate || scheduledTime);

  if (!protocol || !activity) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">Selecciona un protocolo y una actividad</h1>
        <p className="mt-2 text-sm text-slate-500">Elige primero qué quieres hacer.</p>
        <Link to="/protocolos" className="mt-4 inline-block rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white">Ver protocolos</Link>
      </div>
    );
  }

  const handleStart = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!recipient?.name.trim() || !recipient.contact.trim()) {
      setError('Completa el nombre y el contacto de tu amigo.');
      return;
    }
    if (Boolean(scheduledDate) !== Boolean(scheduledTime)) {
      setError('Indica tanto la fecha como la hora para programar.');
      return;
    }

    let scheduledAt: string | undefined;
    if (scheduledDate && scheduledTime) {
      const date = new Date(`${scheduledDate}T${scheduledTime}`);
      if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
        setError('Elige una fecha y hora futuras.');
        return;
      }
      scheduledAt = date.toISOString();
    }

    setSending(true);
    try {
      setFriend({ name: recipient.name.trim(), contact: recipient.contact.trim(), channel: recipient.channel });
      const result = await send(recipient.channel, {
        protocolId: protocol.id,
        protocol: protocol.name,
        activityId: activity.id,
        activity: activity.title,
        user: 'Usuario',
        message: `Inició ${protocol.name}: ${activity.title}.`,
      }, scheduledAt, recipient);
      if (result.success) setSuccess(true);
      else setError(result.error ?? 'No se pudo procesar la solicitud.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo procesar la solicitud.');
    } finally {
      setSending(false);
    }
  };

  if (success) {
    return (
      <div className="success-screen">
        <Link to="/" className="invite-close" aria-label="Cerrar">×</Link>
        <div className="invite-orb" aria-hidden="true">✓</div>
        <h1>{isScheduled ? 'Invitación programada' : 'Invitación lista'}</h1>
        <p>
          {isScheduled
            ? `La invitación quedó programada en esta sesión para ${new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}.`
            : `La invitación para ${protocol.name} · ${activity.title} se registró en modo de demostración.`}
        </p>
        <div className="invite-plan-card" style={{ backgroundImage: `linear-gradient(90deg, rgba(10, 15, 26, .93), rgba(10, 15, 26, .45)), url("${protocolImages[protocol.id]}")` }}>
          <span className="invite-plan-card__icon">{protocol.icon}</span>
          <span><strong>{protocol.name}</strong><small>{activity.title}</small></span>
        </div>
        <Link to="/notificaciones" className="invite-cta">Ver historial</Link>
        <Link to="/" className="invite-cancel">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="page-stack invite-page">
      <header className="invite-header">
        <Link to={`/protocolos/${protocol.id}`} className="invite-close" aria-label="Volver al protocolo">×</Link>
        <div className="invite-orb" aria-hidden="true">➤</div>
        <h1>¿Mandar invitación?</h1>
        <p>Invita a tu amigo a sumarse a este plan.</p>
      </header>

      <section className="invite-plan-card" style={{ backgroundImage: `linear-gradient(90deg, rgba(10, 15, 26, .94), rgba(10, 15, 26, .45)), url("${protocolImages[protocol.id]}")` }}>
        <span className="invite-plan-card__icon">{protocol.icon}</span>
        <span><strong>{protocol.name}</strong><small>{activity.title}</small></span>
      </section>

      <form onSubmit={handleStart} className="invite-form">
        <section className="invite-recipient-card">
          <FriendSelector
            friend={recipient}
            channels={channels}
            onChange={(changes) => {
              setRecipient((current) => ({
                name: current?.name ?? '',
                contact: current?.contact ?? '',
                channel: current?.channel ?? 'telegram',
                ...changes,
              }));
              setError('');
            }}
          />
        </section>

        <fieldset className="invite-schedule">
          <legend>¿Cuándo?</legend>
          <label>
            Fecha
            <input type="date" value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} />
          </label>
          <label>
            Hora
            <input type="time" value={scheduledTime} onChange={(event) => setScheduledTime(event.target.value)} />
          </label>
        </fieldset>

        {error && <p role="alert" className="invite-error">{error}</p>}
        {isScheduled && <p className="invite-note">La programación queda en memoria durante esta sesión. El envío automático se conectará más adelante.</p>}
        <button type="submit" disabled={sending} className="invite-cta">
          <span aria-hidden="true">➤</span>
          {sending ? 'Preparando invitación…' : isScheduled ? 'Programar invitación' : 'Mandar invitación'}
        </button>
        <Link to={`/protocolos/${protocol.id}`} className="invite-cancel">Cancelar</Link>
      </form>
    </div>
  );
}
