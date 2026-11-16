/**
 * Deterministic test dataset (never used in production).
 *
 * Differences with seed.js (production defaults):
 * - known accounts and passwords, one per role and state, to test access control;
 * - fixed, countable content (3 tarifs, 7 horaires…) so tests can assert exact values;
 * - edge cases on purpose: rich text with allowed HTML, an empty optional field,
 *   a day marked "Fermé", a price of 0 €.
 *
 * Usage: DATABASE_PATH=/tmp/test.sqlite node server/seed-test.js
 */
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

/** Accounts created by the test seed (passwords are public test values). */
export const TEST_ACCOUNTS = {
  admin: { email: 'admin@test.local', password: 'Admin-Test-2026!', role: 'admin', must_change_password: 0 },
  praticienne: { email: 'praticienne@test.local', password: 'Praticienne-2026!', role: 'praticien', must_change_password: 0 },
  nouvelle: { email: 'nouvelle@test.local', password: 'Provisoire-2026!', role: 'praticien', must_change_password: 1 },
};

export const TEST_DATA = {
  tarifs: [
    ['Consultation adulte', 60, 'Durée : 45 min à 1 h'],
    ['Consultation nourrisson', 50, null],
    ['Bilan de suivi', 0, 'Offert dans le mois qui suit une consultation'],
  ],
  horaires: [
    ['Lundi', '9h – 19h'], ['Mardi', '9h – 19h'], ['Mercredi', '9h – 12h'], ['Jeudi', '9h – 19h'],
    ['Vendredi', '9h – 18h'], ['Samedi', '9h – 12h'], ['Dimanche', 'Fermé'],
  ],
  formations: [
    ['Diplôme d\'ostéopathe D.O.', 'École supérieure, 5 ans', null],
    ['Ostéopathie périnatale', 'Formation continue', '/assets/grossesse.jpeg'],
  ],
  pec: [
    ['01', 'Femme', 'Santé de la femme', 'Heart'],
    ['02', 'Grossesse', 'Suivi pendant et après la grossesse', 'Sun'],
    ['03', 'Sport', 'Prévention et récupération', 'Star'],
  ],
  faqs: [
    ['Faut-il une ordonnance ?', 'Non, l\'ostéopathe est en <strong>accès direct</strong>.'],
    ['La séance est-elle remboursée ?', 'Par certaines mutuelles.'],
    ['Que faut-il apporter ?', 'Vos examens récents.'],
  ],
};

/**
 * Empties the content and account tables, then inserts the test dataset.
 * Expects the schema to exist (run migrations first).
 * @param {import('better-sqlite3').Database} db
 */
export function seedTest(db) {
  db.transaction(() => {
    db.exec(`DELETE FROM users; DELETE FROM tarifs; DELETE FROM horaires; DELETE FROM formations;
             DELETE FROM pec_bubbles; DELETE FROM faqs; DELETE FROM external_links; DELETE FROM site_config;`);

    // Coût bcrypt réduit (4) : uniquement pour accélérer les tests.
    const insertUser = db.prepare('INSERT INTO users (email, password_hash, role, prenom, must_change_password) VALUES (?, ?, ?, ?, ?)');
    for (const [key, a] of Object.entries(TEST_ACCOUNTS)) {
      insertUser.run(a.email, bcrypt.hashSync(a.password, 4), a.role, key, a.must_change_password);
    }

    db.prepare(`INSERT INTO site_config (id, site_name, practitioner_name, profession, phone, email, address,
      hero_title, hero_subtitle, about_text, palette, font_title, hero_variant, dark_mode,
      show_formations, show_reviews, show_faq, canonical_base_url, meta_title)
      VALUES (1, 'Cabinet de test', 'Alice Test', 'Ostéopathe D.O.', '04 00 00 00 00', 'contact@test.local',
      '1 rue du Test, 34740 Vendargues', 'L''ostéopathie, <em>à votre rythme.</em>', 'Sous-titre de test',
      'Texte de présentation.', 'coral-cream', 'Instrument Serif', 'fullbleed', 0, 1, 1, 1,
      'https://cabinet.test', 'Cabinet de test')`).run();

    const ins = (sql, rows) => { const st = db.prepare(sql); rows.forEach((r, i) => st.run(...r, i + 1)); };
    ins('INSERT INTO tarifs (prestation, prix, texte, sort_order) VALUES (?, ?, ?, ?)', TEST_DATA.tarifs);
    ins('INSERT INTO horaires (jour, horaires, sort_order) VALUES (?, ?, ?)', TEST_DATA.horaires);
    ins('INSERT INTO formations (title, description, image, sort_order) VALUES (?, ?, ?, ?)', TEST_DATA.formations);
    ins('INSERT INTO pec_bubbles (num, title, description, icon, sort_order) VALUES (?, ?, ?, ?, ?)', TEST_DATA.pec);
    ins('INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)', TEST_DATA.faqs);
    db.prepare("INSERT INTO external_links (type, url, label, sort_order) VALUES ('booking', 'https://www.doctolib.fr/test', 'Doctolib', 1)").run();
  })();
}

// CLI : node server/seed-test.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { default: db, DB_PATH } = await import('./db.js');
  const { migrate } = await import('./lib/migrate.js');
  migrate(db);
  seedTest(db);
  console.log(`[seed-test] Jeu d'essai chargé dans ${DB_PATH}`);
  for (const t of ['users', 'tarifs', 'horaires', 'formations', 'pec_bubbles', 'faqs', 'external_links']) {
    console.log(`  ${t.padEnd(15)} ${db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n} ligne(s)`);
  }
}
