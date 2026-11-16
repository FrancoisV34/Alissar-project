import { describe, it, expect, vi } from 'vitest';
import { db } from '../test/helpers.js';
import { bootstrap } from '../lib/bootstrap.js';

describe('Premier démarrage (US-22)', () => {
  it('base vide : migrations, contenu par défaut, compte admin depuis les variables d\'environnement', () => {
    process.env.ADMIN_EMAIL = 'premier@test.local';
    process.env.ADMIN_PASSWORD = 'Premier-Demarrage-1';
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    bootstrap();
    expect(db.prepare('SELECT COUNT(*) AS n FROM schema_migrations').get().n).toBeGreaterThanOrEqual(2);
    expect(db.prepare('SELECT site_name FROM site_config WHERE id = 1').get()).toBeDefined();
    expect(db.prepare("SELECT email, must_change_password FROM users WHERE role = 'admin'").get())
      .toEqual({ email: 'premier@test.local', must_change_password: 0 });
    log.mockRestore();
  });

  it('redémarrage : ne recrée ni contenu ni compte (idempotent)', () => {
    const before = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
    bootstrap();
    expect(db.prepare('SELECT COUNT(*) AS n FROM users').get().n).toBe(before);
  });

  it('sans variables : mot de passe aléatoire affiché une fois, changement obligatoire', () => {
    db.exec("DELETE FROM users WHERE role = 'admin'");
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
    const out = [];
    const log = vi.spyOn(console, 'log').mockImplementation((m) => out.push(m));
    bootstrap();
    log.mockRestore();
    expect(out.join('\n')).toMatch(/COMPTE ADMIN GÉNÉRÉ/);
    expect(db.prepare("SELECT must_change_password FROM users WHERE email = 'admin@local'").get().must_change_password).toBe(1);
  });
});
