import { test, expect } from '@playwright/test';
import { login, e2eDb, TEST_ACCOUNTS } from './helpers.js';

test.describe('Parcours praticienne', () => {
  test('US-10 : mauvais mot de passe → message générique', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(TEST_ACCOUNTS.praticienne.email);
    await page.getByLabel('Mot de passe').fill('mauvais');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByText('Identifiants invalides')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('US-11 : un mot de passe provisoire doit être changé avant tout accès', async ({ page }) => {
    await login(page, 'nouvelle');
    await expect(page).toHaveURL(/\/change-password$/);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/change-password$/);

    await page.getByLabel('Mot de passe actuel').fill(TEST_ACCOUNTS.nouvelle.password);
    await page.getByLabel(/^Nouveau mot de passe/).fill('court');
    await page.getByLabel('Confirmer le nouveau mot de passe').fill('court');
    await page.getByRole('button', { name: /Valider|Changer|Enregistrer/ }).click();
    await expect(page.getByText(/au moins 12 caractères/)).toBeVisible();

    await page.getByLabel(/^Nouveau mot de passe/).fill('Mon-nouveau-mdp-2026');
    await page.getByLabel('Confirmer le nouveau mot de passe').fill('Mon-nouveau-mdp-2026');
    await page.getByRole('button', { name: /Valider|Changer|Enregistrer/ }).click();
    await expect(page).not.toHaveURL(/change-password/);
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Dashboard Admin' })).toBeVisible();
  });

  test('US-12 : modifier un horaire dans l\'administration le met à jour sur le site', async ({ page }) => {
    await login(page, 'praticienne');
    await expect(page).toHaveURL(/\/admin$/);
    await page.getByRole('tab', { name: 'Horaires' }).click();
    await page.getByRole('row', { name: /Lundi/ }).getByRole('button', { name: 'Modifier' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Horaires').fill('8h – 20h');
    await dialog.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(dialog).toBeHidden();

    await page.goto('/');
    await expect(page.locator('.hours-row').first()).toContainText('8h – 20h');
    e2eDb().prepare("UPDATE horaires SET horaires = '9h – 19h' WHERE jour = 'Lundi'").run();
  });

  test('US-21 : l\'onglet Utilisateurs est réservé à l\'administrateur', async ({ page }) => {
    await login(page, 'praticienne');
    await expect(page.getByRole('tab', { name: 'Horaires' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Utilisateurs' })).toHaveCount(0);
  });
});
