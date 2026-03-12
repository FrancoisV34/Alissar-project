import React from 'react';
import '../Style/Contacts.scss';
import Docto from '/assets/rdvdocto.png';
import { useContact } from '../hooks/useContact.js';

export default function Contacts() {
  const { data, isLoading, isError } = useContact();

  if (isLoading) return <div className="loading-placeholder" />;
  if (isError) return null;

  const { contact } = data;

  return (
    <section className="contacts" id="contacts">
      <div className="tel">
        <h2>Numéro de téléphone</h2>
        <span>{contact.phone}</span>
      </div>
      <div className="adresse">
        <h2>Adresse du cabinet:</h2>
        {contact.address.split(', ').map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </div>
      <div className="rdvdocto">
        <h2>Prendre rendez-vous en ligne:</h2>
        <a
          href={contact.doctolib_url}
          className="doctolib-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={Docto} className="docto-img" alt="Logo Doctolib" />
        </a>
      </div>
    </section>
  );
}
