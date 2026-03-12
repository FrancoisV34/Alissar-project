import React from 'react';
import { useContact } from '../hooks/useContact.js';

export default function Button() {
  const { data } = useContact();
  const url = data?.contact?.doctolib_url ?? 'https://www.doctolib.fr/osteopathe/vendargues/alissar-atik';

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      role="button"
    >
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
