import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore.js';
import { useExternalLinks } from '../hooks/useExternalLinks.js';

export default function AdminRibbon() {
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const navigate = useNavigate();
  const { data: bookingLinks } = useExternalLinks('booking');
  const bookingUrl = bookingLinks?.[0]?.url ?? '#';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = user?.prenom || user?.email?.split('@')[0] || 'Praticien';

  return (
    <div className="admin-ribbon">
      <div className="wrap admin-ribbon-inner">
        <span className="badge"><span className="dot"></span>Connectée — Espace praticien</span>
        <span className="greeting">Bienvenue {displayName}</span>
        <div className="admin-actions">
          <Link to="/admin" className="ab">Tableau de bord</Link>
          <a className="ab primary" href={bookingUrl} target="_blank" rel="noopener noreferrer">Nouveau RDV</a>
          <button className="ab danger" onClick={handleLogout}>Déconnexion</button>
        </div>
      </div>
    </div>
  );
}
