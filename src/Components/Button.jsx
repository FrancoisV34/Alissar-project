import React from 'react';

export default function Button() {
  return (
    <a
      href="https://www.doctolib.fr/osteopathe/vendargues/alissar-atik"
      target="_blank"
      rel="noreferrer noopener"
      role="button"
    >
      {' '}
      <button
        className="contact-button"
        aria-label="Cliquer pour etre redirigé vers la page Doctolib de Alissar Atik Ostéopathe dans un nouvel onglet"
        type="button"
      >
        Prendre rendez-vous
      </button>
    </a>
  );
}
