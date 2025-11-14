import React from 'react';
import '../Style/Contacts.scss';
import Docto from '/assets/rdvdocto.png';

export default function Contacts() {
  return (
    <>
      <section className="contacts" id="contacts">
        <div className="tel">
          <h2>Numéro de téléphone</h2>
          <span>06 50 34 88 73</span>
        </div>
        <div className="adresse">
          <h2>Adresse du cabinet:</h2>
          <span>Maison Cadoule,</span>
          <span>17 Rue de la Cadoule,</span>
          <span>34740 Vendargues</span>
        </div>
        <div className="rdvdocto">
          <h2>Prendre rendez-vous en ligne:</h2>
          <a
            href="https://www.doctolib.fr/osteopathe/vendargues/alissar-atik"
            className="doctolib-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={Docto} className="docto-img" alt="Logo Doctolib"></img>
          </a>
        </div>
      </section>
    </>
  );
}
