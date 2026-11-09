import { NavLink, Outlet, useLocation } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Inicio', icon: '⌂', end: true },
  { to: '/notificaciones', label: 'Historial', icon: '◷' },
  { to: '/ajustes', label: 'Ajustes', icon: '⚙' },
];

export function AppLayout() {
  const { pathname } = useLocation();
  const hideNavigation = pathname === '/iniciar' || pathname.startsWith('/protocolos/');

  return (
    <div className="app-shell">
      <main className={`app-phone${hideNavigation ? ' app-phone--focused' : ''}`}>
        <Outlet />
      </main>
      {!hideNavigation && (
        <nav className="bottom-navigation" aria-label="Navegación principal">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `bottom-navigation__item${isActive ? ' is-active' : ''}`}
            >
              <span className="bottom-navigation__icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
