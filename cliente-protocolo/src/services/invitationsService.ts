import type { Invitation } from '@/types';
import { api } from './api';

interface InvitationResponse { invitation: Invitation }
interface InvitationsResponse { invitations: Invitation[] }

export interface CreateInvitationInput {
  protocolId: string;
  activityId: string;
  recipientIds: string[];
  scheduledAt?: string;
}

export const invitationsService = {
  list: () => api<InvitationsResponse>('/api/invitations'),
  create: (input: CreateInvitationInput) => api<InvitationResponse>('/api/invitations', { method: 'POST', body: JSON.stringify(input) }),
  cancel: (invitationId: string) => api<InvitationResponse>(`/api/invitations/${invitationId}/cancel`, { method: 'POST' }),
};
