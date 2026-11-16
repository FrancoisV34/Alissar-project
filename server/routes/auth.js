import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { schemas, validate } from '../lib/validation.js';

const router = Router();

/** Session length. The account is re-checked on every request (see authenticate). */
export const TOKEN_TTL = '1d';

// Hash compared when the e-mail is unknown, so that the response time does not
// reveal whether an account exists (user enumeration).
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 10);

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL, algorithm: 'HS256' });
}

const publicUser = (row) => ({
  id: row.id, email: row.email, role: row.role, prenom: row.prenom ?? null, must_change_password: row.must_change_password,
});

// POST /api/auth/login
router.post('/login', validate(schemas.login), async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const row = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email.trim());
  const valid = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH);
  if (!row || !valid) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  res.json({ token: signToken(row), user: publicUser(row) });
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, validate(schemas.changePassword), async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const valid = await bcrypt.compare(currentPassword, row.password_hash);
  if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
  if (currentPassword === newPassword) return res.status(400).json({ error: 'Le nouveau mot de passe doit être différent' });

  const password_hash = await bcrypt.hash(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?').run(password_hash, req.user.id);
  const user = { ...publicUser(row), must_change_password: 0 };
  res.json({ token: signToken(user), user });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;
