import { create } from 'zustand';
import { type Notification, type NotificationChannel } from '@/types';

interface NotificationState {
  notifications: Notification[];
  friend: { name: string; contact: string; channel: NotificationChannel } | null;
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  setFriend: (friend: { name: string; contact: string; channel: NotificationChannel }) => void;
  setStatus: (id: string, status: Notification['status']) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  friend: null,
  addNotification: (notification) => {
    const id = crypto.randomUUID();
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    return id;
  },
  setFriend: (friend) => set({ friend }),
  setStatus: (id, status) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, status } : n
      ),
    })),
}));
