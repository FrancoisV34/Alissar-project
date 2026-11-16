/**
 * Restores the SQLite database from a backup produced by db-backup.js.
 *
 * Safety steps:
 * 1. the backup is opened read-only and must pass `PRAGMA integrity_check`;
 * 2. the current database is first saved as `<db>.avant-restauration-<date>`
 *    (the restore itself can be undone);
 * 3. the `-wal` / `-shm` files of the current database are removed, otherwise
 *    SQLite would replay old journal pages on top of the restored file.
 *
 * THE SERVER MUST BE STOPPED during a restore (see DEPLOY.md).
 *
 * Usage: node server/scripts/db-restore.js <backup-file> [--yes]
 */
import Database from 'better-sqlite3';
import fs from 'fs';

const [backup, confirm] = process.argv.slice(2);
const target = process.env.DATABASE_PATH;

if (!backup || !target) {
  console.error('Usage : DATABASE_PATH=<base> node server/scripts/db-restore.js <sauvegarde.sqlite> --yes');
  process.exit(2);
}
// eslint-disable-next-line security/detect-non-literal-fs-filename -- argument de l'opérateur
if (!fs.existsSync(backup)) {
  console.error(`[restore] Sauvegarde introuvable : ${backup}`);
  process.exit(2);
}

let integrity;
let migration;
try {
  const check = new Database(backup, { readonly: true, fileMustExist: true });
  integrity = check.pragma('integrity_check', { simple: true });
  migration = check.prepare('SELECT MAX(version) AS v FROM schema_migrations').get().v;
  check.close();
} catch (err) {
  integrity = err.message; // fichier illisible : pas une base SQLite valide
}
if (integrity !== 'ok') {
  console.error(`[restore] Sauvegarde corrompue (${integrity}) : restauration annulée.`);
  process.exit(1);
}
console.log(`[restore] Sauvegarde valide : intégrité=ok, schéma v${migration}`);

if (confirm !== '--yes') {
  console.log(`[restore] Simulation. Relancer avec --yes pour remplacer ${target} (serveur arrêté).`);
  process.exit(0);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
/* eslint-disable security/detect-non-literal-fs-filename -- chemins de configuration */
if (fs.existsSync(target)) {
  const live = new Database(target);
  live.pragma('wal_checkpoint(TRUNCATE)'); // intègre le journal avant de mettre la base de côté
  live.close();
  fs.copyFileSync(target, `${target}.avant-restauration-${stamp}`);
  console.log(`[restore] Base actuelle conservée : ${target}.avant-restauration-${stamp}`);
}
for (const suffix of ['-wal', '-shm']) fs.rmSync(target + suffix, { force: true });
fs.copyFileSync(backup, target);
/* eslint-enable security/detect-non-literal-fs-filename */
console.log(`[restore] ${backup} → ${target} : terminé. Redémarrer le serveur.`);
