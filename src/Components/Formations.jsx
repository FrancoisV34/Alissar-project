import { useFormations } from '../hooks/useFormations.js';
import { useSiteConfig } from '../hooks/useSiteConfig.js';

function extractYear(title) {
  const m = (title || '').match(/(20\d{2}(?:[-–]\d{2,4})?)/);
  return m ? m[1] : null;
}

export default function Formations() {
  const { data: cfg } = useSiteConfig();
  const { data: items, isLoading } = useFormations();

  if (cfg && !cfg.show_formations) return null;
  if (isLoading || !items?.length) return null;

  return (
    <section className="section formations" id="formations">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Parcours</span>
            <h2 className="title">Une formation <em>continue</em>, des compétences <em>à jour</em>.</h2>
          </div>
          <p className="lede">Une formation pensée pour offrir une prise en charge solide et fondée sur les dernières connaissances.</p>
        </div>
        <div className="timeline">
          {items.map((f) => {
            const year = extractYear(f.title);
            const cleanTitle = year ? f.title.replace(year, '').replace(/[()]/g, '').trim() : f.title;
            const imgSrc = f.image && (f.image.startsWith('/') ? f.image : `/uploads/${f.image}`);
            return (
              <article className="formation-card" key={f.id}>
                {year && <div className="year">{year}</div>}
                <div className="pic">
                  {imgSrc
                    ? <img src={imgSrc} alt={f.image_alt ?? cleanTitle} loading="lazy" />
                    : <div className="img-placeholder">{cleanTitle}</div>}
                </div>
                <h4>{cleanTitle}</h4>
                {f.description && <p>{f.description}</p>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
