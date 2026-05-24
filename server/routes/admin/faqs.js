import { Router } from 'express';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();
router.use(authenticate, requireRole('admin', 'praticien'));

router.get('/', (_req, res) => {
  res.json(db.prepare('SELECT * FROM faqs ORDER BY sort_order, id').all());
});

router.post('/', (req, res) => {
  const { question, answer, sort_order } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'question et answer requis' });
  const max = db.prepare('SELECT MAX(sort_order) as m FROM faqs').get();
  const order = sort_order != null ? Number(sort_order) : (max.m ?? 0) + 1;
  const result = db
    .prepare('INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)')
    .run(question, answer, order);
  res.status(201).json(db.prepare('SELECT * FROM faqs WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM faqs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'FAQ non trouvée' });
  const fields = ['question', 'answer', 'sort_order'];
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
    db.prepare(`UPDATE faqs SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  }
  res.json(db.prepare('SELECT * FROM faqs WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM faqs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'FAQ non trouvée' });
  db.prepare('DELETE FROM faqs WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
