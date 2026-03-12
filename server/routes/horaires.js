import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const horaires = db.prepare(
    'SELECT * FROM horaires ORDER BY sort_order'
  ).all();
  res.json(horaires);
});

export default router;
