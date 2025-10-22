import Docto from '../assets/rdvdocto.png';
import '../Style/Footer.scss';

export default function Footer() {
  return (
    <footer>
      <section className="all-info">
        <div className="name-socials">
          <div className="footer-name">
            <h3>Alissar Atik Ostéopathe</h3>
          </div>
          <div className="socials-links">
            <a
              href="https://www.doctolib.fr/osteopathe/vendargues/alissar-atik"
              className="doctolib"
            >
              <img src={Docto} className="docto" alt="Logo Doctolib"></img>
            </a>
          </div>
        </div>
        <div className="nav-menu">
          <nav className="menu">
            <ul className="ul-list">
              <li>
                <a>A propos</a>
              </li>
              <li>
                <a>L'ostéopathie</a>
              </li>
              <li>
                <a>Formations</a>
              </li>
              <li>
                <a>Tarifs</a>
              </li>
              <li>
                <a>Contacts</a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="adresse-tel">
          <h4>Adresse : </h4>
          <p className="adresse">
            Maison Cadoule
            <br /> 17 rue de la cadoule
            <br /> 34740 Vendargues
          </p>
          <h4>Téléphone:</h4>
          <p className="tel">06 95 34 48 93</p>
        </div>
      </section>
      <div className="dev-info">
        <p className="classic">
          Copyright © 2025 Alissar Atik Ostéopathe | Site web créé par{' '}
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
