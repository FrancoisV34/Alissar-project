import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { resetDb, makeApp, db } from '../test/helpers.js';
import { TEST_DATA } from '../seed-test.js';

const app = await makeApp();
beforeEach(resetDb);

describe('API publique', () => {
  it('GET /healthz répond ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /api/site-config renvoie la configuration', async () => {
    const res = await request(app).get('/api/site-config');
    expect(res.status).toBe(200);
    expect(res.body.site_name).toBe('Cabinet de test');
    expect(res.body.hero_title).toContain('<em>');
  });

  it('GET /api/tarifs renvoie les tarifs dans l\'ordre d\'affichage', async () => {
    const res = await request(app).get('/api/tarifs');
    expect(res.body.map((t) => t.prestation)).toEqual(TEST_DATA.tarifs.map((t) => t[0]));
    expect(res.body[2].prix).toBe(0);
  });

  it.each([
    ['/api/horaires', 7],
    ['/api/formations', 2],
    ['/api/pec', 3],
    ['/api/faqs', 3],
    ['/api/external-links', 1],
  ])('GET %s renvoie %i élément(s)', async (url, n) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(n);
  });

  it('filtre les liens externes par type', async () => {
    expect((await request(app).get('/api/external-links?type=booking')).body).toHaveLength(1);
    expect((await request(app).get('/api/external-links?type=autre')).body).toHaveLength(0);
  });

  it('refuse un paramètre type multiple au lieu de planter', async () => {
    const res = await request(app).get('/api/external-links?type=a&type=b');
    expect(res.status).toBe(400);
  });

  it('renvoie une 404 JSON pour une route d\'API inconnue', async () => {
    const res = await request(app).get('/api/inexistant');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  it('robots.txt interdit l\'administration et pointe vers le sitemap', async () => {
    const res = await request(app).get('/robots.txt');
    expect(res.text).toContain('Disallow: /admin');
    expect(res.text).toContain('Sitemap: https://cabinet.test/sitemap.xml');
  });

  it('sitemap.xml suit les sections affichées (US-16)', async () => {
    expect((await request(app).get('/sitemap.xml')).text).toContain('#faq');
    db.prepare('UPDATE site_config SET show_faq = 0').run();
    expect((await request(app).get('/sitemap.xml')).text).not.toContain('#faq');
  });
});
