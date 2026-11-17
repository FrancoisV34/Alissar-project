import { test, expect } from '@playwright/test';

test.describe('Parcours visiteur', () => {
  test('US-01 : présentation et spécialités', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('à votre rythme.');
    await expect(page.locator('h1 em')).toHaveText('à votre rythme.');
    await expect(page.locator('.spec-card')).toHaveCount(3);
    await expect(page).toHaveTitle(/Cabinet de test/);
  });

  test('US-02 : prendre rendez-vous ouvre Doctolib dans un nouvel onglet', async ({ page }) => {
    await page.goto('/');
    const rdv = page.locator('.topbar').getByRole('link', { name: /Prendre RDV/ });
    await expect(rdv).toHaveAttribute('href', 'https://www.doctolib.fr/test');
    await expect(rdv).toHaveAttribute('target', '_blank');
    await expect(rdv).toHaveAttribute('rel', /noopener/);
  });

  test('US-04 : horaires, tarifs et adresse', async ({ page }) => {
    await page.goto('/');
    await page.locator('#pratique').scrollIntoViewIfNeeded();
    await expect(page.locator('.tarif-row')).toHaveCount(3);
    await expect(page.locator('.tarif-row').first()).toContainText('Consultation adulte');
    await expect(page.locator('.tarif-row').first().locator('.price')).toContainText('60');
    await expect(page.locator('.hours-row')).toHaveCount(7);
    await expect(page.locator('.hours-row').last()).toContainText('Fermé');
    await expect(page.locator('#pratique')).toContainText('Vendargues');
  });

  test('US-03 @mobile : sur mobile, la barre du haut garde Appeler et Prendre RDV', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-desktop')).toBeHidden();
    await expect(page.locator('.topbar').getByRole('link', { name: 'Téléphone' })).toHaveAttribute('href', 'tel:0400000000');
    await expect(page.locator('.topbar').getByRole('link', { name: /Prendre RDV/ })).toBeVisible();
    await page.mouse.wheel(0, 3000);
    await expect(page.locator('.topbar')).toBeInViewport();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('pages techniques : robots.txt et sitemap.xml', async ({ request }) => {
    expect((await request.get('/robots.txt')).status()).toBe(200);
    expect(await (await request.get('/sitemap.xml')).text()).toContain('https://cabinet.test/');
  });
});
