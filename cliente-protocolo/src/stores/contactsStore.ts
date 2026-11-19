import type { Friend } from '@/types';
import { contactsService } from '@/services/contactsService';
import { create } from 'zustand';

interface ContactsState {
  contacts: Friend[];
  loading: boolean;
  load: () => Promise<void>;
  add: (name: string, contact: string) => Promise<Friend>;
  remove: (contactId: string) => Promise<void>;
  createTelegramLink: (contactId: string) => Promise<{ link: string; expiresAt: string }>;
}

export const useContactsStore = create<ContactsState>((set) => ({
  contacts: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      const { contacts } = await contactsService.list();
      set({ contacts });
    } finally {
      set({ loading: false });
    }
  },
  add: async (name, contact) => {
    const { contact: created } = await contactsService.create(name, contact);
    set((state) => ({ contacts: [created, ...state.contacts] }));
    return created;
  },
  remove: async (contactId) => {
    await contactsService.remove(contactId);
    set((state) => ({ contacts: state.contacts.filter((contact) => contact.id !== contactId) }));
  },
  createTelegramLink: (contactId) => contactsService.createTelegramLink(contactId),
}));
