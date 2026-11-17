import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { resetDb, makeApp, tokenFor, db } from '../test/helpers.js';

const app = await makeApp();
let token;
beforeEach(async () => { resetDb(); token = await tokenFor(app, 'praticienne'); });
const as = (method, url, body) => request(app)[method](url).set('Authorization', `Bearer ${token}`).send(body);

// Une ligne par ressource : URL d'administration, URL publique, création valide, modification, création invalide.
const RESOURCES = [
  ['tarifs', '/api/admin/tarifs', '/api/tarifs', { prestation: 'Séance sportive', prix: 65 }, { prix: 70 }, { prestation: '', prix: 'cher' }],
  ['horaires', '/api/admin/horaires', '/api/horaires', { jour: 'Lundi', horaires: '8h – 12h' }, { horaires: '10h – 16h' }, { jour: 'Lundi' }],
  ['formations', '/api/admin/formations', '/api/formations', { title: 'Pédiatrie', image: '/uploads/a.jpg' }, { description: 'Formation 2026' }, { title: 'x', image: 'javascript:alert(1)' }],
  ['faqs', '/api/admin/faqs', '/api/faqs', { question: 'Durée ?', answer: '<em>45 min</em>' }, { answer: 'Une heure' }, { question: 'Sans réponse' }],
  ['spécialités', '/api/admin/pec', '/api/pec', { title: 'Nourrissons', icon: 'Heart', num: '04' }, { description: 'Dès la naissance' }, { title: 'x'.repeat(201) }],
  ['liens', '/api/admin/external-links', '/api/external-links', { type: 'booking', url: 'https://maiia.com/x' }, { label: 'Maiia' }, { type: 'booking', url: 'ftp://x' }],
];

describe.each(RESOURCES)('CRUD %s (US-12, US-13)', (_name, adminUrl, publicUrl, valid, patch, invalid) => {
  it('crée un élément, ajouté en fin de liste et visible sur le site public', async () => {
    const before = (await request(app).get(publicUrl)).body.length;
    const res = await as('post', adminUrl, valid);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTypeOf('number');
    const list = (await request(app).get(publicUrl)).body;
    expect(list).toHaveLength(before + 1);
    expect(list.at(-1).id).toBe(res.body.id);
  });

  it('modifie partiellement un élément sans toucher aux autres champs', async () => {
    const created = (await as('post', adminUrl, valid)).body;
    const res = await as('put', `${adminUrl}/${created.id}`, patch);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(patch);
    for (const [k, v] of Object.entries(valid)) if (!(k in patch)) expect(res.body[k]).toEqual(v);
  });

  it('supprime un élément', async () => {
    const created = (await as('post', adminUrl, valid)).body;
    expect((await as('delete', `${adminUrl}/${created.id}`)).status).toBe(204);
    expect((await request(app).get(publicUrl)).body.find((e) => e.id === created.id)).toBeUndefined();
  });

  it('refuse des données invalides (400) et n\'écrit rien', async () => {
    const before = (await request(app).get(publicUrl)).body.length;
    const res = await as('post', adminUrl, invalid);
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);
    expect((await request(app).get(publicUrl)).body).toHaveLength(before);
  });

  it('renvoie 404 pour un identifiant inexistant et 400 pour un identifiant non numérique', async () => {
    expect((await as('put', `${adminUrl}/99999`, patch)).status).toBe(404);
    expect((await as('delete', `${adminUrl}/99999`)).status).toBe(404);
    expect((await as('put', `${adminUrl}/abc`, patch)).status).toBe(400);
  });
});

describe('PUT /api/admin/site-config', () => {
  it('modifie seulement les champs envoyés', async () => {
    const res = await as('put', '/api/admin/site-config', { phone: '04 11 22 33 44', dark_mode: 1 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ phone: '04 11 22 33 44', dark_mode: 1, site_name: 'Cabinet de test' });
  });

  it('assainit le HTML avant de l\'enregistrer (US-06, XSS)', async () => {
    await as('put', '/api/admin/site-config', { hero_title: 'Bienvenue <em>ici</em><img src=x onerror=alert(1)><script>alert(2)</script>' });
    const stored = db.prepare('SELECT hero_title FROM site_config').get().hero_title;
    expect(stored).toBe('Bienvenue <em>ici</em>');
  });

  it('refuse une requête vide ou une variante de Hero inconnue', async () => {
    expect((await as('put', '/api/admin/site-config', {})).status).toBe(400);
    expect((await as('put', '/api/admin/site-config', { hero_variant: 'inconnue' })).status).toBe(400);
  });
});

describe('Gestion des comptes (US-20, US-21)', () => {
  let admin;
  beforeEach(async () => { admin = await tokenFor(app, 'admin'); });
  const asAdmin = (method, url, body) => request(app)[method](url).set('Authorization', `Bearer ${admin}`).send(body);

  it('crée un compte praticien avec mot de passe provisoire', async () => {
    const res = await asAdmin('post', '/api/admin/users', { email: 'Nouvelle.Praticienne@test.local', password: 'Provisoire-2026-b' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ email: 'nouvelle.praticienne@test.local', role: 'praticien', must_change_password: 1 });
  });

  it('refuse un e-mail déjà utilisé (409)', async () => {
    const res = await asAdmin('post', '/api/admin/users', { email: 'praticienne@test.local', password: 'Provisoire-2026-b' });
    expect(res.status).toBe(409);
  });

  it('liste les comptes sans les empreintes de mot de passe', async () => {
    const res = await asAdmin('get', '/api/admin/users');
    expect(res.body).toHaveLength(3);
    for (const u of res.body) expect(u).not.toHaveProperty('password_hash');
  });

  it('modifie le profil d\'un administrateur sans changer son rôle', async () => {
    const id = db.prepare("SELECT id FROM users WHERE role = 'admin'").get().id;
    const res = await asAdmin('put', `/api/admin/users/${id}`, { prenom: 'Fran', role: 'admin' });
    expect(res.status).toBe(200);
    expect(db.prepare('SELECT prenom, role FROM users WHERE id = ?').get(id)).toEqual({ prenom: 'Fran', role: 'admin' });
  });

  it('supprime un compte praticien mais jamais un administrateur', async () => {
    const prat = db.prepare("SELECT id FROM users WHERE email = 'nouvelle@test.local'").get().id;
    const adm = db.prepare("SELECT id FROM users WHERE role = 'admin'").get().id;
    expect((await asAdmin('delete', `/api/admin/users/${prat}`)).status).toBe(204);
    expect((await asAdmin('delete', `/api/admin/users/${adm}`)).status).toBe(403);
  });
});
