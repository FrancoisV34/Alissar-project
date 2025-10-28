import '../Style/Tarifs.scss';
import React from 'react';
import TarifsData from '../Data/tarifs.json';

export default function Tarifs() {
  return (
    <>
      <section className="tarifs" id="tarifs">
        {TarifsData.map((tarif, index) => (
          <a
            className="presta-tarifs"
            key={index}
            target="_blank"
            rel="noopener noreferer"
            href="https://www.doctolib.fr/osteopathe/vendargues/alissar-atik/booking/motive-categories?specialityId=10&telehealth=false&placeId=practice-200784&bookingFunnelSource=profile"
          >
            <h3>
              {tarif.prestation} : {tarif.prix}€
            </h3>
          </a>
        ))}
      </section>
    </>
  );
}
