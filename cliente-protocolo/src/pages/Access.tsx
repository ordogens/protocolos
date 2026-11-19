import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

export function Access() {
  const status = useAuthStore((state) => state.status);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  if (status === 'authenticated') return <Navigate to={returnTo ?? '/'} replace />;

  const submit = async (action: 'login' | 'register') => {
    setError('');
    setSending(true);
    try {
      if (action === 'login') await login(email, password);
      else await register(email, password);
      navigate(returnTo ?? '/', { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === 'email_in_use') setError('Ese correo ya tiene una cuenta. Inicia sesión.');
      else if (caught instanceof ApiError && caught.code === 'invalid_credentials') setError('Revisa el correo y la contraseña. Debe tener al menos 12 caracteres.');
      else setError('No se pudo conectar con el servidor.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="app-phone">
        <div className="page-stack">
          <header className="page-heading">
            <p className="eyebrow">PROTOCOLS</p>
            <h1>Bienvenido de nuevo</h1>
            <p>Inicia sesión para ver tus planes, contactos e invitaciones.</p>
          </header>
          <form className="invite-form" onSubmit={(event) => { event.preventDefault(); void submit('login'); }} noValidate>
            <section className="invite-recipient-card">
              <div className="friend-selector">
                <label>Correo
                  <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Introduce tu correo" />
                </label>
                <label>Contraseña
                  <input type="password" autoComplete="current-password" required minLength={12} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Introduce tu contraseña" />
                </label>
              </div>
            </section>
            {error && <p role="alert" className="invite-error">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <button disabled={sending} type="submit" className="rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white disabled:opacity-60">
                {sending ? 'Procesando…' : 'Iniciar sesión'}
              </button>
              <button disabled={sending} type="button" onClick={() => { void submit('register'); }} className="rounded-2xl border border-slate-500 px-4 py-3 font-semibold text-slate-100 disabled:opacity-60">Crear cuenta</button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
