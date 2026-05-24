import { useEffect } from 'react';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { useHoraires } from '../hooks/useHoraires.js';
import { useTarifs } from '../hooks/useTarifs.js';
import { useFaqs } from '../hooks/useFaqs.js';
import { useExternalLinks } from '../hooks/useExternalLinks.js';

const DAY_MAP = {
  lundi: 'Monday',
  mardi: 'Tuesday',
  mercredi: 'Wednesday',
  jeudi: 'Thursday',
  vendredi: 'Friday',
  samedi: 'Saturday',
  dimanche: 'Sunday',
};

function parseHours(str) {
  // "10h - 20h" / "10h-20h" / "10h00 - 20h00"
  const m = (str ?? '').replace(/\s/g, '').match(/(\d{1,2})h(\d{2})?[-–]?(\d{1,2})h(\d{2})?/);
  if (!m) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return {
    opens: `${pad(m[1])}:${m[2] ?? '00'}`,
    closes: `${pad(m[3])}:${m[4] ?? '00'}`,
  };
}

function parseAddress(address) {
  const parts = (address ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return { streetAddress: address, addressLocality: '', postalCode: '' };
  const street = parts[0];
  const last = parts[parts.length - 1];
  const cityMatch = last.match(/^(\d{5})\s+(.+)$/);
  if (cityMatch) {
    return { streetAddress: street, postalCode: cityMatch[1], addressLocality: cityMatch[2] };
  }
  return { streetAddress: street, addressLocality: last, postalCode: '' };
}

function priceRange(tarifs) {
  if (!tarifs?.length) return undefined;
  const prices = tarifs.map((t) => t.prix).filter((p) => Number.isFinite(p));
  if (!prices.length) return undefined;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `${min}€` : `${min}-${max}€`;
}

function setJsonLd(id, data) {
  if (!data) {
    document.head.querySelector(`script[data-jsonld="${id}"]`)?.remove();
    return;
  }
  let el = document.head.querySelector(`script[data-jsonld="${id}"]`);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-jsonld', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export default function JsonLd() {
  const { data: cfg } = useSiteConfig();
  const { data: horaires } = useHoraires();
  const { data: tarifs } = useTarifs();
  const { data: faqs } = useFaqs();
  const { data: bookingLinks } = useExternalLinks('booking');

  useEffect(() => {
    if (!cfg) return;

    const url = cfg.canonical_base_url || (typeof window !== 'undefined' ? window.location.origin : '');
    const image = cfg.og_image_url
      ? (cfg.og_image_url.startsWith('http') ? cfg.og_image_url : `${url}${cfg.og_image_url}`)
      : undefined;
    const addr = parseAddress(cfg.address);

    let specialties;
    try { specialties = JSON.parse(cfg.physician_specialties ?? '[]'); } catch { specialties = []; }
    if (!Array.isArray(specialties) || specialties.length === 0) specialties = ['Osteopathic'];

    const openingHoursSpec = (horaires ?? [])
      .map((h) => {
        const day = DAY_MAP[h.jour?.toLowerCase()];
        const hrs = parseHours(h.horaires);
        if (!day || !hrs) return null;
        return {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: day,
          opens: hrs.opens,
          closes: hrs.closes,
        };
      })
      .filter(Boolean);

    const sameAs = [];
    if (cfg.google_business_url) sameAs.push(cfg.google_business_url);
    if (bookingLinks?.[0]?.url) sameAs.push(bookingLinks[0].url);

    const physician = {
      '@context': 'https://schema.org',
      '@type': 'Physician',
      name: cfg.practitioner_name,
      medicalSpecialty: specialties,
      ...(cfg.physician_alumni ? { alumniOf: cfg.physician_alumni } : {}),
      url,
      ...(image ? { image } : {}),
      ...(cfg.phone ? { telephone: cfg.phone } : {}),
      ...(cfg.email ? { email: cfg.email } : {}),
      address: {
        '@type': 'PostalAddress',
        streetAddress: addr.streetAddress,
        addressLocality: addr.addressLocality,
        postalCode: addr.postalCode,
        addressCountry: 'FR',
      },
      ...((cfg.geo_lat && cfg.geo_lng) ? {
        geo: { '@type': 'GeoCoordinates', latitude: cfg.geo_lat, longitude: cfg.geo_lng },
      } : {}),
      ...(openingHoursSpec.length ? { openingHoursSpecification: openingHoursSpec } : {}),
      ...(priceRange(tarifs) ? { priceRange: priceRange(tarifs) } : {}),
      ...(cfg.avis_note && cfg.avis_count ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: cfg.avis_note,
          reviewCount: cfg.avis_count,
          bestRating: 5,
          worstRating: 1,
        },
      } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    };
    setJsonLd('physician', physician);

    const showFaq = cfg.show_faq !== 0;
    if (showFaq && faqs?.length) {
      const faqPage = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      };
      setJsonLd('faqpage', faqPage);
    } else {
      setJsonLd('faqpage', null);
    }
  }, [cfg, horaires, tarifs, faqs, bookingLinks]);

  return null;
}
