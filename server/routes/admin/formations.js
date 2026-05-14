import { Router } from 'express';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin', 'praticien'));

// POST /api/admin/formations
router.post('/', (req, res) => {
  const { title, description, image, image_alt } = req.body;
  if (!title) return res.status(400).json({ error: 'title requis' });
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM formations').get();
  const sort_order = (maxOrder.max ?? 0) + 1;
  const result = db.prepare(
    'INSERT INTO formations (title, description, image, image_alt, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).run(title, description ?? null, image ?? null, image_alt ?? null, sort_order);
  res.status(201).json(db.prepare('SELECT * FROM formations WHERE id = ?').get(result.lastInsertRowid));
});

// PUT /api/admin/formations/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM formations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Formation non trouvée' });
  const fields = ['title', 'description', 'image', 'image_alt'];
  const sets = [];
  const values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      sets.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  }
  if (sets.length > 0) {
    values.push(req.params.id);
    db.prepare(`UPDATE formations SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  }
  res.json(db.prepare('SELECT * FROM formations WHERE id = ?').get(req.params.id));
});

// DELETE /api/admin/formations/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM formations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Formation non trouvée' });
  db.prepare('DELETE FROM formations WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
