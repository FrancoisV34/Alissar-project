import { useEffect } from 'react';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { Icon } from './IconSet.jsx';

export default function Reviews() {
  const { data: cfg } = useSiteConfig();

  useEffect(() => {
    if (!cfg?.elfsight_widget_id) return;
    const id = 'elfsight-platform-script';
    if (document.getElementById(id)) return;
    const s = document.createElement('script');
    s.id = id;
    s.src = 'https://elfsightcdn.com/platform.js';
    s.async = true;
    document.body.appendChild(s);
  }, [cfg?.elfsight_widget_id]);

  if (cfg && !cfg.show_reviews) return null;

  const note = cfg?.avis_note ?? 5;
  const count = cfg?.avis_count ?? 0;
  const noteStr = note.toFixed(1).replace('.', ',');

  return (
    <section className="section" id="reviews">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Avis Google</span>
            <h2 className="title">Plus de {count} patients <em>satisfaits</em>.</h2>
          </div>
          <p className="lede">Une note de {noteStr}/5 sur Google, basée sur {count} avis vérifiés. La confiance se construit consultation après consultation.</p>
        </div>
        <div className="reviews-grid">
          <aside className="rating-card">
            <div className="score">{noteStr}</div>
            <div className="stars">★ ★ ★ ★ ★</div>
            <div className="nb">basé sur <strong>{count} avis Google</strong></div>
            <div className="gbadge"><Icon.Globe /> google.com/maps</div>
          </aside>
          <div className="review-list">
            {cfg?.elfsight_widget_id ? (
              <div className="elfsight-wrap">
                <div className={`elfsight-app-${cfg.elfsight_widget_id}`} data-elfsight-app-lazy />
              </div>
            ) : (
              <p style={{ color: 'var(--ink-mute)', fontSize: 14 }}>
                Configurez l&apos;ID Elfsight dans l&apos;admin pour afficher le widget d&apos;avis Google.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
