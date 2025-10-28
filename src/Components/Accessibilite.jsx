import React from 'react';
import Horaires from '../Data/horaires.json';

export default function Accessibilite() {
  return (
    <section className="access">
      <h2>Horaires d'ouvertures</h2>

      <div className="horaires">
        <ul className="jours-heures">
          {Horaires.map((horaire, index) => (
            <li className="heures" key={index}>
              {`${horaire.jour} : ${horaire.horaires}`}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
