import jwt from 'jsonwebtoken';
import db from '../db.js';

/**
 * Checks the `Authorization: Bearer <token>` header.
 *
 * The token signature and expiry are verified, then the account is reloaded
 * from the database: a deleted account or a changed role takes effect
 * immediately instead of waiting for the token to expire.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }

  const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(payload.id);
  if (!user) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
  req.user = user;
  next();
}

/**
 * Restricts a route to the given roles (403 otherwise).
 * @param {...string} roles
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès interdit' });
    }
    next();
  };
}
