import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../../../public/uploads');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

function toIdlink(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function deleteImage(filename) {
  if (!filename) return;
  fs.unlink(path.join(UPLOADS_DIR, filename), () => {});
}

const router = Router();
router.use(authenticate, requireRole('admin', 'alissar'));

// GET /api/admin/sections
router.get('/', (_req, res) => {
  const sections = db.prepare('SELECT * FROM sections ORDER BY sort_order').all();
  const paragraphs = db.prepare('SELECT * FROM section_paragraphs ORDER BY sort_order').all();
  const result = sections.map((s) => ({
    ...s,
    paragraphs: paragraphs.filter((p) => p.section_id === s.id),
  }));
  res.json(result);
});

// POST /api/admin/sections
router.post('/', upload.single('image'), (req, res) => {
  const { title, sort_order } = req.body;
  if (!title) return res.status(400).json({ error: 'title requis' });
  const idlink = toIdlink(title);
  const image = req.file ? req.file.filename : null;
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM sections').get();
  const order = sort_order != null ? Number(sort_order) : (maxOrder.max ?? 0) + 1;
  const result = db
    .prepare('INSERT INTO sections (title, idlink, image, sort_order) VALUES (?, ?, ?, ?)')
    .run(title, idlink, image, order);
  const section = db.prepare('SELECT * FROM sections WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...section, paragraphs: [] });
});

// PUT /api/admin/sections/:id
router.put('/:id', upload.single('image'), (req, res) => {
  const existing = db.prepare('SELECT * FROM sections WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Section non trouvée' });

  const title = req.body.title ?? existing.title;
  const idlink = toIdlink(title);
  const sort_order = req.body.sort_order != null ? Number(req.body.sort_order) : existing.sort_order;

  let image = existing.image;
  if (req.file) {
    deleteImage(existing.image);
    image = req.file.filename;
  }

  db.prepare('UPDATE sections SET title = ?, idlink = ?, image = ?, sort_order = ? WHERE id = ?').run(
    title, idlink, image, sort_order, req.params.id
  );
  const updated = db.prepare('SELECT * FROM sections WHERE id = ?').get(req.params.id);
  const paragraphs = db.prepare('SELECT * FROM section_paragraphs WHERE section_id = ? ORDER BY sort_order').all(req.params.id);
  res.json({ ...updated, paragraphs });
});

// DELETE /api/admin/sections/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM sections WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Section non trouvée' });
  db.prepare('DELETE FROM section_paragraphs WHERE section_id = ?').run(req.params.id);
  db.prepare('DELETE FROM sections WHERE id = ?').run(req.params.id);
  deleteImage(existing.image);
  res.status(204).end();
});

// POST /api/admin/sections/:id/paragraphs
router.post('/:id/paragraphs', (req, res) => {
  const { text, sort_order } = req.body;
  if (!text) return res.status(400).json({ error: 'text requis' });
  const section = db.prepare('SELECT id FROM sections WHERE id = ?').get(req.params.id);
  if (!section) return res.status(404).json({ error: 'Section non trouvée' });
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM section_paragraphs WHERE section_id = ?').get(req.params.id);
  const order = sort_order != null ? Number(sort_order) : (maxOrder.max ?? 0) + 1;
  const result = db
    .prepare('INSERT INTO section_paragraphs (section_id, sort_order, text) VALUES (?, ?, ?)')
    .run(req.params.id, order, text);
  const paragraph = db.prepare('SELECT * FROM section_paragraphs WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(paragraph);
});

// PUT /api/admin/sections/:id/paragraphs/:pid
router.put('/:id/paragraphs/:pid', (req, res) => {
  const existing = db.prepare('SELECT * FROM section_paragraphs WHERE id = ? AND section_id = ?').get(req.params.pid, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Paragraphe non trouvé' });
  const text = req.body.text ?? existing.text;
  const sort_order = req.body.sort_order != null ? Number(req.body.sort_order) : existing.sort_order;
  db.prepare('UPDATE section_paragraphs SET text = ?, sort_order = ? WHERE id = ?').run(text, sort_order, req.params.pid);
  const updated = db.prepare('SELECT * FROM section_paragraphs WHERE id = ?').get(req.params.pid);
  res.json(updated);
});

// DELETE /api/admin/sections/:id/paragraphs/:pid
router.delete('/:id/paragraphs/:pid', (req, res) => {
  const existing = db.prepare('SELECT id FROM section_paragraphs WHERE id = ? AND section_id = ?').get(req.params.pid, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Paragraphe non trouvé' });
  db.prepare('DELETE FROM section_paragraphs WHERE id = ?').run(req.params.pid);
  res.status(204).end();
});

export default router;
