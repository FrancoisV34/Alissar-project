import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/site-config (public)
router.get('/', (_req, res) => {
  const config = db.prepare('SELECT * FROM site_config WHERE id = 1').get();
  res.json(config ?? null);
});

export default router;
