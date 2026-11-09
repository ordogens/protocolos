import type { ProtocolId } from './protocol';

export type NotificationChannel = 'whatsapp' | 'telegram' | 'sms' | 'email' | 'push';

export interface Notification {
  id: string;
  protocolId: ProtocolId;
  activityId?: string;
  recipientName: string;
  recipientContact: string; // teléfono, usuario o email
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'failed';
  createdAt?: string;
  sentAt?: string;
  scheduledAt?: string; // ISO8601 cuando se programa día/hora
  payload: Record<string, unknown>;
}

export interface Friend {
  id: string;
  name: string;
  contact: string;
  channel: NotificationChannel;
}
