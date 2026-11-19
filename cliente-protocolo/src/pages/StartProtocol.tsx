import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { protocols } from '../data/protocols';
import { protocolImages } from '../data/protocolImages';
import { invitationsService } from '../services/invitationsService';
import { useContactsStore } from '../stores/contactsStore';
import type { ProtocolId } from '../types';

const getLocalDateValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const minutes = index * 30;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const labelDate = new Date(2000, 0, 1, hour, minute);
  const label = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' }).format(labelDate);
  return { value, label };
});

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
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minimumScheduleDate = getLocalDateValue(tomorrow);
  const initialScheduleDate = state.scheduledDate && state.scheduledDate >= minimumScheduleDate
    ? state.scheduledDate
    : '';
  const dateInputRef = useRef<HTMLInputElement>(null);
  const contacts = useContactsStore((store) => store.contacts);
  const contactsLoading = useContactsStore((store) => store.loading);
  const loadContacts = useContactsStore((store) => store.load);
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState(initialScheduleDate);
  const [scheduledTime, setScheduledTime] = useState(initialScheduleDate ? state.scheduledTime ?? '' : '');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const isScheduled = Boolean(scheduledDate || scheduledTime);

  useEffect(() => { void loadContacts(); }, [loadContacts]);

  const toggleRecipient = (contactId: string) => {
    setRecipientIds((current) => current.includes(contactId)
      ? current.filter((id) => id !== contactId)
      : [...current, contactId]);
    setError('');
  };

  const openCalendar = () => {
    const input = dateInputRef.current;
    if (!input) return;
    try {
      if (typeof input.showPicker === 'function') input.showPicker();
      else input.click();
    } catch {
      input.click();
      input.focus();
    }
  };

  if (!protocol || !activity) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">Selecciona un protocolo y una actividad</h1>
        <p className="mt-2 text-sm text-slate-500">Elige primero qué quieres hacer.</p>
        <Link to="/" className="mt-4 inline-block rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white">Volver al inicio y elegir un plan</Link>
      </div>
    );
  }

  const handleStart = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (recipientIds.length === 0) {
      setError('Selecciona al menos un contacto guardado.');
      return;
    }
    if (Boolean(scheduledDate) !== Boolean(scheduledTime)) {
      setError('Selecciona una fecha desde mañana y una hora para programar.');
      return;
    }

    let scheduledAt: string | undefined;
    if (scheduledDate && scheduledTime) {
      if (scheduledDate < minimumScheduleDate) {
        setError('La programación debe comenzar mañana o en una fecha posterior.');
        return;
      }
      const date = new Date(`${scheduledDate}T${scheduledTime}`);
      if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
        setError('Elige una fecha y hora futuras, desde mañana.');
        return;
      }
      scheduledAt = date.toISOString();
    }

    setSending(true);
    try {
      await invitationsService.create({
        protocolId: protocol.id,
        activityId: activity.id,
        recipientIds,
        ...(scheduledAt ? { scheduledAt } : {}),
      });
      setSuccess(true);
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
            ? `La invitación quedó programada para ${new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()} para ${recipientIds.length} contacto${recipientIds.length === 1 ? '' : 's'}.`
            : `La invitación para ${protocol.name} · ${activity.title} quedó guardada para ${recipientIds.length} contacto${recipientIds.length === 1 ? '' : 's'}.`}
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
        <p>Invita a uno o varios contactos a sumarse a este plan.</p>
      </header>

      <section className="invite-plan-card" style={{ backgroundImage: `linear-gradient(90deg, rgba(10, 15, 26, .94), rgba(10, 15, 26, .45)), url("${protocolImages[protocol.id]}")` }}>
        <span className="invite-plan-card__icon">{protocol.icon}</span>
        <span><strong>{protocol.name}</strong><small>{activity.title}</small></span>
      </section>

      <form noValidate onSubmit={handleStart} className="invite-form">
        <section className="invite-recipient-card">
          <div className="friend-selector">
            <h2>Enviar a</h2>
            <p className="text-sm text-slate-400">Marca uno o varios contactos de Telegram.</p>
            {contactsLoading ? <p className="text-sm text-slate-400">Cargando contactos…</p> : contacts.length === 0 ? (
              <p className="text-sm text-slate-400">Aún no tienes contactos. <Link to="/ajustes" className="font-semibold text-brand-400">Crear contacto</Link></p>
            ) : contacts.map((contact) => (
              <label key={contact.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 p-3 text-sm text-slate-100">
                <input
                  type="checkbox"
                  checked={recipientIds.includes(contact.id)}
                  onChange={() => toggleRecipient(contact.id)}
                  className="h-4 w-4"
                />
                <span className="min-w-0"><strong className="block">{contact.name}</strong><small className="block truncate text-slate-400">Telegram · {contact.contact}</small></span>
              </label>
            ))}
          </div>
        </section>

        <fieldset className="invite-schedule">
          <legend>¿Cuándo?</legend>
          <label className="schedule-date-field">
            Fecha
            <span className="schedule-date-control">
              <input
                ref={dateInputRef}
                id="scheduled-date"
                type="date"
                min={minimumScheduleDate}
                value={scheduledDate}
                onChange={(event) => { setScheduledDate(event.target.value); setError(''); }}
              />
              <button type="button" onClick={openCalendar} aria-label="Abrir calendario" className="calendar-trigger">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
              </button>
            </span>
          </label>
          <label>
            Hora
            <select value={scheduledTime} onChange={(event) => { setScheduledTime(event.target.value); setError(''); }}>
              <option value="">Seleccionar hora</option>
              {timeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </fieldset>

        {isScheduled && (
          <button
            type="button"
            className="invite-send-now"
            onClick={() => { setScheduledDate(''); setScheduledTime(''); setError(''); }}
          >
            Quitar programación y enviar ahora
          </button>
        )}

        {error && <p role="alert" className="invite-error">{error}</p>}
        {isScheduled && <p className="invite-note">La programación ya queda guardada. La cola automática de Telegram se conectará en el siguiente paso.</p>}
        <button type="submit" disabled={sending} className="invite-cta">
          <span aria-hidden="true">➤</span>
          {sending ? 'Preparando invitación…' : isScheduled ? 'Programar invitación' : 'Mandar invitación'}
        </button>
        <Link to={`/protocolos/${protocol.id}`} className="invite-cancel">Cancelar</Link>
      </form>
    </div>
  );
}
