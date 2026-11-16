-- 001 : schéma initial.
-- Reprend exactement le schéma de la production au 16/11/2026 (obtenu par `.schema`),
-- qui était jusque-là créé et modifié au démarrage par du code JavaScript.
-- `IF NOT EXISTS` : sans effet sur la base de production existante, crée tout sur une base neuve.

CREATE TABLE IF NOT EXISTS formations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT,
  image       TEXT,
  sort_order  INTEGER NOT NULL,
  image_alt   TEXT
);

CREATE TABLE IF NOT EXISTS pec_bubbles (
  id          INTEGER PRIMARY KEY,
  title       TEXT    NOT NULL,
  content     TEXT,
  image       TEXT,
  sort_order  INTEGER NOT NULL,
  icon        TEXT,
  num         TEXT,
  description TEXT,
  image_alt   TEXT
);

CREATE TABLE IF NOT EXISTS tarifs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  prestation TEXT    NOT NULL,
  prix       INTEGER NOT NULL,
  texte      TEXT,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS horaires (
  id         INTEGER PRIMARY KEY,
  jour       TEXT    NOT NULL,
  horaires   TEXT    NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS site_config (
  id                    INTEGER PRIMARY KEY DEFAULT 1,
  site_name             TEXT NOT NULL DEFAULT 'Mon Cabinet',
  practitioner_name     TEXT NOT NULL DEFAULT 'Dr. Dupont',
  profession            TEXT NOT NULL DEFAULT 'Praticien',
  phone                 TEXT NOT NULL DEFAULT '01 23 45 67 89',
  email                 TEXT NOT NULL DEFAULT 'contact@moncabinet.fr',
  address               TEXT NOT NULL DEFAULT '1 Rue Exemple, 75001 Paris',
  geo_lat               REAL,
  geo_lng               REAL,
  maps_embed_url        TEXT,
  logo_url              TEXT,
  favicon_url           TEXT,
  theme_color           TEXT DEFAULT '#fa8072',
  meta_description      TEXT,
  copyright_name        TEXT,
  elfsight_widget_id    TEXT,
  avis_note             REAL,
  avis_count            INTEGER,
  palette               TEXT DEFAULT 'coral-cream',
  font_title            TEXT DEFAULT 'Instrument Serif',
  hero_variant          TEXT DEFAULT 'fullbleed',
  dark_mode             INTEGER DEFAULT 0,
  hero_title            TEXT,
  hero_subtitle         TEXT,
  hero_image_url        TEXT,
  about_title           TEXT,
  about_text            TEXT,
  about_quote           TEXT,
  about_image_url       TEXT,
  show_formations       INTEGER DEFAULT 1,
  show_reviews          INTEGER DEFAULT 1,
  show_faq              INTEGER DEFAULT 1,
  meta_title            TEXT,
  meta_title_template   TEXT,
  meta_keywords         TEXT,
  canonical_base_url    TEXT,
  og_image_url          TEXT,
  gsc_verification      TEXT,
  bing_verification     TEXT,
  ga_measurement_id     TEXT,
  google_business_url   TEXT,
  physician_specialties TEXT,
  physician_alumni      TEXT,
  hero_image_alt        TEXT,
  about_image_alt       TEXT,
  og_image_alt          TEXT,
  faq_eyebrow           TEXT,
  faq_title             TEXT,
  faq_lede              TEXT
);

CREATE TABLE IF NOT EXISTS external_links (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  type       TEXT    NOT NULL,
  url        TEXT    NOT NULL,
  label      TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  email                TEXT    UNIQUE NOT NULL,
  password_hash        TEXT    NOT NULL,
  role                 TEXT    NOT NULL DEFAULT 'praticien',
  created_at           TEXT    NOT NULL DEFAULT (datetime('now')),
  nom                  TEXT,
  prenom               TEXT,
  telephone            TEXT,
  must_change_password INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS faqs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  question   TEXT    NOT NULL,
  answer     TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Tables d'une ancienne version (espace patient), supprimées du périmètre « vitrine ».
DROP TABLE IF EXISTS consultations;
DROP TABLE IF EXISTS patient_profiles;
DROP TABLE IF EXISTS consult_osteo;
DROP TABLE IF EXISTS section_paragraphs;
DROP TABLE IF EXISTS sections;
DROP TABLE IF EXISTS contact_info;
DROP TABLE IF EXISTS avis_summary;
