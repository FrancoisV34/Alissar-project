import React from 'react';
import '../Style/BullePEC.scss';
import Data from '../Data/textePEC.json';

export default function BullePEC() {
  return (
    <>
      <section className="pretarifs">
        {Data.map((data, index) => (
          <div className="bulle-pec" key={index}>
            <div className="img-container">
              <img src={data.image} alt={data.title} className="img-pec" />
            </div>
            <div className="text">
              <h2 className="title-pec">{data.title}</h2>
              <p className="pec-text">{data.content}</p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
