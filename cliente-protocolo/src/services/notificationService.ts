import { type NotificationChannel } from '@/types';

export interface NotificationPayload {
  protocol: string;
  activity: string;
  user: string;
  message: string;
  sentAt: string;
}

export const notificationService = {
  sendNotification: async (
    channel: NotificationChannel,
    payload: NotificationPayload
  ): Promise<{ success: boolean; simulated?: boolean; error?: string }> => {
    try {
      // El canal real se define en .env y se implementa aquí (Telegram, WhatsApp, etc.)
      console.log(`[${channel}] Notificación enviada:`, payload);
      return { success: true, simulated: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error desconocido',
      };
    }
  },
};
