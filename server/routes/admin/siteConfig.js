import { Router } from 'express';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin', 'praticien'));

// PUT /api/admin/site-config
router.put('/', (req, res) => {
  const fields = [
    'site_name', 'practitioner_name', 'profession', 'phone', 'email', 'address',
    'geo_lat', 'geo_lng', 'maps_embed_url', 'logo_url', 'favicon_url',
    'theme_color', 'meta_description', 'copyright_name',
    'elfsight_widget_id', 'avis_note', 'avis_count',
    'palette', 'font_title', 'hero_variant', 'dark_mode',
    'hero_title', 'hero_subtitle', 'hero_image_url', 'hero_image_alt',
    'about_title', 'about_text', 'about_quote', 'about_image_url', 'about_image_alt',
    'show_formations', 'show_reviews', 'show_faq',
    'meta_title', 'meta_title_template', 'meta_keywords', 'canonical_base_url',
    'og_image_url', 'og_image_alt',
    'gsc_verification', 'bing_verification', 'ga_measurement_id', 'google_business_url',
    'physician_specialties', 'physician_alumni',
    'faq_eyebrow', 'faq_title', 'faq_lede'
  ];

  const existing = db.prepare('SELECT id FROM site_config WHERE id = 1').get();
  if (!existing) {
    // Insert default row if not exists
    db.prepare('INSERT INTO site_config (id) VALUES (1)').run();
  }

  const setClauses = [];
  const values = [];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ error: 'Aucun champ a mettre a jour' });
  }

  values.push(1);
  db.prepare(`UPDATE site_config SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

  res.json(db.prepare('SELECT * FROM site_config WHERE id = 1').get());
});

export default router;
