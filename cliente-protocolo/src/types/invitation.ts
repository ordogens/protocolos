export type InvitationStatus = 'pending' | 'scheduled' | 'processing' | 'completed' | 'cancelled' | 'failed';
export type InvitationRecipientStatus = 'pending' | 'scheduled' | 'sent' | 'failed' | 'cancelled';

export interface InvitationRecipient {
  id: string;
  contactId: string | null;
  name: string;
  channel: 'telegram';
  contact: string;
  status: InvitationRecipientStatus;
  sentAt: string | null;
  responseStatus: 'pending' | 'accepted' | 'declined' | null;
  respondedAt: string | null;
}

export interface Invitation {
  id: string;
  protocolId: string;
  activityId: string;
  scheduledAt: string | null;
  status: InvitationStatus;
  createdAt: string;
  cancelledAt: string | null;
  recipients: InvitationRecipient[];
}
