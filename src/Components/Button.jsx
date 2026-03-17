import React from 'react';
import { useContact } from '../hooks/useContact.js';
import { useExternalLinks } from '../hooks/useExternalLinks.js';
import { useSiteConfig } from '../hooks/useSiteConfig.js';

export default function Button() {
  const { data } = useContact();
  const { data: bookingLinks } = useExternalLinks('booking');
  const { data: config } = useSiteConfig();
  const url = bookingLinks?.[0]?.url ?? data?.contact?.doctolib_url ?? '#';
  const label = config
    ? `Cliquer pour prendre rendez-vous avec ${config.practitioner_name}`
    : 'Prendre rendez-vous en ligne';

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      role="button"
    >
      <button
        className="contact-button"
        aria-label={label}
        type="button"
      >
        Prendre rendez-vous
      </button>
    </a>
  );
}
