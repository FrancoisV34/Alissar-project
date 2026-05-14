import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { Icon } from './IconSet.jsx';

function HtmlText({ html }) {
  return <span dangerouslySetInnerHTML={{ __html: html ?? '' }} />;
}

export default function About() {
  const { data: cfg } = useSiteConfig();
  if (!cfg) return null;

  const paragraphs = (cfg.about_text || '').split(/\n\n+/).filter(Boolean);

  return (
    <section className="section" id="about">
      <div className="wrap">
        <div className="about-grid">
          <div className="about-portrait">
            {cfg.about_image_url
              ? <img src={cfg.about_image_url} alt={cfg.about_image_alt ?? cfg.practitioner_name ?? ''} loading="lazy" />
              : <div className="img-placeholder">Portrait</div>}
          </div>
          <div className="about-text">
            <span className="eyebrow">À propos</span>
            {cfg.about_title && (
              <h2 className="title"><HtmlText html={cfg.about_title} /></h2>
            )}
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            {cfg.about_quote && (
              <blockquote className="about-quote">« {cfg.about_quote} »</blockquote>
            )}
            <a className="btn btn-soft" href="#pratique">
              En savoir plus sur les consultations <Icon.Arrow className="arrow" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
