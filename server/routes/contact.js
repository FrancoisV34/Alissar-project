import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const contact = db.prepare('SELECT * FROM contact_info WHERE id = 1').get();
  const avis = db.prepare('SELECT * FROM avis_summary WHERE id = 1').get();
  res.json({ contact, avis });
});

export default router;
