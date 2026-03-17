import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  // Read from site_config as primary source
  const config = db.prepare('SELECT * FROM site_config WHERE id = 1').get();
  const bookingLink = db.prepare("SELECT url FROM external_links WHERE type = 'booking' ORDER BY sort_order LIMIT 1").get();

  if (config) {
    const contact = {
      phone: config.phone,
      address: config.address,
      doctolib_url: bookingLink?.url ?? 'https://www.doctolib.fr',
    };
    const avis = {
      note: config.avis_note,
      nb_avis: config.avis_count,
    };
    res.json({ contact, avis });
  } else {
    // Fallback to legacy tables
    const contact = db.prepare('SELECT * FROM contact_info WHERE id = 1').get();
    const avis = db.prepare('SELECT * FROM avis_summary WHERE id = 1').get();
    res.json({ contact, avis });
  }
});

export default router;
