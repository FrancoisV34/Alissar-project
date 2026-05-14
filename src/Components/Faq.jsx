import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { useFaqs } from '../hooks/useFaqs.js';

function HtmlText({ html }) {
  return <span dangerouslySetInnerHTML={{ __html: html ?? '' }} />;
}

export default function Faq() {
  const { data: cfg } = useSiteConfig();
  const { data: items } = useFaqs();

  if (cfg && cfg.show_faq === 0) return null;
  if (!items?.length) return null;

  return (
    <section className="section faq" id="faq">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">{cfg?.faq_eyebrow ?? 'Foire aux questions'}</span>
            <h2 className="title"><HtmlText html={cfg?.faq_title ?? 'Vos questions, mes <em>réponses</em>.'} /></h2>
          </div>
          {cfg?.faq_lede && <p className="lede">{cfg.faq_lede}</p>}
        </div>
        <div className="faq-list">
          {items.map((f) => (
            <details className="faq-item" key={f.id}>
              <summary>
                {f.question}
                <span className="faq-toggle" aria-hidden="true">+</span>
              </summary>
              <div className="faq-answer">{f.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
