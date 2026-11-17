/**
 * Serveur des tests de bout en bout : le build de production (dist/) servi par
 * l'application réelle, sur une base temporaire remplie avec le jeu d'essai.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';

export const E2E_DB = path.join(os.tmpdir(), 'alissar-e2e.sqlite');
for (const f of [E2E_DB, `${E2E_DB}-wal`, `${E2E_DB}-shm`]) fs.rmSync(f, { force: true });

process.env.NODE_ENV = 'production';
process.env.DATABASE_PATH = E2E_DB;
process.env.UPLOADS_PATH = path.join(os.tmpdir(), 'alissar-e2e-uploads');
process.env.JWT_SECRET ??= 'secret-e2e-uniquement-0123456789abcdef';

if (!fs.existsSync('dist/index.html')) {
  console.error('dist/ absent : lancez « npm run build » avant les tests e2e.');
  process.exit(1);
}

const { default: db } = await import('../server/db.js');
const { migrate } = await import('../server/lib/migrate.js');
const { seedTest } = await import('../server/seed-test.js');
const { createApp } = await import('../server/app.js');

migrate(db, { log: () => {} });
seedTest(db);
const port = Number(process.env.E2E_PORT ?? 4173);
createApp({ serveFrontend: true }).listen(port, '127.0.0.1', () => console.log(`[e2e] http://127.0.0.1:${port}`));
