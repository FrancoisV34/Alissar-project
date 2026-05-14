import { Link } from 'react-router-dom';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { useExternalLinks } from '../hooks/useExternalLinks.js';
import useStore from '../store/useStore.js';
import { Icon } from './IconSet.jsx';
import AdminRibbon from './AdminRibbon.jsx';

export default function Topbar() {
  const { data: cfg } = useSiteConfig();
  const { data: bookingLinks } = useExternalLinks('booking');
  const user = useStore((s) => s.user);

  const bookingUrl = bookingLinks?.[0]?.url ?? '#';
  const phone = cfg?.phone ?? '';
  const telHref = `tel:${phone.replace(/\s+/g, '')}`;
  const initial = (cfg?.practitioner_name ?? 'A').trim().charAt(0).toUpperCase();
  const isPraticien = user?.role === 'admin' || user?.role === 'praticien';

  return (
    <>
      {isPraticien && <AdminRibbon />}
      <div className="topbar">
        <div className="wrap topbar-inner">
          <a href="#top" className="brand">
            <span className="brand-mark">{initial}</span>
            <span className="brand-text">
              {cfg?.practitioner_name ?? ''}
              <small>{cfg?.profession ?? ''}{cfg?.address ? ' · ' + cfg.address.split(',').pop().trim() : ''}</small>
            </span>
          </a>
          <nav className="nav-desktop">
            <a href="#specialties">Spécialités</a>
            <a href="#about">À propos</a>
            {cfg?.show_formations ? <a href="#formations">Formations</a> : null}
            {cfg?.show_reviews ? <a href="#reviews">Avis</a> : null}
            <a href="#pratique">Tarifs &amp; accès</a>
            {cfg?.show_faq ? <a href="#faq">FAQ</a> : null}
          </nav>
          <div className="topbar-cta">
            {phone && (
              <a className="iconbtn" href={telHref} aria-label="Téléphone"><Icon.Phone /></a>
            )}
            <a className="btn btn-primary btn-sm" href={bookingUrl} target="_blank" rel="noopener noreferrer">
              Prendre RDV <Icon.Arrow className="arrow" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
