import React from 'react';
import '../Style/BulleAvis.scss';

export default function BulleAvis() {
  const note = 5;
  const nbAvis = 155;
  return (
    <>
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
    </>
  );
}
