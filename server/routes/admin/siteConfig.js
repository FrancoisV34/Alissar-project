import { Router } from 'express';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';
import { buildUpdate } from '../../lib/sql.js';
import { schemas, validate } from '../../lib/validation.js';

const router = Router();
router.use(authenticate, requireRole('admin', 'praticien'));

const COLUMNS = Object.keys(schemas.siteConfig.shape);

// PUT /api/admin/site-config : partial update of the single configuration row
router.put('/', validate(schemas.siteConfig), (req, res) => {
  db.prepare('INSERT OR IGNORE INTO site_config (id) VALUES (1)').run();
  const update = buildUpdate('site_config', COLUMNS, req.body);
  if (!update) return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
  db.prepare(update.sql).run(...update.values, 1);
  res.json(db.prepare('SELECT * FROM site_config WHERE id = 1').get());
});

export default router;
