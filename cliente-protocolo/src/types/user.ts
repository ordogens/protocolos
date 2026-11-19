import type { NotificationChannel } from './notification';

export interface User {
  id: string;
  email: string;
}

export interface AppPreferences {
  notificationChannel: NotificationChannel;
  friendId?: string;
  theme: 'light' | 'dark' | 'system';
}
