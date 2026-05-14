import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { useTarifs } from '../hooks/useTarifs.js';
import { useHoraires } from '../hooks/useHoraires.js';
import { useExternalLinks } from '../hooks/useExternalLinks.js';
import { Icon } from './IconSet.jsx';

const FRENCH_DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export default function Pratique() {
  const { data: cfg } = useSiteConfig();
  const { data: tarifs } = useTarifs();
  const { data: horaires } = useHoraires();
  const { data: bookingLinks } = useExternalLinks('booking');
  const today = FRENCH_DAYS[new Date().getDay()];
  const bookingUrl = bookingLinks?.[0]?.url ?? '#';
  const phone = cfg?.phone ?? '';
  const telHref = `tel:${phone.replace(/\s+/g, '')}`;

  const addressLines = (cfg?.address ?? '').split(',').map((s) => s.trim()).filter(Boolean);

  return (
    <section className="section pratique" id="pratique">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Côté pratique</span>
            <h2 className="title">Tout ce qu&apos;il vous faut <em>en un coup d&apos;œil</em>.</h2>
          </div>
          <p className="lede">Tarifs, horaires, accès, contact : tout est ici. Pour réserver, le plus simple reste Doctolib.</p>
        </div>

        <div className="pratique-grid">
          {/* TARIFS */}
          <div className="p-card">
            <h3><span className="ic"><Icon.Sparkle /></span>Tarifs</h3>
            <div>
              {(tarifs ?? []).map((t) => (
                <div className="tarif-row" key={t.id}>
                  <div className="l">
                    <strong>{t.prestation}</strong>
                    {t.texte && <span>{t.texte}</span>}
                  </div>
                  <div className="price">{t.prix}<sup>€</sup></div>
                </div>
              ))}
            </div>
            <a className="btn btn-soft" href={bookingUrl} target="_blank" rel="noopener noreferrer" style={{ marginTop: 'auto' }}>
              Réserver sur Doctolib <Icon.Arrow className="arrow" />
            </a>
          </div>

          {/* HORAIRES */}
          <div className="p-card">
            <h3><span className="ic"><Icon.Clock /></span>Horaires</h3>
            <div className="hours-table">
              {(horaires ?? []).map((h) => (
                <div className={`hours-row ${h.jour?.toLowerCase() === today ? 'today' : ''}`} key={h.id}>
                  <span className="day">{h.jour}</span>
                  <span className="h">{h.horaires}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CONTACT */}
          <div className="p-card">
            <h3><span className="ic"><Icon.Pin /></span>Contact &amp; accès</h3>
            <div className="contact-stack">
              {phone && (
                <div className="contact-row">
                  <div className="ic"><Icon.Phone /></div>
                  <div>
                    <div className="lbl">Téléphone</div>
                    <div className="val"><a href={telHref}>{phone}</a></div>
                  </div>
                </div>
              )}
              {addressLines.length > 0 && (
                <div className="contact-row">
                  <div className="ic"><Icon.Pin /></div>
                  <div>
                    <div className="lbl">Adresse</div>
                    <div className="val">
                      {addressLines.map((line, i) => (
                        <span key={i}>{line}{i < addressLines.length - 1 && <br />}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="contact-row">
                <div className="ic"><Icon.Calendar /></div>
                <div>
                  <div className="lbl">En ligne</div>
                  <div className="val"><a href={bookingUrl} target="_blank" rel="noopener noreferrer">Doctolib →</a></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {cfg?.maps_embed_url && (
          <div className="map-frame">
            <iframe
              title="Plan du cabinet"
              src={cfg.maps_embed_url}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        )}

        <div className="cta-banner">
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.85)' }}>Prêt(e) ?</span>
          <h3>Réservez votre <em>première consultation</em>.</h3>
          <a className="btn btn-primary btn-lg" href={bookingUrl} target="_blank" rel="noopener noreferrer">
            Prendre rendez-vous sur Doctolib <Icon.Arrow className="arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}
