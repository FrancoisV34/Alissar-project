import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const bubbles = db.prepare(
    'SELECT * FROM pec_bubbles ORDER BY sort_order'
  ).all();
  res.json(bubbles);
});

export default router;
