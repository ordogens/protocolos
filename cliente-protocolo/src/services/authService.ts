import type { User } from '@/types';
import { api } from './api';

interface AuthResponse { user: User }

export const authService = {
  register: (email: string, password: string) => api<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) => api<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => api<AuthResponse>('/api/auth/me'),
  logout: () => api<void>('/api/auth/logout', { method: 'POST' }),
};
