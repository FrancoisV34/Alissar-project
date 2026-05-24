import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const tarifs = db.prepare(
    'SELECT * FROM tarifs ORDER BY sort_order'
  ).all();
  res.json(tarifs);
});

export default router;
