import { useEffect, useState } from 'react';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { getConsent, setConsent } from '../utils/consent.js';

export default function CookieBanner() {
  const { data: cfg } = useSiteConfig();
  const [consent, setLocalConsent] = useState(() => getConsent());
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;
  if (!cfg?.ga_measurement_id) return null;
  if (consent !== 'unset') return null;

  function choose(value) {
    setConsent(value);
    setLocalConsent(value);
  }

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Bandeau cookies">
      <div className="cookie-banner-inner">
        <p>
          Ce site utilise Google Analytics pour mesurer son audience de manière anonyme.
          Aucune donnée personnelle n&apos;est partagée avec des tiers à des fins publicitaires.
        </p>
        <div className="cookie-banner-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => choose('denied')}>Refuser</button>
          <button className="btn btn-primary btn-sm" onClick={() => choose('granted')}>Accepter</button>
        </div>
      </div>
    </div>
  );
}
