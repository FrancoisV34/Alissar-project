import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Database file. On Fly.io: `/data/database.sqlite` on a persistent volume. */
export const DB_PATH = process.env.DATABASE_PATH || join(__dirname, 'database.sqlite');

if (DB_PATH !== ':memory:') {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- chemin issu de la configuration
  fs.mkdirSync(dirname(DB_PATH), { recursive: true });
}

const db = new Database(DB_PATH);

// WAL: readers do not block the writer; busy_timeout: wait instead of failing on a lock.
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
db.pragma('foreign_keys = ON');

// The schema is created and evolved by the versioned migrations (server/migrations),
// applied by bootstrap() at start-up — see lib/migrate.js.

export default db;
