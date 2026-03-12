import { Router } from 'express';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

// POST /api/admin/formations
router.post('/', (req, res) => {
  const { title, description, image } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'title requis' });
  }
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM formations').get();
  const sort_order = (maxOrder.max ?? 0) + 1;
  const result = db.prepare(
    'INSERT INTO formations (title, description, image, sort_order) VALUES (?, ?, ?, ?)'
  ).run(title, description ?? null, image ?? null, sort_order);
  const formation = db.prepare('SELECT * FROM formations WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(formation);
});

// PUT /api/admin/formations/:id
router.put('/:id', (req, res) => {
  const { title, description, image } = req.body;
  const existing = db.prepare('SELECT * FROM formations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Formation non trouvée' });
  db.prepare(
    'UPDATE formations SET title = ?, description = ?, image = ? WHERE id = ?'
  ).run(
    title ?? existing.title,
    description !== undefined ? description : existing.description,
    image !== undefined ? image : existing.image,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM formations WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/admin/formations/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM formations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Formation non trouvée' });
  db.prepare('DELETE FROM formations WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
