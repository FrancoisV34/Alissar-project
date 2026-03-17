import { Router } from 'express';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin', 'praticien'));

// GET /api/admin/external-links
router.get('/', (_req, res) => {
  const links = db.prepare('SELECT * FROM external_links ORDER BY sort_order').all();
  res.json(links);
});

// POST /api/admin/external-links
router.post('/', (req, res) => {
  const { type, url, label, sort_order } = req.body;
  if (!type || !url) return res.status(400).json({ error: 'type et url requis' });

  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM external_links').get();
  const order = sort_order ?? (maxOrder.max ?? 0) + 1;

  const result = db.prepare(
    'INSERT INTO external_links (type, url, label, sort_order) VALUES (?, ?, ?, ?)'
  ).run(type, url, label ?? null, order);

  res.status(201).json({ id: result.lastInsertRowid, type, url, label, sort_order: order });
});

// PUT /api/admin/external-links/:id
router.put('/:id', (req, res) => {
  const { type, url, label, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM external_links WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Lien non trouve' });

  db.prepare(
    'UPDATE external_links SET type = ?, url = ?, label = ?, sort_order = ? WHERE id = ?'
  ).run(
    type ?? existing.type,
    url ?? existing.url,
    label ?? existing.label,
    sort_order ?? existing.sort_order,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM external_links WHERE id = ?').get(req.params.id));
});

// DELETE /api/admin/external-links/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM external_links WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Lien non trouve' });
  res.status(204).end();
});

export default router;
