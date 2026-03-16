import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin', 'alissar'));

// GET /api/admin/patients/search?q=...
router.get('/search', (req, res) => {
  const q = req.query.q?.trim();
  if (!q || q.length < 2) return res.json([]);
  const like = `%${q}%`;
  const patients = db.prepare(
    `SELECT id, nom, prenom, email, telephone FROM users
     WHERE role = 'patient' AND (nom LIKE ? OR prenom LIKE ? OR email LIKE ?)
     LIMIT 10`
  ).all(like, like, like);
  res.json(patients);
});

// GET /api/admin/patients
router.get('/', (req, res) => {
  const patients = db.prepare(
    `SELECT u.id, u.nom, u.prenom, u.email, u.telephone, u.created_at,
            p.date_naissance, p.sexe, p.adresse, p.medecin_traitant, p.antecedents_medicaux
     FROM users u
     LEFT JOIN patient_profiles p ON p.user_id = u.id
     WHERE u.role = 'patient'
     ORDER BY u.nom, u.prenom`
  ).all();
  res.json(patients);
});

// GET /api/admin/patients/:id
router.get('/:id', (req, res) => {
  const patient = db.prepare(
    `SELECT u.id, u.nom, u.prenom, u.email, u.telephone, u.created_at,
            p.date_naissance, p.sexe, p.adresse, p.medecin_traitant, p.antecedents_medicaux
     FROM users u
     LEFT JOIN patient_profiles p ON p.user_id = u.id
     WHERE u.id = ? AND u.role = 'patient'`
  ).get(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient introuvable' });
  res.json(patient);
});

// POST /api/admin/patients
router.post('/', async (req, res) => {
  const { nom, prenom, email, telephone, date_naissance, sexe, adresse, medecin_traitant, antecedents_medicaux } = req.body;
  if (!nom || !prenom || !email) return res.status(400).json({ error: 'Nom, prénom et email requis' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });

  const tempPassword = crypto.randomUUID().slice(0, 12);
  const password_hash = await bcrypt.hash(tempPassword, 10);

  const createPatient = db.transaction(() => {
    const userResult = db.prepare(
      'INSERT INTO users (email, password_hash, nom, prenom, telephone, role, must_change_password) VALUES (?,?,?,?,?,?,1)'
    ).run(email, password_hash, nom, prenom, telephone ?? null, 'patient');

    const userId = userResult.lastInsertRowid;

    db.prepare(
      'INSERT INTO patient_profiles (user_id, date_naissance, sexe, adresse, medecin_traitant, antecedents_medicaux) VALUES (?,?,?,?,?,?)'
    ).run(userId, date_naissance ?? null, sexe ?? null, adresse ?? null, medecin_traitant ?? null, antecedents_medicaux ?? null);

    return userId;
  });

  const userId = createPatient();

  res.status(201).json({
    id: userId,
    nom, prenom, email, telephone: telephone ?? null,
    date_naissance: date_naissance ?? null,
    sexe: sexe ?? null,
    tempPassword,
  });
});

// PUT /api/admin/patients/:id
router.put('/:id', (req, res) => {
  const target = db.prepare('SELECT id FROM users WHERE id = ? AND role = ?').get(req.params.id, 'patient');
  if (!target) return res.status(404).json({ error: 'Patient introuvable' });

  const { nom, prenom, email, telephone, date_naissance, sexe, adresse, medecin_traitant, antecedents_medicaux } = req.body;

  if (email) {
    const conflict = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.params.id);
    if (conflict) return res.status(409).json({ error: 'Email déjà utilisé' });
  }

  const updatePatient = db.transaction(() => {
    db.prepare(
      'UPDATE users SET nom = ?, prenom = ?, telephone = ?, email = ? WHERE id = ?'
    ).run(nom ?? null, prenom ?? null, telephone ?? null, email ?? null, req.params.id);

    const existing = db.prepare('SELECT id FROM patient_profiles WHERE user_id = ?').get(req.params.id);
    if (existing) {
      db.prepare(
        'UPDATE patient_profiles SET date_naissance = ?, sexe = ?, adresse = ?, medecin_traitant = ?, antecedents_medicaux = ? WHERE user_id = ?'
      ).run(date_naissance ?? null, sexe ?? null, adresse ?? null, medecin_traitant ?? null, antecedents_medicaux ?? null, req.params.id);
    } else {
      db.prepare(
        'INSERT INTO patient_profiles (user_id, date_naissance, sexe, adresse, medecin_traitant, antecedents_medicaux) VALUES (?,?,?,?,?,?)'
      ).run(req.params.id, date_naissance ?? null, sexe ?? null, adresse ?? null, medecin_traitant ?? null, antecedents_medicaux ?? null);
    }
  });

  updatePatient();
  res.json({ success: true });
});

export default router;
