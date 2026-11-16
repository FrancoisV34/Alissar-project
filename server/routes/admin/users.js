import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';
import { schemas, validate } from '../../lib/validation.js';

const router = Router();

// Account management is reserved to the administrator (least privilege):
// the practitioner edits the content, not the accounts.
router.use(authenticate, requireRole('admin'));

const idParam = validate(schemas.idParam, 'params');

// POST /api/admin/users
router.post('/', validate(schemas.userCreate), async (req, res) => {
  const { nom, prenom, email, password, telephone, role } = req.body;
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });
  const password_hash = await bcrypt.hash(password, 10);
  const r = db.prepare(
    'INSERT INTO users (email, password_hash, nom, prenom, telephone, role, must_change_password) VALUES (?,?,?,?,?,?,1)'
  ).run(email, password_hash, nom ?? null, prenom ?? null, telephone ?? null, role);
  res.status(201).json({ id: r.lastInsertRowid, email, nom: nom ?? null, prenom: prenom ?? null, telephone: telephone ?? null, role, must_change_password: 1 });
});

// GET /api/admin/users
router.get('/', (_req, res) => {
  const users = db.prepare(
    'SELECT id, email, nom, prenom, telephone, role, must_change_password, created_at, last_login_at FROM users ORDER BY created_at DESC'
  ).all();
  res.json(users);
});

// PUT /api/admin/users/:id
router.put('/:id', idParam, validate(schemas.userUpdate), (req, res) => {
  const { id } = req.validParams;
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!target) return res.status(404).json({ error: 'Utilisateur introuvable' });

  const { nom, prenom, telephone, role } = req.body;
  // The admin role can neither be given nor removed through the API.
  if (role === 'admin' && target.role !== 'admin') {
    return res.status(403).json({ error: 'Le rôle administrateur ne peut pas être attribué' });
  }
  const newRole = target.role === 'admin' ? 'admin' : role ?? target.role;
  db.prepare('UPDATE users SET nom = ?, prenom = ?, telephone = ?, role = ? WHERE id = ?')
    .run(nom ?? target.nom, prenom ?? target.prenom, telephone ?? target.telephone, newRole, id);
  res.json({ success: true });
});

// DELETE /api/admin/users/:id
router.delete('/:id', idParam, (req, res) => {
  const { id } = req.validParams;
  const target = db.prepare('SELECT role FROM users WHERE id = ?').get(id);
  if (!target) return res.status(404).json({ error: 'Utilisateur introuvable' });
  if (target.role === 'admin') return res.status(403).json({ error: 'Impossible de supprimer un administrateur' });

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.status(204).end();
});

export default router;
