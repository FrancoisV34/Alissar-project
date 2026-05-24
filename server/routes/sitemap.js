import { Router } from 'express';
import db from '../db.js';

const router = Router();

function getBaseUrl(req) {
  const cfg = db.prepare('SELECT canonical_base_url FROM site_config WHERE id = 1').get();
  if (cfg?.canonical_base_url) return cfg.canonical_base_url.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] ?? req.protocol ?? 'http';
  const host = req.headers['x-forwarded-host'] ?? req.headers.host;
  return `${proto}://${host}`;
}

router.get('/robots.txt', (req, res) => {
  const base = getBaseUrl(req);
  res.type('text/plain').send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /login',
      'Disallow: /change-password',
      'Disallow: /uploads/',
      '',
      `Sitemap: ${base}/sitemap.xml`,
      '',
    ].join('\n'),
  );
});

router.get('/sitemap.xml', (req, res) => {
  const base = getBaseUrl(req);
  const cfg = db.prepare('SELECT show_formations, show_reviews, show_faq FROM site_config WHERE id = 1').get() ?? {};
  const now = new Date().toISOString().slice(0, 10);
  const anchors = ['', '#about', '#specialties'];
  if (cfg.show_formations) anchors.push('#formations');
  if (cfg.show_reviews) anchors.push('#reviews');
  anchors.push('#pratique');
  if (cfg.show_faq) anchors.push('#faq');

  const urls = anchors.map((a) => {
    const loc = `${base}/${a}`;
    return `  <url><loc>${loc}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>${a === '' ? '1.0' : '0.7'}</priority></url>`;
  }).join('\n');

  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
  );
});

export default router;
