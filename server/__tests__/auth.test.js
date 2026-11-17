import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { resetDb, makeApp, tokenFor, db, TEST_ACCOUNTS } from '../test/helpers.js';

const app = await makeApp();
beforeEach(resetDb);
const login = (email, password) => request(app).post('/api/auth/login').send({ email, password });

describe('POST /api/auth/login (US-10)', () => {
  it('connecte un compte valide et ne renvoie jamais l\'empreinte du mot de passe', async () => {
    const { email, password } = TEST_ACCOUNTS.praticienne;
    const res = await login(email, password);
    expect(res.status).toBe(200);
    expect(res.body.token.split('.')).toHaveLength(3);
    expect(res.body.user).toMatchObject({ email, role: 'praticien', prenom: 'praticienne' });
    expect(JSON.stringify(res.body)).not.toContain('password_hash');
  });

  it('ignore la casse et les espaces de l\'e-mail', async () => {
    const res = await login('  PRATICIENNE@Test.Local ', TEST_ACCOUNTS.praticienne.password);
    expect(res.status).toBe(200);
  });

  it('enregistre la date de dernière connexion', async () => {
    await login(TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);
    const row = db.prepare('SELECT last_login_at FROM users WHERE email = ?').get(TEST_ACCOUNTS.admin.email);
    expect(row.last_login_at).toMatch(/^\d{4}-\d{2}-\d{2} /);
  });

  it('renvoie le même message pour un e-mail inconnu et un mauvais mot de passe', async () => {
    const a = await login('inconnu@test.local', 'x');
    const b = await login(TEST_ACCOUNTS.admin.email, 'mauvais');
    expect(a.status).toBe(401);
    expect(b.status).toBe(401);
    expect(a.body).toEqual(b.body);
  });

  it('exige e-mail et mot de passe', async () => {
    expect((await login('', '')).status).toBe(400);
    expect((await request(app).post('/api/auth/login').send({})).status).toBe(400);
  });

  it('indique au front qu\'un mot de passe provisoire doit être changé (US-11)', async () => {
    const res = await login(TEST_ACCOUNTS.nouvelle.email, TEST_ACCOUNTS.nouvelle.password);
    expect(res.body.user.must_change_password).toBe(1);
  });
});

describe('POST /api/auth/change-password (US-11)', () => {
  const change = (token, body) => request(app).post('/api/auth/change-password').set('Authorization', `Bearer ${token}`).send(body);

  it('change le mot de passe, lève l\'obligation et renvoie un nouveau jeton', async () => {
    const token = await tokenFor(app, 'nouvelle');
    const res = await change(token, { currentPassword: TEST_ACCOUNTS.nouvelle.password, newPassword: 'Nouveau-mot-de-passe-1' });
    expect(res.status).toBe(200);
    expect(res.body.user.must_change_password).toBe(0);
    expect((await login(TEST_ACCOUNTS.nouvelle.email, 'Nouveau-mot-de-passe-1')).status).toBe(200);
    expect((await login(TEST_ACCOUNTS.nouvelle.email, TEST_ACCOUNTS.nouvelle.password)).status).toBe(401);
  });

  it('refuse un mot de passe actuel incorrect', async () => {
    const token = await tokenFor(app, 'nouvelle');
    expect((await change(token, { currentPassword: 'faux', newPassword: 'Nouveau-mot-de-passe-1' })).status).toBe(401);
  });

  it('refuse un nouveau mot de passe trop court ou identique', async () => {
    const token = await tokenFor(app, 'nouvelle');
    const cur = TEST_ACCOUNTS.nouvelle.password;
    expect((await change(token, { currentPassword: cur, newPassword: 'court' })).status).toBe(400);
    expect((await change(token, { currentPassword: cur, newPassword: cur })).status).toBe(400);
  });

  it('exige d\'être connecté', async () => {
    expect((await request(app).post('/api/auth/change-password').send({})).status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('renvoie le compte courant, relu en base', async () => {
    const token = await tokenFor(app, 'admin');
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.body.user).toMatchObject({ email: TEST_ACCOUNTS.admin.email, role: 'admin' });
  });
});
