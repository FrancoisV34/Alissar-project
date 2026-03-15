import { Router } from 'express';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin', 'alissar'));

// GET /api/admin/osteo/recent — 20 dernières consultations
router.get('/recent', (req, res) => {
  const rows = db.prepare(
    `SELECT co.*, u.nom, u.prenom
     FROM consult_osteo co
     JOIN users u ON u.id = co.patient_id
     ORDER BY co.created_at DESC LIMIT 20`
  ).all();
  res.json(rows);
});

// GET /api/admin/osteo/patient/:patientId — consultations d'un patient
router.get('/patient/:patientId', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM consult_osteo WHERE patient_id = ? ORDER BY date DESC'
  ).all(req.params.patientId);
  res.json(rows);
});

// GET /api/admin/osteo/:id — consultation unique
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM consult_osteo WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Consultation introuvable' });
  res.json(row);
});

// POST /api/admin/osteo — créer une consultation
router.post('/', (req, res) => {
  const { patient_id, date, motif, anamnese, antecedents, examen_clinique, tests_osteo, traitement, conseils, montant } = req.body;
  if (!patient_id) return res.status(400).json({ error: 'patient_id requis' });

  const consultDate = date || new Date().toISOString().slice(0, 10);

  const result = db.prepare(
    `INSERT INTO consult_osteo (patient_id, date, motif, anamnese, antecedents, examen_clinique, tests_osteo, traitement, conseils, montant)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(patient_id, consultDate, motif ?? null, anamnese ?? null, antecedents ?? null, examen_clinique ?? null, tests_osteo ?? null, traitement ?? null, conseils ?? null, montant ?? null);

  const created = db.prepare('SELECT * FROM consult_osteo WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PUT /api/admin/osteo/:id — modifier une consultation
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM consult_osteo WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Consultation introuvable' });

  const { date, motif, anamnese, antecedents, examen_clinique, tests_osteo, traitement, conseils, montant } = req.body;

  db.prepare(
    `UPDATE consult_osteo SET date = ?, motif = ?, anamnese = ?, antecedents = ?, examen_clinique = ?, tests_osteo = ?, traitement = ?, conseils = ?, montant = ?
     WHERE id = ?`
  ).run(date ?? null, motif ?? null, anamnese ?? null, antecedents ?? null, examen_clinique ?? null, tests_osteo ?? null, traitement ?? null, conseils ?? null, montant ?? null, req.params.id);

  const updated = db.prepare('SELECT * FROM consult_osteo WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/admin/osteo/:id — supprimer une consultation
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM consult_osteo WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Consultation introuvable' });

  db.prepare('DELETE FROM consult_osteo WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

export default router;
