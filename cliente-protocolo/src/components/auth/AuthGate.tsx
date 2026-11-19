import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function AuthGate() {
  const status = useAuthStore((state) => state.status);
  const initialize = useAuthStore((state) => state.initialize);
  const location = useLocation();

  useEffect(() => { void initialize(); }, [initialize]);

  if (status === 'loading') return <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">Comprobando sesión…</main>;
  return status === 'authenticated' ? <Outlet /> : <Navigate to="/acceso" replace state={{ from: location.pathname }} />;
}
