/**
 * Fuzzing : des entrées générées aléatoirement (fast-check) sont envoyées à l'API.
 * Propriété vérifiée : le serveur ne répond JAMAIS par une erreur 500 et ne
 * divulgue jamais de détail technique, quelle que soit l'entrée.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import fc from 'fast-check';
import { resetDb, makeApp, tokenFor } from '../test/helpers.js';

const app = await makeApp();
let token;
beforeAll(async () => { resetDb(); token = await tokenFor(app, 'praticienne'); });

// N'importe quelle valeur JSON : chaînes (y compris unicode, très longues), nombres, null, objets, tableaux imbriqués.
const anyJson = fc.jsonValue({ maxDepth: 3 });
// Vrais noms de champs de l'API avec des valeurs de n'importe quel type : c'est là que se cachent les erreurs de typage.
const FIELDS = ['email', 'password', 'prestation', 'prix', 'texte', 'jour', 'horaires', 'title', 'description', 'image', 'image_alt', 'question', 'answer', 'sort_order', 'num', 'icon', 'type', 'url', 'label', 'phone', 'dark_mode', 'hero_title', 'geo_lat', 'palette', 'avis_count', 'hero_variant', 'show_faq', 'canonical_base_url'];
const anyBody = fc.oneof(anyJson, fc.dictionary(fc.string(), anyJson), fc.dictionary(fc.constantFrom(...FIELDS), anyJson, { minKeys: 1 }));
const RUNS = Number(process.env.FUZZ_RUNS ?? 150);

// Le corps est sérialisé ici : on envoie exactement le JSON généré, y compris un nombre ou une chaîne seule.
const sendJson = (req, body) => req.set('Content-Type', 'application/json').send(JSON.stringify(body));

const noLeak = (res) => {
  expect(res.status).toBeLessThan(500);
  expect(res.text).not.toMatch(/at .*\.js:\d+|SqliteError|TypeError|stack/i);
};

describe('fuzzing de l\'API', () => {
  it('POST /api/auth/login ne plante jamais', async () => {
    await fc.assert(fc.asyncProperty(anyBody, async (body) => {
      noLeak(await sendJson(request(app).post('/api/auth/login'), body));
    }), { numRuns: RUNS });
  });

  it.each(['tarifs', 'horaires', 'formations', 'faqs', 'pec', 'external-links'])('POST/PUT /api/admin/%s ne plantent jamais', async (r) => {
    await fc.assert(fc.asyncProperty(anyBody, fc.oneof(fc.integer(), fc.string()), async (body, id) => {
      noLeak(await sendJson(request(app).post(`/api/admin/${r}`).set('Authorization', `Bearer ${token}`), body));
      noLeak(await sendJson(request(app).put(`/api/admin/${r}/${encodeURIComponent(String(id))}`).set('Authorization', `Bearer ${token}`), body));
    }), { numRuns: RUNS });
  });

  it('PUT /api/admin/site-config ne plante jamais, y compris avec de vrais noms de colonnes', async () => {
    const realKeys = fc.constantFrom('phone', 'dark_mode', 'hero_title', 'geo_lat', 'palette', 'avis_count', 'canonical_base_url', '__proto__', 'constructor');
    await fc.assert(fc.asyncProperty(fc.dictionary(fc.oneof(realKeys, fc.string()), anyJson), async (body) => {
      noLeak(await sendJson(request(app).put('/api/admin/site-config').set('Authorization', `Bearer ${token}`), body));
    }), { numRuns: RUNS });
  });

  it('les paramètres de requête publics ne plantent jamais', async () => {
    await fc.assert(fc.asyncProperty(fc.string(), async (q) => {
      noLeak(await request(app).get(`/api/external-links?type=${encodeURIComponent(q)}&type[x]=${encodeURIComponent(q)}`));
    }), { numRuns: RUNS });
  });
});
