import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

// POST /api/admin/users
router.post('/', async (req, res) => {
  const { nom, prenom, email, password, telephone, role = 'patient' } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });
  const password_hash = await bcrypt.hash(password, 10);
  const r = db.prepare(
    'INSERT INTO users (email, password_hash, nom, prenom, telephone, role, must_change_password) VALUES (?,?,?,?,?,?,1)'
  ).run(email, password_hash, nom ?? null, prenom ?? null, telephone ?? null, role);
  res.status(201).json({ id: r.lastInsertRowid, email, nom, prenom, telephone, role, must_change_password: 1 });
});

// GET /api/admin/users
router.get('/', (req, res) => {
  const users = db.prepare(
    'SELECT id, email, nom, prenom, telephone, role, must_change_password, created_at FROM users ORDER BY created_at DESC'
  ).all();
  res.json(users);
});

// PUT /api/admin/users/:id
router.put('/:id', (req, res) => {
  const target = db.prepare('SELECT role FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Utilisateur introuvable' });

  const { nom, prenom, telephone, role } = req.body;
  const newRole = target.role === 'admin' ? 'admin' : role; // rôle admin non modifiable
  db.prepare(
    'UPDATE users SET nom = ?, prenom = ?, telephone = ?, role = ? WHERE id = ?'
  ).run(nom ?? null, prenom ?? null, telephone ?? null, newRole, req.params.id);
  res.json({ success: true });
});

// DELETE /api/admin/users/:id
router.delete('/:id', (req, res) => {
  const target = db.prepare('SELECT role FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Utilisateur introuvable' });
  if (target.role === 'admin') return res.status(403).json({ error: 'Impossible de supprimer un administrateur' });

  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
