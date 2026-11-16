import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { resetDb, makeApp, tokenFor, PNG_1PX } from '../test/helpers.js';

const app = await makeApp();
let token;
beforeAll(async () => { resetDb(); token = await tokenFor(app, 'praticienne'); });
const upload = (buffer, filename, contentType) => request(app).post('/api/admin/upload')
  .set('Authorization', `Bearer ${token}`).attach('image', buffer, { filename, contentType });

describe('POST /api/admin/upload (US-13)', () => {
  it('accepte un PNG, le renomme et le sert avec une CSP de confinement', async () => {
    const res = await upload(PNG_1PX, 'mon portrait.png', 'image/png');
    expect(res.status).toBe(200);
    expect(res.body.url).toMatch(/^\/uploads\/\d+-[0-9a-f]{12}\.png$/);
    const file = await request(app).get(res.body.url);
    expect(file.status).toBe(200);
    expect(file.headers['content-security-policy']).toContain('sandbox');
  });

  it('refuse un SVG, même déclaré comme image', async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    expect((await upload(svg, 'logo.svg', 'image/svg+xml')).status).toBe(400);
  });

  it('refuse un fichier HTML renommé en .png', async () => {
    expect((await upload(Buffer.from('<html><script>alert(1)</script></html>'), 'photo.png', 'image/png')).status).toBe(400);
  });

  it('refuse un fichier de plus de 8 Mo avec un message clair', async () => {
    const big = Buffer.concat([PNG_1PX, Buffer.alloc(8 * 1024 * 1024 + 1)]);
    const res = await upload(big, 'grand.png', 'image/png');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/8 Mo/);
  });

  it('refuse une requête sans fichier', async () => {
    const res = await request(app).post('/api/admin/upload').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
