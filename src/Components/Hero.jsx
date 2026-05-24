import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { useHoraires } from '../hooks/useHoraires.js';
import { useTarifs } from '../hooks/useTarifs.js';
import { usePec } from '../hooks/usePec.js';
import { useExternalLinks } from '../hooks/useExternalLinks.js';
import { Icon } from './IconSet.jsx';

const FRENCH_DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

function useHeroData() {
  const { data: cfg } = useSiteConfig();
  const { data: bookingLinks } = useExternalLinks('booking');
  const bookingUrl = bookingLinks?.[0]?.url ?? '#';
  const phone = cfg?.phone ?? '';
  const telHref = `tel:${phone.replace(/\s+/g, '')}`;
  return { cfg, bookingUrl, phone, telHref };
}

function HtmlText({ html, ...rest }) {
  return <span {...rest} dangerouslySetInnerHTML={{ __html: html ?? '' }} />;
}

export default function Hero() {
  const { data: cfg } = useSiteConfig();
  const variant = cfg?.hero_variant ?? 'fullbleed';
  if (variant === 'split') return <HeroSplit />;
  if (variant === 'editorial') return <HeroEditorial />;
  return <HeroFullbleed />;
}

function HeroFullbleed() {
  const { cfg, bookingUrl, phone, telHref } = useHeroData();
  return (
    <section className="hero hero-fullbleed" id="top">
      <div className="stage">
        <div className="bg">
          {cfg?.hero_image_url
            ? <img src={cfg.hero_image_url} alt={cfg.hero_image_alt ?? ''} loading="eager" fetchpriority="high" />
            : <div className="img-placeholder">Photo du cabinet</div>}
        </div>
        <div className="scrim"></div>
        <div className="content">
          <div className="wrap" style={{ width: '100%' }}>
            <h1 className="hero-headline fade-up" style={{ maxWidth: '16ch' }}>
              <HtmlText html={cfg?.hero_title} />
            </h1>
            {cfg?.hero_subtitle && <p className="hero-sub fade-up d1">{cfg.hero_subtitle}</p>}
            <div className="hero-cta-row fade-up d2">
              <a className="btn btn-primary btn-lg" href={bookingUrl} target="_blank" rel="noopener noreferrer">
                Prendre rendez-vous <Icon.Arrow className="arrow" />
              </a>
              {phone && (
                <a className="btn btn-ghost btn-lg btn-ghost-on-media" href={telHref}>
                  <Icon.Phone /> {phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSplit() {
  const { cfg, bookingUrl, phone, telHref } = useHeroData();
  return (
    <section className="hero hero-split" id="top">
      <div className="wrap">
        <div className="hero-grid">
          <div>
            <div className="hero-eyebrow">
              <span className="line"></span>
              <span className="eyebrow">{cfg?.profession}{cfg?.address ? ' — ' + cfg.address.split(',').pop().trim() : ''}</span>
            </div>
            <h1 className="hero-headline"><HtmlText html={cfg?.hero_title} /></h1>
            {cfg?.hero_subtitle && <p className="hero-sub">{cfg.hero_subtitle}</p>}
            <div className="hero-cta-row">
              <a className="btn btn-primary btn-lg" href={bookingUrl} target="_blank" rel="noopener noreferrer">
                Prendre rendez-vous <Icon.Arrow className="arrow" />
              </a>
              {phone && <a className="btn btn-ghost btn-lg" href={telHref}><Icon.Phone /> {phone}</a>}
            </div>
          </div>
          <div className="big-portrait">
            {cfg?.hero_image_url
              ? <img src={cfg.hero_image_url} alt={cfg.hero_image_alt ?? ''} loading="eager" fetchpriority="high" />
              : <div className="img-placeholder">Photo du cabinet</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroEditorial() {
  const { cfg, bookingUrl, phone, telHref } = useHeroData();
  const { data: horaires } = useHoraires();
  const { data: tarifs } = useTarifs();
  const { data: pec } = usePec();
  const today = FRENCH_DAYS[new Date().getDay()];
  const todayRow = (horaires ?? []).find((h) => h.jour?.toLowerCase() === today);
  const consultationPrice = tarifs?.[0]?.prix;

  return (
    <section className="hero hero-editorial" id="top">
      <div className="wrap">
        <div className="hero-eyebrow">
          <span className="line"></span>
          <span className="eyebrow">{cfg?.profession}{cfg?.address ? ' — ' + cfg.address.split(',').pop().trim() : ''}</span>
        </div>
        <div className="hero-grid">
          <div>
            <h1 className="hero-headline fade-up"><HtmlText html={cfg?.hero_title} /></h1>
            {cfg?.hero_subtitle && <p className="hero-sub fade-up d1">{cfg.hero_subtitle}</p>}
            <div className="hero-cta-row fade-up d2">
              <a className="btn btn-primary btn-lg" href={bookingUrl} target="_blank" rel="noopener noreferrer">
                Prendre rendez-vous <Icon.Arrow className="arrow" />
              </a>
              {phone && <a className="btn btn-ghost btn-lg" href={telHref}><Icon.Phone /> {phone}</a>}
            </div>
          </div>
          <aside className="hero-card fade-up d3">
            <div className="hero-card-portrait">
              {cfg?.about_image_url
                ? <img src={cfg.about_image_url} alt={cfg.about_image_alt ?? cfg?.practitioner_name ?? ''} loading="eager" fetchpriority="high" />
                : <div className="img-placeholder">Portrait</div>}
            </div>
            <div className="stack">
              <div className="row live">
                <div className="ic"><Icon.Clock /></div>
                <div>
                  <strong>{todayRow ? `Ouvert · ${todayRow.horaires}` : 'Sur rendez-vous'}</strong>
                  <span style={{ textTransform: 'capitalize' }}>{today}</span>
                </div>
              </div>
              {cfg?.avis_note != null && (
                <div className="row">
                  <div className="ic"><Icon.Star /></div>
                  <div>
                    <strong>{cfg.avis_note.toFixed(1).replace('.', ',')} / 5 sur Google</strong>
                    <span>Basé sur {cfg.avis_count ?? 0} avis</span>
                  </div>
                </div>
              )}
              {cfg?.address && (
                <div className="row">
                  <div className="ic"><Icon.Pin /></div>
                  <div>
                    <strong>{cfg.address.split(',')[0]?.trim()}</strong>
                    <span>{cfg.address.split(',').slice(1).join(',').trim()}</span>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        <div className="hero-meta">
          {cfg?.avis_count != null && (
            <div className="stat"><div className="num">{cfg.avis_count}</div><div className="lbl">AVIS GOOGLE</div></div>
          )}
          {pec?.length > 0 && (
            <div className="stat"><div className="num">{pec.length}</div><div className="lbl">SPÉCIALITÉS</div></div>
          )}
          {consultationPrice && (
            <div className="stat"><div className="num">{consultationPrice}€</div><div className="lbl">CONSULTATION</div></div>
          )}
          {todayRow && (
            <div className="stat"><div className="num" style={{ fontSize: 22 }}>{todayRow.horaires}</div><div className="lbl">AUJOURD&apos;HUI</div></div>
          )}
        </div>
      </div>
    </section>
  );
}
