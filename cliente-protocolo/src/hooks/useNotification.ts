import { useCallback } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import { notificationService } from '@/services/notificationService';
import { type NotificationChannel, type ProtocolId } from '@/types';

export const useNotification = () => {
  const { addNotification, friend } = useNotificationStore();

  const send = useCallback(
    async (
      channel: NotificationChannel,
      payload: {
        protocolId: ProtocolId;
        protocol: string;
        activityId: string;
        activity: string;
        user: string;
        message: string;
      },
      scheduledAt?: string,
      recipientOverride?: { name: string; contact: string; channel: NotificationChannel },
    ) => {
      const recipient = recipientOverride ?? friend;
      if (!recipient) {
        throw new Error('No hay amigo configurado');
      }

      const createdAt = new Date().toISOString();
      const result: { success: boolean; simulated?: boolean; error?: string } = scheduledAt
        ? { success: true }
        : await notificationService.sendNotification(channel, { ...payload, sentAt: createdAt });

      addNotification({
        protocolId: payload.protocolId,
        activityId: payload.activityId,
        recipientName: recipient.name,
        recipientContact: recipient.contact,
        channel,
        status: scheduledAt || result.simulated ? 'pending' : result.success ? 'sent' : 'failed',
        createdAt,
        ...(scheduledAt ? { scheduledAt } : result.simulated || !result.success ? {} : { sentAt: createdAt }),
        payload: { ...payload, ...(scheduledAt ? { scheduledAt } : {}) },
      });

      if (result.success) {
        // El ID se asigna en addNotification; aquí podríamos rastrearlo
      } else {
        console.error('Error enviando notificación:', result.error);
      }

      return result;
    },
    [addNotification, friend]
  );

  return { send, friend };
};
