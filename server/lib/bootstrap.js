import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import db from '../db.js';
import { runSeed } from '../seed.js';

/**
 * First-boot bootstrap : seed la DB si elle est vide, et crée un admin si aucun
 * n'existe. Idempotent — peut être appelé à chaque démarrage du serveur.
 */
export function bootstrap() {
  // 1. Seed si vide
  const siteCfg = db.prepare('SELECT id FROM site_config WHERE id = 1').get();
  if (!siteCfg) {
    console.log('[bootstrap] DB vide → seed initial...');
    runSeed({ clean: false });
    console.log('[bootstrap] Seed terminé.');
  }

  // 2. Création admin si aucun n'existe
  const adminRow = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (!adminRow) {
    const email = process.env.ADMIN_EMAIL?.trim();
    const password = process.env.ADMIN_PASSWORD?.trim();

    if (email && password) {
      const hash = bcrypt.hashSync(password, 10);
      db.prepare(
        "INSERT INTO users (email, password_hash, role, prenom, must_change_password) VALUES (?, ?, 'admin', ?, 0)"
      ).run(email, hash, 'Admin');
      console.log(`[bootstrap] Compte admin créé : ${email}`);
    } else {
      // Génère un mot de passe aléatoire si pas d'env vars
      const fallbackEmail = 'admin@local';
      const genPassword = crypto.randomBytes(12).toString('base64url');
      const hash = bcrypt.hashSync(genPassword, 10);
      db.prepare(
        "INSERT INTO users (email, password_hash, role, prenom, must_change_password) VALUES (?, ?, 'admin', ?, 1)"
      ).run(fallbackEmail, hash, 'Admin');
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║  ⚠️  COMPTE ADMIN GÉNÉRÉ AUTOMATIQUEMENT                ║');
      console.log('╠══════════════════════════════════════════════════════════╣');
      console.log(`║  Email    : ${fallbackEmail.padEnd(44)}║`);
      console.log(`║  Password : ${genPassword.padEnd(44)}║`);
      console.log('║                                                          ║');
      console.log('║  Notez-le : il ne sera plus affiché.                     ║');
      console.log('║  Connectez-vous puis changez le mot de passe.            ║');
      console.log('║                                                          ║');
      console.log('║  Pour personnaliser : définissez les env vars            ║');
      console.log('║    ADMIN_EMAIL et ADMIN_PASSWORD avant le 1er démarrage. ║');
      console.log('╚══════════════════════════════════════════════════════════╝');
      console.log('');
    }
  }

  // 3. JWT_SECRET : warning si absent
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.warn('[bootstrap] ⚠️  JWT_SECRET manquant ou trop court. En production, définissez une valeur ≥ 32 caractères.');
  }
}
