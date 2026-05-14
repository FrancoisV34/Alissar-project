import { usePec } from '../hooks/usePec.js';
import { Icon } from './IconSet.jsx';

export default function Specialties() {
  const { data: items, isLoading } = usePec();
  if (isLoading || !items?.length) return null;

  return (
    <section className="section specialties" id="specialties">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Mes spécialités</span>
            <h2 className="title">Une approche <em>complète</em>, une expertise plurielle.</h2>
          </div>
          <p className="lede">Une prise en charge sur mesure adaptée à votre histoire et à votre corps.</p>
        </div>
        <div className="spec-grid">
          {items.map((s) => {
            const I = (s.icon && Icon[s.icon]) || Icon.Sparkle;
            return (
              <article className="spec-card" key={s.id}>
                <div>
                  {s.num && <div className="num">{s.num}</div>}
                  <h3 style={{ marginTop: 8 }}>{s.title}</h3>
                  {(s.description || s.content) && <p style={{ marginTop: 8 }}>{s.description || s.content}</p>}
                </div>
                <div className="ic"><I /></div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
