import { useEffect } from 'react';
import { useSiteConfig } from './useSiteConfig.js';

function stripHtml(s) {
  return (s ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function applyTemplate(template, vars) {
  if (!template) return '';
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

function setMeta({ name, property, content }) {
  if (!content) return;
  const sel = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
  let el = document.head.querySelector(sel);
  if (!el) {
    el = document.createElement('meta');
    if (name) el.setAttribute('name', name);
    else el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useSeoMeta() {
  const { data: cfg } = useSiteConfig();

  useEffect(() => {
    if (!cfg) return;
    const city = (cfg.address ?? '').split(',').pop()?.replace(/\d/g, '').trim();
    const vars = {
      site_name: cfg.site_name ?? '',
      practitioner_name: cfg.practitioner_name ?? '',
      profession: cfg.profession ?? '',
      city: city ?? '',
    };
    const title = cfg.meta_title?.trim()
      || applyTemplate(cfg.meta_title_template, vars)
      || cfg.site_name
      || 'Cabinet';
    const description = cfg.meta_description ?? '';
    const canonical = cfg.canonical_base_url
      ? cfg.canonical_base_url.replace(/\/$/, '') + window.location.pathname
      : window.location.href;
    const ogImage = cfg.og_image_url
      ? (cfg.og_image_url.startsWith('http')
          ? cfg.og_image_url
          : (cfg.canonical_base_url ?? '').replace(/\/$/, '') + cfg.og_image_url)
      : null;

    if (document.title !== title) document.title = title;
    document.documentElement.setAttribute('lang', 'fr');

    setMeta({ name: 'description', content: description });
    setMeta({ name: 'keywords', content: cfg.meta_keywords ?? '' });
    setMeta({ name: 'theme-color', content: cfg.theme_color ?? '#e87265' });
    if (cfg.gsc_verification) setMeta({ name: 'google-site-verification', content: cfg.gsc_verification });
    if (cfg.bing_verification) setMeta({ name: 'msvalidate.01', content: cfg.bing_verification });

    setLink('canonical', canonical);

    // Open Graph
    setMeta({ property: 'og:type', content: 'website' });
    setMeta({ property: 'og:site_name', content: cfg.site_name ?? '' });
    setMeta({ property: 'og:locale', content: 'fr_FR' });
    setMeta({ property: 'og:title', content: title });
    setMeta({ property: 'og:description', content: stripHtml(description) });
    setMeta({ property: 'og:url', content: canonical });
    if (ogImage) {
      setMeta({ property: 'og:image', content: ogImage });
      setMeta({ property: 'og:image:width', content: '1200' });
      setMeta({ property: 'og:image:height', content: '630' });
      if (cfg.og_image_alt) setMeta({ property: 'og:image:alt', content: cfg.og_image_alt });
    }

    // Twitter
    setMeta({ name: 'twitter:card', content: ogImage ? 'summary_large_image' : 'summary' });
    setMeta({ name: 'twitter:title', content: title });
    setMeta({ name: 'twitter:description', content: stripHtml(description) });
    if (ogImage) setMeta({ name: 'twitter:image', content: ogImage });
  }, [cfg]);
}
