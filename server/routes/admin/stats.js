import { Router } from 'express';
import db from '../../db.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin', 'praticien'));

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

// GET /api/admin/stats/revenue?period=year|month|week|day&year=2025&month=3
router.get('/revenue', (req, res) => {
  const { period = 'month', year, month } = req.query;

  let rows;

  // Vue unifiée des deux tables de consultations
  const ALL_CONSULTS = `
    SELECT date, montant FROM consultations WHERE montant IS NOT NULL
    UNION ALL
    SELECT date, montant FROM consult_osteo WHERE montant IS NOT NULL
  `;

  switch (period) {
    case 'year':
      rows = db.prepare(
        `SELECT strftime('%Y', date) AS label, SUM(montant) AS total
         FROM (${ALL_CONSULTS}) GROUP BY label ORDER BY label`
      ).all();
      break;

    case 'month':
      if (!year) return res.status(400).json({ error: 'Paramètre year requis' });
      rows = db.prepare(
        `SELECT CAST(strftime('%m', date) AS INTEGER) AS num, SUM(montant) AS total
         FROM (${ALL_CONSULTS}) WHERE strftime('%Y', date) = ? GROUP BY num ORDER BY num`
      ).all(year);
      // Map to full 12 months with labels
      rows = Array.from({ length: 12 }, (_, i) => {
        const found = rows.find(r => r.num === i + 1);
        return { label: MONTH_LABELS[i], total: found ? found.total : 0 };
      });
      break;

    case 'week':
      if (!year) return res.status(400).json({ error: 'Paramètre year requis' });
      rows = db.prepare(
        `SELECT CAST(strftime('%W', date) AS INTEGER) AS num, SUM(montant) AS total
         FROM (${ALL_CONSULTS}) WHERE strftime('%Y', date) = ? GROUP BY num ORDER BY num`
      ).all(year);
      rows = rows.map(r => ({ label: `S${r.num}`, total: r.total }));
      break;

    case 'day':
      if (!year || !month) return res.status(400).json({ error: 'Paramètres year et month requis' });
      const mm = month.padStart(2, '0');
      rows = db.prepare(
        `SELECT CAST(strftime('%d', date) AS INTEGER) AS num, SUM(montant) AS total
         FROM (${ALL_CONSULTS}) WHERE strftime('%Y', date) = ? AND strftime('%m', date) = ?
         GROUP BY num ORDER BY num`
      ).all(year, mm);
      // Build all days in month
      const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
      rows = Array.from({ length: daysInMonth }, (_, i) => {
        const found = rows.find(r => r.num === i + 1);
        return { label: String(i + 1), total: found ? found.total : 0 };
      });
      break;

    default:
      return res.status(400).json({ error: 'Période invalide (year|month|week|day)' });
  }

  res.json(rows);
});

export default router;
