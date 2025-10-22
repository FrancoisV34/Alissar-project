import React from 'react';
import Data from '../Data/data.json';
import '../Style/FormationArticle.scss';

export default function FormationArticle() {
  return (
    <section id="formations">
      {Data.map(
        (data, dataIndex) =>
          data.card &&
          (Array.isArray(data.card)
            ? data.card.map((formation, fIndex) => (
                <article className="formation" key={`${dataIndex}-${fIndex}`}>
                  <div className="formation-text">
                    <h3 className="formation-title">{formation.title}</h3>
                    <p className="formation-infos">{formation.p}</p>
                  </div>

                  <div className="formation-image">
                    <img
                      src={formation.image}
                      alt={formation.title}
                      className="formation-pic"
                    />
                  </div>
                </article>
              ))
            : null)
      )}
    </section>
  );
}
