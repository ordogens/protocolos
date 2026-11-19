import type { Friend } from '@/types';
import { api } from './api';

interface ContactsResponse { contacts: Friend[] }
interface ContactResponse { contact: Friend }
interface TelegramLinkResponse { link: string; expiresAt: string }

export const contactsService = {
  list: () => api<ContactsResponse>('/api/contacts'),
  create: (name: string, contact: string) => api<ContactResponse>('/api/contacts', { method: 'POST', body: JSON.stringify({ name, contact }) }),
  remove: (contactId: string) => api<void>(`/api/contacts/${contactId}`, { method: 'DELETE' }),
  createTelegramLink: (contactId: string) => api<TelegramLinkResponse>(`/api/contacts/${contactId}/telegram-link`, { method: 'POST' }),
};
