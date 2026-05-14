import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DATABASE_PATH || join(__dirname, 'database.sqlite');

// Ensure parent dir exists (utile quand DATABASE_PATH pointe vers un volume monté)
fs.mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
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
    role TEXT NOT NULL DEFAULT 'praticien',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
`);

// Drop legacy tables hors scope vitrine
db.exec(`
  DROP TABLE IF EXISTS consultations;
  DROP TABLE IF EXISTS patient_profiles;
  DROP TABLE IF EXISTS consult_osteo;
  DROP TABLE IF EXISTS section_paragraphs;
  DROP TABLE IF EXISTS sections;
  DROP TABLE IF EXISTS contact_info;
  DROP TABLE IF EXISTS avis_summary;
`);

// --- Migrations idempotentes ---
const userCols = db.pragma('table_info(users)').map((c) => c.name);
if (!userCols.includes('nom'))                  db.exec('ALTER TABLE users ADD COLUMN nom TEXT');
if (!userCols.includes('prenom'))               db.exec('ALTER TABLE users ADD COLUMN prenom TEXT');
if (!userCols.includes('telephone'))            db.exec('ALTER TABLE users ADD COLUMN telephone TEXT');
if (!userCols.includes('must_change_password')) db.exec('ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0');

db.exec("UPDATE users SET role = 'praticien' WHERE role = 'alissar'");

const siteCfgCols = db.pragma('table_info(site_config)').map((c) => c.name);
const addSiteCol = (name, def) => {
  if (!siteCfgCols.includes(name)) db.exec(`ALTER TABLE site_config ADD COLUMN ${name} ${def}`);
};
addSiteCol('palette',          "TEXT DEFAULT 'coral-cream'");
addSiteCol('font_title',       "TEXT DEFAULT 'Instrument Serif'");
addSiteCol('hero_variant',     "TEXT DEFAULT 'fullbleed'");
addSiteCol('dark_mode',        'INTEGER DEFAULT 0');
addSiteCol('hero_title',       'TEXT');
addSiteCol('hero_subtitle',    'TEXT');
addSiteCol('hero_image_url',   'TEXT');
addSiteCol('about_title',      'TEXT');
addSiteCol('about_text',       'TEXT');
addSiteCol('about_quote',      'TEXT');
addSiteCol('about_image_url',  'TEXT');
addSiteCol('show_formations',  'INTEGER DEFAULT 1');
addSiteCol('show_reviews',     'INTEGER DEFAULT 1');
addSiteCol('show_faq',         'INTEGER DEFAULT 1');

// SEO fields
addSiteCol('meta_title',           'TEXT');
addSiteCol('meta_title_template',  'TEXT');
addSiteCol('meta_keywords',        'TEXT');
addSiteCol('canonical_base_url',   'TEXT');
addSiteCol('og_image_url',         'TEXT');
addSiteCol('gsc_verification',     'TEXT');
addSiteCol('bing_verification',    'TEXT');
addSiteCol('ga_measurement_id',    'TEXT');
addSiteCol('google_business_url',  'TEXT');
addSiteCol('physician_specialties','TEXT');
addSiteCol('physician_alumni',     'TEXT');
addSiteCol('hero_image_alt',       'TEXT');
addSiteCol('about_image_alt',      'TEXT');
addSiteCol('og_image_alt',         'TEXT');

// FAQ section meta
addSiteCol('faq_eyebrow', 'TEXT');
addSiteCol('faq_title',   'TEXT');
addSiteCol('faq_lede',    'TEXT');

const pecCols = db.pragma('table_info(pec_bubbles)').map((c) => c.name);
if (!pecCols.includes('icon'))        db.exec('ALTER TABLE pec_bubbles ADD COLUMN icon TEXT');
if (!pecCols.includes('num'))         db.exec('ALTER TABLE pec_bubbles ADD COLUMN num TEXT');
if (!pecCols.includes('description')) db.exec('ALTER TABLE pec_bubbles ADD COLUMN description TEXT');
if (!pecCols.includes('image_alt'))   db.exec('ALTER TABLE pec_bubbles ADD COLUMN image_alt TEXT');

const formationCols = db.pragma('table_info(formations)').map((c) => c.name);
if (!formationCols.includes('image_alt')) db.exec('ALTER TABLE formations ADD COLUMN image_alt TEXT');

export default db;
