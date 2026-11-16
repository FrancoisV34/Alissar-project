import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { login } from './helpers.js';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
// Mesurer après les animations d'apparition : pendant un fondu, l'opacité partielle fausse les contrastes.
const settled = (page) => page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
const audit = async (page) => (await settled(page), await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations
  .map((v) => `${v.id} (${v.nodes.length}) : ${v.help} → ${v.nodes.map((n) => n.target.join(' ') + ' ' + (n.any[0]?.message ?? '').slice(0, 120)).join(' | ')}`);

test.describe('US-08 : accessibilité WCAG 2.1 AA (axe-core)', () => {
  test('les animations sont désactivées si l\'utilisateur le demande (RGAA 13.8)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    expect(running).toBe(0);
  });

  test('accueil', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await audit(page)).toEqual([]);
  });

  test('connexion', async ({ page }) => {
    await page.goto('/login');
    expect(await audit(page)).toEqual([]);
  });

  test('administration (onglets principaux)', async ({ page }) => {
    await login(page, 'admin');
    await expect(page).toHaveURL(/\/admin$/);
    for (const tab of ['Personnalisation', 'Tarifs', 'Horaires', 'SEO', 'Utilisateurs']) {
      await page.getByRole('tab', { name: tab }).click();
      expect(await audit(page), `onglet ${tab}`).toEqual([]);
    }
  });
});
