import { Router } from 'express';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin', 'alissar'));

// GET /api/admin/consultations
router.get('/', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM consultations ORDER BY date DESC'
  ).all();
  res.json(rows);
});

// POST /api/admin/consultations
router.post('/', (req, res) => {
  const { date, patient_nom, prestation, montant, notes } = req.body;
  if (!date || !prestation || montant == null) {
    return res.status(400).json({ error: 'Date, prestation et montant requis' });
  }
  const r = db.prepare(
    'INSERT INTO consultations (date, patient_nom, prestation, montant, notes) VALUES (?,?,?,?,?)'
  ).run(date, patient_nom || null, prestation, montant, notes || null);
  res.status(201).json({ id: r.lastInsertRowid, date, patient_nom, prestation, montant, notes });
});

// PUT /api/admin/consultations/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM consultations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Consultation introuvable' });

  const { date, patient_nom, prestation, montant, notes } = req.body;
  db.prepare(
    'UPDATE consultations SET date = ?, patient_nom = ?, prestation = ?, montant = ?, notes = ? WHERE id = ?'
  ).run(date, patient_nom || null, prestation, montant, notes || null, req.params.id);
  res.json({ success: true });
});

// DELETE /api/admin/consultations/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM consultations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Consultation introuvable' });

  db.prepare('DELETE FROM consultations WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
