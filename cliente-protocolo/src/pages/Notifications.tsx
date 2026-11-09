import { Link } from 'react-router-dom';
import { NotificationStatus } from '../components/notification/NotificationStatus';
import { protocols } from '../data/protocols';
import { useNotificationStore } from '../stores/notificationStore';

export function Notifications() {
  const notifications = useNotificationStore((state) => state.notifications);

  return (
    <div className="space-y-6 p-4 pb-20">
      <header>
        <Link to="/" className="mb-3 inline-flex min-h-11 items-center text-sm text-slate-500">← Volver</Link>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Notificaciones</h1>
        <p className="text-xs text-slate-500">Actividad registrada durante esta sesión</p>
      </header>

      {notifications.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-slate-500">Aún no hay actividades registradas.</p>
          <Link to="/" className="mt-3 inline-block font-semibold text-brand-600">Ir al inicio a elegir un plan</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {[...notifications].reverse().map((notification) => {
            const protocol = protocols.find((item) => item.id === notification.protocolId);
            const activity = protocol?.activities.find((item) => item.id === notification.activityId);
            const date = notification.scheduledAt ?? notification.sentAt ?? notification.createdAt;
            return (
              <article key={notification.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{protocol?.name ?? notification.protocolId}</p>
                  <p className="text-sm text-slate-500">{activity?.title ?? 'Sin actividad'}</p>
                  <p className="mt-1 text-xs text-slate-400">{notification.recipientName} · {notification.channel}</p>
                  {date && <p className="mt-1 text-xs text-slate-400">{notification.scheduledAt ? 'Programado para' : notification.sentAt ? 'Enviado' : 'Registrado'}: {new Date(date).toLocaleString()}</p>}
                </div>
                <NotificationStatus status={notification.status} sentAt={notification.sentAt} />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
