import { api } from './api';

export interface ReceivedInvitation {
  protocolId: string;
  activityId: string;
  scheduledAt: string | null;
  responseStatus: 'pending' | 'accepted' | 'declined';
  respondedAt: string | null;
}

export const invitationResponsesService = {
  get: (token: string) => api<{ invitation: ReceivedInvitation }>(`/api/invitation-responses/${encodeURIComponent(token)}`),
  answer: (token: string, response: 'accepted' | 'declined') => api<{ responseStatus: 'accepted' | 'declined'; respondedAt: string }>(`/api/invitation-responses/${encodeURIComponent(token)}`, { method: 'POST', body: JSON.stringify({ response }) }),
};
