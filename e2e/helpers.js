import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';
import { TEST_ACCOUNTS } from '../server/seed-test.js';

export { TEST_ACCOUNTS };
/** Accès direct à la base e2e (pour préparer un cas ou vérifier un effet). */
export const e2eDb = () => new Database(path.join(os.tmpdir(), 'alissar-e2e.sqlite'));

export async function login(page, account) {
  const { email, password } = TEST_ACCOUNTS[account];
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mot de passe').fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
}
