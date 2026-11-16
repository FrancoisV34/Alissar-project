/**
 * Hot backup of the SQLite database (the server can keep running).
 *
 * Uses SQLite's online backup API (better-sqlite3 `db.backup`): a plain file
 * copy is NOT safe with WAL mode, recent writes live in the `-wal` file.
 * The backup is checked with `PRAGMA integrity_check`, then old backups are
 * pruned (BACKUP_KEEP, default 14).
 *
 * Usage: node server/scripts/db-backup.js [destination-directory]
 * Env:   DATABASE_PATH, BACKUP_DIR (default: <database dir>/backups), BACKUP_KEEP
 */
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import db, { DB_PATH } from '../db.js';

const dir = process.argv[2] || process.env.BACKUP_DIR || path.join(path.dirname(DB_PATH), 'backups');
const keep = Number(process.env.BACKUP_KEEP ?? 14);

// eslint-disable-next-line security/detect-non-literal-fs-filename -- dossier de configuration
fs.mkdirSync(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const file = path.join(dir, `database-${stamp}.sqlite`);

await db.backup(file);

const check = new Database(file, { readonly: true });
const integrity = check.pragma('integrity_check', { simple: true });
const counts = ['users', 'site_config', 'tarifs', 'horaires', 'faqs']
  .map((t) => `${t}=${check.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n}`).join(' ');
const migration = check.prepare('SELECT MAX(version) AS v FROM schema_migrations').get().v;
check.close();

if (integrity !== 'ok') {
  console.error(`[backup] ÉCHEC : intégrité « ${integrity} » pour ${file}`);
  process.exit(1);
}
// eslint-disable-next-line security/detect-non-literal-fs-filename -- fichier créé ci-dessus
const size = (fs.statSync(file).size / 1024).toFixed(0);
console.log(`[backup] ${file} (${size} Kio) intégrité=ok schéma=v${migration} ${counts}`);

// Rotation : garder les `keep` sauvegardes les plus récentes.
// eslint-disable-next-line security/detect-non-literal-fs-filename -- dossier de configuration
const all = fs.readdirSync(dir).filter((f) => /^database-.*\.sqlite$/.test(f)).sort();
for (const old of all.slice(0, Math.max(0, all.length - keep))) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- fichier du dossier de sauvegarde
  fs.unlinkSync(path.join(dir, old));
  console.log(`[backup] rotation : ${old} supprimée`);
}
