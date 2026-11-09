import { create } from 'zustand';
import { type User, type AppPreferences } from '@/types';

interface UserStore {
  user: User | null;
  preferences: AppPreferences | null;
  setUser: (user: User) => void;
  setPreferences: (prefs: AppPreferences) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  preferences: null,
  setUser: (user) => set({ user }),
  setPreferences: (prefs) => set({ preferences: prefs }),
}));
