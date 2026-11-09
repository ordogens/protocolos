import { Link, useNavigate } from 'react-router-dom';
import { ProtocolList } from '../components/protocols/ProtocolList';
import { protocols } from '../data/protocols';

export function ProtocolSelector() {
  const navigate = useNavigate();

  return (
    <div className="page-stack">
      <header className="page-heading">
        <Link to="/" className="back-link">← Volver</Link>
        <p className="eyebrow">ENCUENTRA TU PLAN</p>
        <h1>Seleccionar protocolo</h1>
        <p>Elige el tipo de plan que más te convenga hoy.</p>
      </header>
      <ProtocolList protocols={protocols} onSelect={(id) => navigate(`/protocolos/${id}`)} />
    </div>
  );
}
