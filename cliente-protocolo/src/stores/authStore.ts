import { create } from 'zustand';
import { ApiError } from '@/services/api';
import { authService } from '@/services/authService';
import type { User } from '@/types';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  initialize: async () => {
    try {
      const { user } = await authService.me();
      set({ user, status: 'authenticated' });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) set({ user: null, status: 'anonymous' });
      else set({ user: null, status: 'anonymous' });
    }
  },
  login: async (email, password) => {
    const { user } = await authService.login(email, password);
    set({ user, status: 'authenticated' });
  },
  register: async (email, password) => {
    const { user } = await authService.register(email, password);
    set({ user, status: 'authenticated' });
  },
  logout: async () => {
    await authService.logout();
    set({ user: null, status: 'anonymous' });
  },
}));
