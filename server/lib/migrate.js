import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const MIGRATIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../migrations');

/**
 * Applies the pending SQL migrations of `server/migrations/` in order.
 *
 * - Files are named `NNN-description.sql` and applied in numeric order.
 * - Each migration runs in its own transaction: it is either fully applied or
 *   not at all, and the server does not start on failure.
 * - Applied migrations are recorded in `schema_migrations` with a SHA-256
 *   checksum: editing a migration that already ran is detected and refused
 *   (a new migration must be written instead).
 *
 * @param {import('better-sqlite3').Database} db
 * @param {{ dir?: string, log?: (msg: string) => void }} [options]
 * @returns {string[]} versions applied during this call
 */
export function migrate(db, { dir = MIGRATIONS_DIR, log = console.log } = {}) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version    TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    checksum   TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  const applied = new Map(db.prepare('SELECT version, checksum FROM schema_migrations').all().map((r) => [r.version, r.checksum]));
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- dossier du projet
  const files = fs.readdirSync(dir).filter((f) => /^\d{3}-[\w-]+\.sql$/.test(f)).sort();
  const done = [];

  for (const file of files) {
    const version = file.slice(0, 3);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- fichier du dossier migrations
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    const checksum = crypto.createHash('sha256').update(sql).digest('hex');

    if (applied.has(version)) {
      if (applied.get(version) !== checksum) {
        throw new Error(`Migration ${file} modifiée après application : écrivez une nouvelle migration.`);
      }
      continue;
    }

    db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (version, name, checksum) VALUES (?, ?, ?)').run(version, file, checksum);
    })();
    log(`[migrate] ${file} appliquée`);
    done.push(version);
  }
  return done;
}
