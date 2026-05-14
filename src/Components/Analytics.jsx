import { useEffect } from 'react';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { getConsent } from '../utils/consent.js';

export default function Analytics() {
  const { data: cfg } = useSiteConfig();
  const gaId = cfg?.ga_measurement_id?.trim();

  useEffect(() => {
    if (!gaId) return;

    function tryLoad() {
      if (getConsent() !== 'granted') return;
      if (document.getElementById('ga-script')) return;
      const s = document.createElement('script');
      s.id = 'ga-script';
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(s);

      window.dataLayer = window.dataLayer || [];
      function gtag(){ window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', gaId, { anonymize_ip: true });
    }

    tryLoad();
    window.addEventListener('mb-consent-change', tryLoad);
    return () => window.removeEventListener('mb-consent-change', tryLoad);
  }, [gaId]);

  return null;
}
