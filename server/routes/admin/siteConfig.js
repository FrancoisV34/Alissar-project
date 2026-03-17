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
    'elfsight_widget_id', 'avis_note', 'avis_count'
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

  // Also sync contact_info for backward compatibility
  const config = db.prepare('SELECT * FROM site_config WHERE id = 1').get();
  const bookingLink = db.prepare("SELECT url FROM external_links WHERE type = 'booking' ORDER BY sort_order LIMIT 1").get();
  db.prepare('UPDATE contact_info SET phone = ?, address = ?, doctolib_url = ? WHERE id = 1')
    .run(config.phone, config.address, bookingLink?.url ?? 'https://www.doctolib.fr');

  res.json(db.prepare('SELECT * FROM site_config WHERE id = 1').get());
});

export default router;
