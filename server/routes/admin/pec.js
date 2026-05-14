import { Router } from 'express';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();
router.use(authenticate, requireRole('admin', 'praticien'));

// GET /api/admin/pec
router.get('/', (_req, res) => {
  const items = db.prepare('SELECT * FROM pec_bubbles ORDER BY sort_order').all();
  res.json(items);
});

// POST /api/admin/pec
router.post('/', (req, res) => {
  const { num, title, description, icon, image, image_alt, sort_order } = req.body;
  if (!title) return res.status(400).json({ error: 'title requis' });
  const max = db.prepare('SELECT MAX(sort_order) as m FROM pec_bubbles').get();
  const order = sort_order != null ? Number(sort_order) : (max.m ?? 0) + 1;
  const result = db
    .prepare('INSERT INTO pec_bubbles (num, title, description, icon, image, image_alt, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(num ?? null, title, description ?? null, icon ?? null, image ?? null, image_alt ?? null, order);
  const item = db.prepare('SELECT * FROM pec_bubbles WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(item);
});

// PUT /api/admin/pec/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM pec_bubbles WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Spécialité non trouvée' });
  const fields = ['num', 'title', 'description', 'icon', 'image', 'image_alt', 'sort_order'];
  const sets = [];
  const values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      sets.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  }
  if (sets.length === 0) return res.json(existing);
  values.push(req.params.id);
  db.prepare(`UPDATE pec_bubbles SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  res.json(db.prepare('SELECT * FROM pec_bubbles WHERE id = ?').get(req.params.id));
});

// DELETE /api/admin/pec/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM pec_bubbles WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Spécialité non trouvée' });
  db.prepare('DELETE FROM pec_bubbles WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
