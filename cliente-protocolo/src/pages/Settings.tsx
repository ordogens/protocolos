import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useContactsStore } from '../stores/contactsStore';

export function Settings() {
  const navigate = useNavigate();
  const friend = useNotificationStore((state) => state.friend);
  const setFriend = useNotificationStore((state) => state.setFriend);
  const contacts = useContactsStore((state) => state.contacts);
  const contactsLoading = useContactsStore((state) => state.loading);
  const loadContacts = useContactsStore((state) => state.load);
  const addContact = useContactsStore((state) => state.add);
  const removeContact = useContactsStore((state) => state.remove);
  const createTelegramLink = useContactsStore((state) => state.createTelegramLink);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [name, setName] = useState(friend?.name ?? '');
  const [contact, setContact] = useState(friend?.contact ?? '');
  const [message, setMessage] = useState('');
  const [telegramLink, setTelegramLink] = useState('');

  useEffect(() => { void loadContacts(); }, [loadContacts]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      const created = await addContact(name.trim(), contact.trim());
      setFriend(created);
      setName('');
      setContact('');
      setMessage(`${created.name} quedó seleccionado para la próxima invitación.`);
    } catch {
      setMessage('No se pudo guardar el contacto. Revisa los datos o intenta más tarde.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/acceso', { replace: true });
  };

  const handleTelegramLink = async (contactId: string, contactName: string) => {
    setMessage('');
    setTelegramLink('');
    try {
      const result = await createTelegramLink(contactId);
      setTelegramLink(result.link);
      setMessage(`Comparte este enlace con ${contactName}. Vence en una hora.`);
    } catch {
      setMessage('No se pudo crear el enlace de Telegram. Revisa que el servidor y el token estén activos.');
    }
  };

  return (
    <div className="space-y-6 p-4 pb-20">
      <header>
        <Link to="/" className="mb-3 inline-flex min-h-11 items-center text-sm text-slate-500">← Volver</Link>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Ajustes</h1>
        <p className="text-xs text-slate-500">Guarda y selecciona tus contactos de Telegram.</p>
        {user && <p className="mt-2 text-xs text-slate-500">Sesión: {user.email}</p>}
      </header>

      <form onSubmit={handleSave} className="max-w-md space-y-4">
        <label htmlFor="friend-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Nombre del amigo
          <input id="friend-name" required value={name} onChange={(event) => { setName(event.target.value); setMessage(''); }} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal normal-case" />
        </label>
        <label htmlFor="friend-contact" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Identificador de Telegram (opcional)
          <input id="friend-contact" value={contact} onChange={(event) => { setContact(event.target.value); setMessage(''); }} placeholder="Se vinculará automáticamente después" className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal normal-case" />
        </label>
        <button type="submit" className="w-full rounded-2xl bg-brand-600 px-5 py-4 font-semibold text-white">Guardar contacto</button>
        {message && <p role="status" className="text-sm text-green-700">{message}</p>}
        <p className="text-xs text-slate-500">Después usa “Vincular Telegram” para asociar el chat real del contacto.</p>
      </form>
      {telegramLink && <section className="rounded-xl border border-slate-700 p-3"><p className="text-xs text-slate-300">Enlace de vinculación</p><a href={telegramLink} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm text-brand-400 underline">{telegramLink}</a></section>}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200">Tus contactos</h2>
        {contactsLoading ? <p className="text-sm text-slate-500">Cargando contactos…</p> : contacts.length === 0 ? <p className="text-sm text-slate-500">Aún no has guardado contactos.</p> : contacts.map((item) => (
          <article key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 p-3">
            <button type="button" onClick={() => { setFriend(item); setMessage(`${item.name} quedó seleccionado.`); }} className="min-w-0 text-left">
              <span className="block font-semibold text-slate-100">{item.name}</span>
              <span className="block truncate text-xs text-slate-400">Telegram · {item.contact}</span>
            </button>
            <div className="flex flex-col items-end gap-2">
              <button type="button" onClick={() => { void handleTelegramLink(item.id, item.name); }} className="text-xs font-semibold text-brand-400">Vincular Telegram</button>
              <button type="button" onClick={() => { void removeContact(item.id); }} className="text-xs font-semibold text-rose-400">Eliminar</button>
            </div>
          </article>
        ))}
      </section>
      <button type="button" onClick={() => { void handleLogout(); }} className="text-sm font-semibold text-rose-700 underline underline-offset-4">Cerrar sesión</button>
    </div>
  );
}
