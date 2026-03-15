import { Router } from 'express';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin', 'alissar'));

// POST /api/admin/tarifs
router.post('/', (req, res) => {
  const { prestation, prix, texte } = req.body;
  if (!prestation || prix === undefined) {
    return res.status(400).json({ error: 'prestation et prix requis' });
  }
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM tarifs').get();
  const sort_order = (maxOrder.max ?? 0) + 1;
  const result = db.prepare(
    'INSERT INTO tarifs (prestation, prix, texte, sort_order) VALUES (?, ?, ?, ?)'
  ).run(prestation, prix, texte ?? null, sort_order);
  const tarif = db.prepare('SELECT * FROM tarifs WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(tarif);
});

// PUT /api/admin/tarifs/:id
router.put('/:id', (req, res) => {
  const { prestation, prix, texte } = req.body;
  const existing = db.prepare('SELECT * FROM tarifs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tarif non trouvé' });
  db.prepare(
    'UPDATE tarifs SET prestation = ?, prix = ?, texte = ? WHERE id = ?'
  ).run(
    prestation ?? existing.prestation,
    prix ?? existing.prix,
    texte !== undefined ? texte : existing.texte,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM tarifs WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/admin/tarifs/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM tarifs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tarif non trouvé' });
  db.prepare('DELETE FROM tarifs WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
