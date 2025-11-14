import Docto from '/assets/rdvdocto.png';
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
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={Docto} className="docto" alt="Logo Doctolib"></img>
            </a>
          </div>
        </div>
        <div className="nav-menu">
          <nav className="menu">
            <ul className="ul-list">
              <li>
                <a href="#a-propos">A propos</a>
              </li>
              <li>
                <a href="#osteo">L'ostéopathie</a>
              </li>
              <li>
                <a href="#formations">Formations</a>
              </li>
              <li>
                <a href="#tarifs">Tarifs</a>
              </li>
              <li>
                <a href="#contacts">Contacts</a>
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
          <p className="tel">06 50 34 88 73</p>
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
