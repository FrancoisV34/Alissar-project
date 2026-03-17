import Docto from '/assets/rdvdocto.png';
import '../Style/Footer.scss';
import { useContact } from '../hooks/useContact.js';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { useExternalLinks } from '../hooks/useExternalLinks.js';

export default function Footer() {
  const { data } = useContact();
  const { data: config } = useSiteConfig();
  const { data: bookingLinks } = useExternalLinks('booking');
  const contact = data?.contact;
  const bookingUrl = bookingLinks?.[0]?.url ?? contact?.doctolib_url ?? '#';
  const copyrightName = config?.copyright_name ?? config?.practitioner_name ?? 'Mon Cabinet';

  return (
    <footer>
      <section className="all-info">
        <div className="name-socials">
          <div className="footer-name">
            <h3>{config ? `${config.practitioner_name} ${config.profession}` : ''}</h3>
          </div>
          <div className="socials-links">
            <a
              href={bookingUrl}
              className="doctolib"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={Docto} className="docto" alt="Logo Doctolib" />
            </a>
          </div>
        </div>
        <div className="nav-menu">
          <nav className="menu">
            <ul className="ul-list">
              <li><a href="#a-propos">A propos</a></li>
              <li><a href="#osteo">L'ostéopathie</a></li>
              <li><a href="#formations">Formations</a></li>
              <li><a href="#tarifs">Tarifs</a></li>
              <li><a href="#contacts">Contacts</a></li>
            </ul>
          </nav>
        </div>
        <div className="adresse-tel">
          <h4>Adresse : </h4>
          <p className="adresse">
            {contact?.address ? (
              contact.address.split(', ').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))
            ) : '—'}
          </p>
          <h4>Téléphone:</h4>
          <p className="tel">{contact?.phone ?? '—'}</p>
        </div>
      </section>
      <div className="dev-info">
        <p className="classic">
          Copyright © {new Date().getFullYear()} {copyrightName} | Site web créé par{' '}
          <a
            href="https://francoisv34.github.io/P8--Portfolio-Dev/"
            rel="noreferrer noopener"
            target="_blank"
          >
            François Vittecoq Dev Web
          </a>
        </p>
      </div>
    </footer>
  );
}
