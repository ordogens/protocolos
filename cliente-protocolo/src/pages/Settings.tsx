import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../stores/notificationStore';
import type { NotificationChannel } from '../types';

const channels: { value: NotificationChannel; label: string }[] = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
];

export function Settings() {
  const friend = useNotificationStore((state) => state.friend);
  const setFriend = useNotificationStore((state) => state.setFriend);
  const [name, setName] = useState(friend?.name ?? '');
  const [contact, setContact] = useState(friend?.contact ?? '');
  const [channel, setChannel] = useState<NotificationChannel>(friend?.channel ?? 'telegram');
  const [saved, setSaved] = useState(false);

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFriend({ name: name.trim(), contact: contact.trim(), channel });
    setSaved(true);
  };

  return (
    <div className="space-y-6 p-4 pb-20">
      <header>
        <Link to="/" className="mb-3 inline-flex min-h-11 items-center text-sm text-slate-500">← Volver</Link>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Ajustes</h1>
        <p className="text-xs text-slate-500">Configura el amigo destinatario</p>
      </header>

      <form onSubmit={handleSave} className="max-w-md space-y-4">
        <label htmlFor="friend-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Nombre del amigo
          <input id="friend-name" required value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal normal-case" />
        </label>
        <label htmlFor="friend-contact" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Contacto
          <input id="friend-contact" required value={contact} onChange={(event) => { setContact(event.target.value); setSaved(false); }} placeholder="Teléfono, usuario o email" className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal normal-case" />
        </label>
        <label htmlFor="friend-channel" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Canal
          <select id="friend-channel" value={channel} onChange={(event) => { setChannel(event.target.value as NotificationChannel); setSaved(false); }} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal normal-case">
            {channels.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <button type="submit" className="w-full rounded-2xl bg-brand-600 px-5 py-4 font-semibold text-white">Guardar amigo</button>
        {saved && <p role="status" className="text-sm text-green-700">Amigo guardado en esta sesión.</p>}
        <p className="text-xs text-slate-500">Los datos se conservan solo mientras esta sesión siga abierta.</p>
      </form>
    </div>
  );
}
