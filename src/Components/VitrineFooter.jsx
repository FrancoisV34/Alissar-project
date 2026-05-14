import { Link } from 'react-router-dom';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { useExternalLinks } from '../hooks/useExternalLinks.js';
import useStore from '../store/useStore.js';

export default function VitrineFooter() {
  const user = useStore((s) => s.user);
  const isPraticien = user?.role === 'admin' || user?.role === 'praticien';
  const { data: cfg } = useSiteConfig();
  const { data: bookingLinks } = useExternalLinks('booking');
  const bookingUrl = bookingLinks?.[0]?.url ?? '#';
  const phone = cfg?.phone ?? '';
  const telHref = `tel:${phone.replace(/\s+/g, '')}`;
  const year = new Date().getFullYear();
  const addressLines = (cfg?.address ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const tagline = cfg?.meta_description ?? '';

  return (
    <footer className="vfooter">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="brand-text">
              {cfg?.practitioner_name ?? ''}
              {cfg?.profession && <small>{cfg.profession}{cfg?.address ? ' · ' + cfg.address.split(',').pop().trim() : ''}</small>}
            </div>
            {tagline && <p style={{ marginTop: 24, maxWidth: '32ch' }}>{tagline}</p>}
          </div>
          <div>
            <h5>Le cabinet</h5>
            <ul>
              <li><a href="#about">À propos</a></li>
              <li><a href="#specialties">Spécialités</a></li>
              {cfg?.show_formations ? <li><a href="#formations">Formations</a></li> : null}
              {cfg?.show_reviews ? <li><a href="#reviews">Avis Google</a></li> : null}
              {cfg?.show_faq ? <li><a href="#faq">FAQ</a></li> : null}
            </ul>
          </div>
          <div>
            <h5>Pratique</h5>
            <ul>
              <li><a href="#pratique">Tarifs</a></li>
              <li><a href="#pratique">Horaires</a></li>
              <li><a href="#pratique">Accès &amp; plan</a></li>
              <li><a href={bookingUrl} target="_blank" rel="noopener noreferrer">Doctolib</a></li>
            </ul>
          </div>
          <div>
            <h5>Contact</h5>
            <ul>
              {phone && <li><a href={telHref}>{phone}</a></li>}
              {addressLines.map((line, i) => <li key={i}>{line}</li>)}
            </ul>
          </div>
        </div>
        <div className="vfooter-bottom">
          <span>© {year} {cfg?.copyright_name ?? cfg?.practitioner_name ?? ''}{cfg?.profession ? ' — ' + cfg.profession : ''}</span>
          <span>
            {isPraticien
              ? <Link to="/admin">Espace praticien</Link>
              : <Link to="/login">Espace praticien</Link>}
            {' · '}
            Site créé par <a href="https://francoisv34.github.io/P8--Portfolio-Dev/" target="_blank" rel="noopener noreferrer">François Vittecoq</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
