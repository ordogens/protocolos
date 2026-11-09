import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { Home } from '../pages/Home';
import { ProtocolDetail } from '../pages/ProtocolDetail';
import { StartProtocol } from '../pages/StartProtocol';
import { Notifications } from '../pages/Notifications';
import { Settings } from '../pages/Settings';
import { AppLayout } from '../components/layout/AppLayout';

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/protocolos/:id', element: <ProtocolDetail /> },
      { path: '/iniciar', element: <StartProtocol /> },
      { path: '/notificaciones', element: <Notifications /> },
      { path: '/ajustes', element: <Settings /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

export const AppRouter = createBrowserRouter(routes);
