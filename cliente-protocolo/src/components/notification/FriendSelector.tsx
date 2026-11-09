import type { Friend, NotificationChannel } from '../../types';

type FriendFormValue = Pick<Friend, 'name' | 'contact' | 'channel'>;

interface FriendSelectorProps {
  friend: FriendFormValue | null;
  onChange: (friend: Partial<FriendFormValue>) => void;
  channels: { value: NotificationChannel; label: string }[];
}

export function FriendSelector({ friend, onChange, channels }: FriendSelectorProps) {
  return (
    <div className="friend-selector">
      <h2>Enviar a</h2>
      <label>
        Nombre del amigo
        <input required autoComplete="name" value={friend?.name ?? ''} onChange={(event) => onChange({ name: event.target.value })} placeholder="Nombre" />
      </label>
      <label>
        Contacto
        <input required autoComplete="email" value={friend?.contact ?? ''} onChange={(event) => onChange({ contact: event.target.value })} placeholder="Teléfono, usuario o email" />
      </label>
      <label>
        Canal
        <select value={friend?.channel ?? channels[0]?.value ?? 'telegram'} onChange={(event) => onChange({ channel: event.target.value as NotificationChannel })}>
          {channels.map((channel) => <option key={channel.value} value={channel.value}>{channel.label}</option>)}
        </select>
      </label>
    </div>
  );
}
