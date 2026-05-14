import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const items = db.prepare('SELECT * FROM faqs ORDER BY sort_order, id').all();
  res.json(items);
});

export default router;
