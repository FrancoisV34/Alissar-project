/**
 * Tests de sécurité : les 14 contrôles de docs/securite/AUDIT.md deviennent des
 * tests de non-régression, plus le contrôle d'accès systématique de toutes les
 * routes d'administration.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { resetDb, makeApp, tokenFor, db, TEST_ACCOUNTS } from '../test/helpers.js';

const app = await makeApp();
beforeEach(resetDb);

const ADMIN_ROUTES = [
  ['get', '/api/admin/users'], ['post', '/api/admin/users'], ['put', '/api/admin/users/1'], ['delete', '/api/admin/users/1'],
  ['put', '/api/admin/site-config'], ['post', '/api/admin/upload'],
  ...['tarifs', 'horaires', 'formations', 'faqs', 'pec', 'external-links'].flatMap((r) => [
    ['get', `/api/admin/${r}`], ['post', `/api/admin/${r}`], ['put', `/api/admin/${r}/1`], ['delete', `/api/admin/${r}/1`],
  ]),
];

describe('A01 Contrôle d\'accès', () => {
  it.each(ADMIN_ROUTES)('%s %s sans jeton → 401', async (method, url) => {
    expect((await request(app)[method](url)).status).toBe(401);
  });

  const forged = {
    'signé avec un autre secret': () => jwt.sign({ id: 1, role: 'admin' }, 'autre-secret'),
    'expiré': () => jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: -10 }),
    'algorithme « none »': () => `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from('{"id":1,"role":"admin"}').toString('base64url')}.`,
    'mal formé': () => 'pas.un.jeton',
  };
  it.each(Object.keys(forged))('jeton %s → 401', async (kind) => {
    const res = await request(app).get('/api/admin/faqs').set('Authorization', `Bearer ${forged[kind]()}`);
    expect(res.status).toBe(401);
  });

  it('S1 : un compte praticien ne peut pas créer de compte (et encore moins un admin)', async () => {
    const token = await tokenFor(app, 'praticienne');
    const res = await request(app).post('/api/admin/users').set('Authorization', `Bearer ${token}`)
      .send({ email: 'pirate@test.local', password: 'Mot-de-passe-long-1', role: 'admin' });
    expect(res.status).toBe(403);
    expect(db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'").get().n).toBe(1);
  });

  it('S2 : un rôle hors liste est refusé, et le rôle admin ne peut pas être attribué', async () => {
    const admin = await tokenFor(app, 'admin');
    const create = await request(app).post('/api/admin/users').set('Authorization', `Bearer ${admin}`)
      .send({ email: 'r@test.local', password: 'Mot-de-passe-long-1', role: 'superuser' });
    expect(create.status).toBe(400);
    const pratId = db.prepare("SELECT id FROM users WHERE email = 'praticienne@test.local'").get().id;
    const promote = await request(app).put(`/api/admin/users/${pratId}`).set('Authorization', `Bearer ${admin}`).send({ role: 'admin' });
    expect(promote.status).toBe(403);
  });

  it('S11 : le jeton d\'un compte supprimé est refusé immédiatement', async () => {
    const token = await tokenFor(app, 'praticienne');
    db.prepare("DELETE FROM users WHERE email = 'praticienne@test.local'").run();
    expect((await request(app).get('/api/admin/faqs').set('Authorization', `Bearer ${token}`)).status).toBe(401);
  });

  it('un changement de rôle en base s\'applique sans attendre l\'expiration du jeton', async () => {
    const token = await tokenFor(app, 'admin');
    db.prepare("UPDATE users SET role = 'praticien' WHERE email = 'admin@test.local'").run();
    expect((await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`)).status).toBe(403);
  });
});

describe('A03 Injection', () => {
  it('injection SQL dans la connexion : simple échec d\'authentification', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: "' OR 1=1 --", password: "' OR '1'='1" });
    expect(res.status).toBe(401);
  });

  it('injection SQL dans un contenu : stockée comme du texte, tables intactes', async () => {
    const token = await tokenFor(app, 'praticienne');
    const payload = "Séance'); DROP TABLE tarifs; --";
    const res = await request(app).post('/api/admin/tarifs').set('Authorization', `Bearer ${token}`).send({ prestation: payload, prix: 1 });
    expect(res.status).toBe(201);
    expect(res.body.prestation).toBe(payload);
    expect(db.prepare('SELECT COUNT(*) AS n FROM tarifs').get().n).toBe(4);
  });

  it('S3 : XSS stockée neutralisée dans les champs riches', async () => {
    const token = await tokenFor(app, 'praticienne');
    await request(app).put('/api/admin/site-config').set('Authorization', `Bearer ${token}`)
      .send({ about_text: '<p>Texte</p><img src=x onerror=alert(1)><svg onload=alert(2)>' });
    const { about_text } = (await request(app).get('/api/site-config')).body;
    expect(about_text).toBe('<p>Texte</p>');
  });

  it('S14 : lien javascript: refusé', async () => {
    const token = await tokenFor(app, 'praticienne');
    const res = await request(app).post('/api/admin/external-links').set('Authorization', `Bearer ${token}`)
      .send({ type: 'booking', url: 'javascript:alert(document.cookie)' });
    expect(res.status).toBe(400);
  });

  it('S12 : types inattendus → 400 et non 500', async () => {
    expect((await request(app).post('/api/auth/login').send({ email: { $gt: '' }, password: 'x' })).status).toBe(400);
    const token = await tokenFor(app, 'praticienne');
    const res = await request(app).put('/api/admin/site-config').set('Authorization', `Bearer ${token}`).send({ dark_mode: true });
    expect(res.status).toBe(400);
  });
});

describe('A05 Configuration de sécurité', () => {
  it('S6 : en-tête Content-Security-Policy sans script inline', async () => {
    const csp = (await request(app).get('/healthz')).headers['content-security-policy'];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toMatch(/script-src [^;]*/);
    expect(csp.match(/script-src [^;]*/)[0]).not.toContain('unsafe-inline');
  });

  it('S7 : CORS refusé pour un site tiers', async () => {
    const res = await request(app).get('/api/site-config').set('Origin', 'https://site-malveillant.example');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('S13 : JSON malformé → 400 JSON sans pile d\'appels', async () => {
    const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{"email":');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'JSON invalide' });
    expect(res.text).not.toMatch(/at .*\.js/);
  });

  it('pas d\'en-tête X-Powered-By, HSTS et nosniff présents', async () => {
    const res = await request(app).get('/healthz');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('corps de requête limité à 1 Mo', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a', password: 'x'.repeat(1_100_000) });
    expect(res.status).toBe(413);
  });
});

describe('A07 Authentification', () => {
  it('S9 : mot de passe de moins de 12 caractères refusé', async () => {
    const token = await tokenFor(app, 'praticienne');
    const res = await request(app).post('/api/auth/change-password').set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: TEST_ACCOUNTS.praticienne.password, newPassword: 'a' });
    expect(res.status).toBe(400);
  });

  it('S10 : même temps de réponse pour un compte existant et un compte inconnu', async () => {
    // Compte au coût bcrypt de production (10), comme l'empreinte factice.
    db.prepare("INSERT INTO users (email, password_hash, role) VALUES ('cout10@test.local', ?, 'praticien')").run(bcrypt.hashSync('x', 10));
    const avg = async (email) => {
      const t = performance.now();
      for (let i = 0; i < 4; i++) await request(app).post('/api/auth/login').send({ email, password: 'mauvais' });
      return (performance.now() - t) / 4;
    };
    const known = await avg('cout10@test.local');
    const unknown = await avg('inconnu@test.local');
    expect(Math.max(known, unknown) / Math.min(known, unknown)).toBeLessThan(2);
  });

  it('limitation des tentatives de connexion (anti brute force)', async () => {
    const limited = await makeApp({ loginMaxAttempts: 3 });
    const statuses = [];
    for (let i = 0; i < 5; i++) statuses.push((await request(limited).post('/api/auth/login').send({ email: 'x@y.z', password: 'x' })).status);
    expect(statuses).toEqual([401, 401, 401, 429, 429]);
  });
});
