import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import Database from 'better-sqlite3';
import { buildUpdate } from '../lib/sql.js';
import { sanitizeRichText } from '../lib/sanitize.js';
import { schemas } from '../lib/validation.js';
import { detectImageType } from '../routes/admin/upload.js';
import { migrate } from '../lib/migrate.js';
import { PNG_1PX } from '../test/helpers.js';

describe('buildUpdate', () => {
  it('ne garde que les colonnes de la liste blanche', () => {
    const r = buildUpdate('tarifs', ['prestation', 'prix'], { prix: 70, role: 'admin', 'prix = 0; DROP TABLE users; --': 1 });
    expect(r.sql).toBe('UPDATE tarifs SET prix = ? WHERE id = ?');
    expect(r.values).toEqual([70]);
  });
  it('renvoie null s\'il n\'y a rien à modifier', () => {
    expect(buildUpdate('tarifs', ['prix'], { autre: 1 })).toBeNull();
    expect(buildUpdate('tarifs', ['prix'], { prix: undefined })).toBeNull();
  });
});

describe('sanitizeRichText', () => {
  it('conserve les balises autorisées', () => {
    expect(sanitizeRichText('L\'ostéopathie, <em>à votre rythme.</em>')).toBe('L\'ostéopathie, <em>à votre rythme.</em>');
  });
  it('supprime scripts, gestionnaires d\'événements et liens javascript:', () => {
    expect(sanitizeRichText('<script>alert(1)</script>ok')).toBe('ok');
    expect(sanitizeRichText('<img src=x onerror="alert(1)">t')).toBe('t');
    expect(sanitizeRichText('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript');
  });
  it('ajoute rel="noopener noreferrer" aux liens', () => {
    expect(sanitizeRichText('<a href="https://a.fr" target="_blank">a</a>')).toContain('rel="noopener noreferrer"');
  });
  it('laisse passer null et undefined', () => {
    expect(sanitizeRichText(null)).toBeNull();
    expect(sanitizeRichText(undefined)).toBeUndefined();
  });
});

describe('detectImageType (signature binaire)', () => {
  it('reconnaît PNG, JPEG, GIF et WebP', () => {
    expect(detectImageType(PNG_1PX)).toBe('png');
    expect(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, ...Array(12).fill(0)]))).toBe('jpg');
    expect(detectImageType(Buffer.from('GIF89a' + '\0'.repeat(10)))).toBe('gif');
    expect(detectImageType(Buffer.from('RIFF\0\0\0\0WEBPVP8 '))).toBe('webp');
  });
  it('refuse SVG, HTML et fichiers trop courts', () => {
    expect(detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>'))).toBeNull();
    expect(detectImageType(Buffer.from('<html><script>alert(1)</script>'))).toBeNull();
    expect(detectImageType(Buffer.from([0x89, 0x50]))).toBeNull();
  });
});

describe('schémas de validation', () => {
  it('refuse un mot de passe de moins de 12 caractères', () => {
    expect(schemas.changePassword.safeParse({ currentPassword: 'x', newPassword: 'court' }).success).toBe(false);
    expect(schemas.changePassword.safeParse({ currentPassword: 'x', newPassword: 'suffisamment-long' }).success).toBe(true);
  });
  it('n\'autorise que le rôle praticien à la création', () => {
    const base = { email: 'a@b.fr', password: 'mot-de-passe-long' };
    expect(schemas.userCreate.parse(base).role).toBe('praticien');
    expect(schemas.userCreate.safeParse({ ...base, role: 'admin' }).success).toBe(false);
  });
  it('n\'accepte que des URL http(s)', () => {
    const l = (url) => schemas.externalLink.safeParse({ type: 'booking', url }).success;
    expect(l('https://www.doctolib.fr/x')).toBe(true);
    expect(l('javascript:alert(1)')).toBe(false);
    expect(l('data:text/html,<script>')).toBe(false);
    expect(l('pas une url')).toBe(false);
  });
  it('valide les chemins d\'image sans remontée de dossier', () => {
    const f = (image) => schemas.formation.safeParse({ title: 't', image }).success;
    expect(f('/uploads/a.jpg')).toBe(true);
    expect(f('/favicon.png')).toBe(true);
    expect(f('/uploads/../server/database.sqlite')).toBe(false);
  });
  it('n\'accepte que 0 ou 1 pour les interrupteurs et une variante connue', () => {
    expect(schemas.siteConfig.safeParse({ dark_mode: true }).success).toBe(false);
    expect(schemas.siteConfig.safeParse({ dark_mode: 1, hero_variant: 'split' }).success).toBe(true);
    expect(schemas.siteConfig.safeParse({ hero_variant: 'autre' }).success).toBe(false);
  });
  it('assainit le HTML des champs riches pendant la validation', () => {
    expect(schemas.siteConfig.parse({ hero_title: 'T<script>x</script>' }).hero_title).toBe('T');
  });
});

describe('migrate', () => {
  const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'migr-'));

  it('applique les migrations dans l\'ordre, une seule fois', () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, '001-a.sql'), 'CREATE TABLE a (id INTEGER);');
    fs.writeFileSync(path.join(dir, '002-b.sql'), 'ALTER TABLE a ADD COLUMN b TEXT;');
    const db = new Database(':memory:');
    expect(migrate(db, { dir, log: () => {} })).toEqual(['001', '002']);
    expect(migrate(db, { dir, log: () => {} })).toEqual([]);
    expect(db.pragma('table_info(a)').map((c) => c.name)).toEqual(['id', 'b']);
  });

  it('annule entièrement une migration en erreur (transaction)', () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, '001-ko.sql'), 'CREATE TABLE ok (id INTEGER); INSERT INTO table_absente VALUES (1);');
    const db = new Database(':memory:');
    expect(() => migrate(db, { dir, log: () => {} })).toThrow(/table_absente/);
    expect(db.prepare("SELECT name FROM sqlite_master WHERE name = 'ok'").get()).toBeUndefined();
    expect(db.prepare('SELECT COUNT(*) AS n FROM schema_migrations').get().n).toBe(0);
  });

  it('refuse une migration modifiée après application', () => {
    const dir = tmp();
    const f = path.join(dir, '001-a.sql');
    fs.writeFileSync(f, 'CREATE TABLE a (id INTEGER);');
    const db = new Database(':memory:');
    migrate(db, { dir, log: () => {} });
    fs.appendFileSync(f, '\n-- modification');
    expect(() => migrate(db, { dir, log: () => {} })).toThrow(/modifiée après application/);
  });
});
