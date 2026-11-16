import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { buildUpdate } from './sql.js';
import { schemas, validate } from './validation.js';

/**
 * Builds the admin CRUD router of an ordered content table
 * (tarifs, horaires, formations, faqs, pec_bubbles, external_links).
 *
 * Every route is protected by JWT + role, every body is validated by a Zod
 * schema, and every query is parameterised. Column names only come from the
 * schema keys, never from the request.
 *
 * @param {object} options
 * @param {string} options.table - SQL table (hard-coded).
 * @param {import('zod').ZodObject} options.schema - schema of a full item.
 * @param {string} options.notFoundMessage - 404 message.
 * @returns {import('express').Router}
 */
export function crudRouter({ table, schema, notFoundMessage }) {
  const router = Router();
  router.use(authenticate, requireRole('admin', 'praticien'));

  const columns = Object.keys(schema.shape);
  const idParam = validate(schemas.idParam, 'params');
  const findById = db.prepare(`SELECT * FROM ${table} WHERE id = ?`);

  // GET / : list, in display order
  router.get('/', (_req, res) => {
    res.json(db.prepare(`SELECT * FROM ${table} ORDER BY sort_order, id`).all());
  });

  // POST / : create, appended at the end unless sort_order is given
  router.post('/', validate(schema), (req, res) => {
    const item = { ...req.body };
    if (item.sort_order === undefined) {
      item.sort_order = (db.prepare(`SELECT MAX(sort_order) AS m FROM ${table}`).get().m ?? 0) + 1;
    }
    const cols = [...new Set([...columns, 'sort_order'])];
    const result = db
      .prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`)
      .run(...cols.map((c) => item[c] ?? null)); // eslint-disable-line security/detect-object-injection -- c vient du schéma
    res.status(201).json(findById.get(result.lastInsertRowid));
  });

  // PUT /:id : partial update
  router.put('/:id', idParam, validate(schema.partial()), (req, res) => {
    const { id } = req.validParams;
    if (!findById.get(id)) return res.status(404).json({ error: notFoundMessage });
    const update = buildUpdate(table, columns, req.body);
    if (update) db.prepare(update.sql).run(...update.values, id);
    res.json(findById.get(id));
  });

  // DELETE /:id
  router.delete('/:id', idParam, (req, res) => {
    const { changes } = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.validParams.id);
    if (changes === 0) return res.status(404).json({ error: notFoundMessage });
    res.status(204).end();
  });

  return router;
}
