import { Router } from 'express';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin', 'praticien'));

// POST /api/admin/horaires
router.post('/', (req, res) => {
  const { jour, horaires } = req.body;
  if (!jour || !horaires) {
    return res.status(400).json({ error: 'jour et horaires requis' });
  }
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM horaires').get();
  const sort_order = (maxOrder.max ?? 0) + 1;
  const result = db.prepare(
    'INSERT INTO horaires (jour, horaires, sort_order) VALUES (?, ?, ?)'
  ).run(jour, horaires, sort_order);
  const horaire = db.prepare('SELECT * FROM horaires WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(horaire);
});

// PUT /api/admin/horaires/:id
router.put('/:id', (req, res) => {
  const { jour, horaires } = req.body;
  const existing = db.prepare('SELECT * FROM horaires WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Horaire non trouvé' });
  db.prepare(
    'UPDATE horaires SET jour = ?, horaires = ? WHERE id = ?'
  ).run(
    jour ?? existing.jour,
    horaires ?? existing.horaires,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM horaires WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/admin/horaires/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM horaires WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Horaire non trouvé' });
  db.prepare('DELETE FROM horaires WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
