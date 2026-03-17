import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'database.sqlite');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    idlink TEXT,
    image TEXT,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS section_paragraphs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id INTEGER REFERENCES sections(id),
    sort_order INTEGER NOT NULL,
    text TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS formations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pec_bubbles (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    image TEXT,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tarifs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prestation TEXT NOT NULL,
    prix INTEGER NOT NULL,
    texte TEXT,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS horaires (
    id INTEGER PRIMARY KEY,
    jour TEXT NOT NULL,
    horaires TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contact_info (
    id INTEGER PRIMARY KEY DEFAULT 1,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    doctolib_url TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS avis_summary (
    id INTEGER PRIMARY KEY DEFAULT 1,
    note REAL NOT NULL,
    nb_avis INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    site_name TEXT NOT NULL DEFAULT 'Mon Cabinet',
    practitioner_name TEXT NOT NULL DEFAULT 'Dr. Dupont',
    profession TEXT NOT NULL DEFAULT 'Praticien',
    phone TEXT NOT NULL DEFAULT '01 23 45 67 89',
    email TEXT NOT NULL DEFAULT 'contact@moncabinet.fr',
    address TEXT NOT NULL DEFAULT '1 Rue Exemple, 75001 Paris',
    geo_lat REAL,
    geo_lng REAL,
    maps_embed_url TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    theme_color TEXT DEFAULT '#fa8072',
    meta_description TEXT,
    copyright_name TEXT,
    elfsight_widget_id TEXT,
    avis_note REAL,
    avis_count INTEGER
  );

  CREATE TABLE IF NOT EXISTS external_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    label TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'patient',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    patient_nom TEXT,
    prestation TEXT NOT NULL,
    montant REAL NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS patient_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_naissance TEXT,
    sexe TEXT,
    adresse TEXT,
    medecin_traitant TEXT,
    antecedents_medicaux TEXT
  );

  CREATE TABLE IF NOT EXISTS consult_osteo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    motif TEXT,
    anamnese TEXT,
    antecedents TEXT,
    examen_clinique TEXT,
    tests_osteo TEXT,
    traitement TEXT,
    conseils TEXT,
    montant REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const cols = db.pragma('table_info(users)').map(c => c.name);
if (!cols.includes('nom'))                  db.exec('ALTER TABLE users ADD COLUMN nom TEXT');
if (!cols.includes('prenom'))               db.exec('ALTER TABLE users ADD COLUMN prenom TEXT');
if (!cols.includes('telephone'))            db.exec('ALTER TABLE users ADD COLUMN telephone TEXT');
if (!cols.includes('must_change_password')) db.exec('ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0');

// Migrate legacy role 'alissar' → 'praticien'
db.exec("UPDATE users SET role = 'praticien' WHERE role = 'alissar'");

export default db;
