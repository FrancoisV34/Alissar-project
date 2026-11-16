import { test, expect } from '@playwright/test';
import { e2eDb } from './helpers.js';

test('S3 : du code injecté directement en base ne s\'exécute pas sur le site', async ({ page }) => {
  const db = e2eDb();
  const original = db.prepare('SELECT hero_title FROM site_config').get().hero_title;
  // On contourne volontairement l'API (qui assainit déjà) pour tester les défenses du navigateur.
  db.prepare('UPDATE site_config SET hero_title = ?').run('Titre <img src=x onerror="window.__xss=1"><script>window.__xss=2</script>');
  const dialogs = [];
  page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss(); });
  try {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Titre');
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
    expect(await page.locator('h1 img, h1 script').count()).toBe(0);
    expect(dialogs).toEqual([]);
  } finally {
    db.prepare('UPDATE site_config SET hero_title = ?').run(original);
  }
});

test('S6 : la page publique est servie avec une CSP', async ({ request }) => {
  const res = await request.get('/');
  expect(res.headers()['content-security-policy']).toContain("script-src 'self'");
});
