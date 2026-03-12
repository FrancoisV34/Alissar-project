import React from 'react';
import '../Style/Horaires.scss';
import { useHoraires } from '../hooks/useHoraires.js';

export default function Accessibilite() {
  const { data: horaires, isLoading, isError } = useHoraires();

  if (isLoading) return <div className="loading-placeholder" />;
  if (isError) return null;

  return (
    <section className="access">
      <h2>Horaires d'ouvertures</h2>
      <div className="horaires">
        <ul className="jours-heures">
          {horaires.map((horaire) => (
            <li className="heures" key={horaire.id}>
              {`${horaire.jour} : ${horaire.horaires}`}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
