import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const sections = db.prepare(
    'SELECT * FROM sections ORDER BY sort_order'
  ).all();

  const result = sections.map((section) => {
    const paragraphs = db.prepare(
      'SELECT text FROM section_paragraphs WHERE section_id = ? ORDER BY sort_order'
    ).all(section.id);
    return { ...section, paragraphs: paragraphs.map((p) => p.text) };
  });

  res.json(result);
});

export default router;
