import { Link, useNavigate } from 'react-router-dom';
import { ProtocolList } from '../components/protocols/ProtocolList';
import { protocols } from '../data/protocols';
import { protocolImages } from '../data/protocolImages';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="page-stack home-page">
      <header className="home-topbar">
        <div className="home-brand">
          <span className="home-brand__mark" aria-hidden="true">⌁</span>
          <span>Protocolos</span>
        </div>
        <Link to="/notificaciones" className="home-bell" aria-label="Ver historial de invitaciones">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
        </Link>
      </header>

      <section
        className="home-hero"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(5, 9, 18, .84) 0%, rgba(5, 9, 18, .45) 62%, rgba(5, 9, 18, .08) 100%), linear-gradient(0deg, rgba(5, 9, 18, .74), transparent 75%), url("${protocolImages.caminar}")` }}
      >
        <p className="eyebrow">TU MOMENTO, TU PLAN</p>
        <h1>¿Qué hacemos hoy?</h1>
        <p>Elige un protocolo, planea la salida y actívalo con un solo toque.</p>
      </section>

      <section className="home-protocols">
        <div className="section-heading">
          <h2>Elige un plan</h2>
        </div>
        <ProtocolList protocols={protocols} onSelect={(id) => navigate(`/protocolos/${id}`)} />
      </section>
    </div>
  );
}
