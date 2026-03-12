import React from 'react';
import '../Style/BulleAvis.scss';
import { useContact } from '../hooks/useContact.js';

export default function BulleAvis() {
  const { data, isLoading } = useContact();

  const note = data?.avis?.note ?? 5;
  const nbAvis = data?.avis?.nb_avis ?? 155;

  if (isLoading) return null;

  return (
    <div className="avis-container">
      <div className="etoiles">
        <span className="note">{`${note}/5`}</span>
        <span className="etoile">
          {'★'.repeat(Math.floor(note))}
          {note % 1 !== 0 && '☆'}
        </span>
      </div>
      <div className="texte">
        <span className="nbavis">{`Basé sur ${nbAvis} avis Google`}</span>
      </div>
    </div>
  );
}
