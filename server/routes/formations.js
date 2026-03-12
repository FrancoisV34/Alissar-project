import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const formations = db.prepare(
    'SELECT * FROM formations ORDER BY sort_order'
  ).all();
  res.json(formations);
});

export default router;
