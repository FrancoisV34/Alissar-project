import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/external-links (public, optional ?type= filter)
router.get('/', (req, res) => {
  const { type } = req.query;
  if (type) {
    const links = db.prepare('SELECT * FROM external_links WHERE type = ? ORDER BY sort_order').all(type);
    res.json(links);
  } else {
    const links = db.prepare('SELECT * FROM external_links ORDER BY sort_order').all();
    res.json(links);
  }
});

export default router;
