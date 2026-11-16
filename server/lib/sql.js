/**
 * Builds a parameterised `UPDATE` statement from a request body.
 *
 * Only columns listed in `allowedColumns` can be written: column names never
 * come from user input, and every value is bound as a parameter, so the query
 * is safe against SQL injection.
 *
 * @param {string} table - Table name (hard-coded by the caller).
 * @param {readonly string[]} allowedColumns - White-list of writable columns.
 * @param {Record<string, unknown>} body - Validated request body.
 * @returns {{ sql: string, values: unknown[] } | null} `null` when nothing to update.
 */
export function buildUpdate(table, allowedColumns, body) {
  const columns = allowedColumns.filter((col) => Object.hasOwn(body, col) && body[col] !== undefined); // eslint-disable-line security/detect-object-injection -- col vient de la liste blanche
  if (columns.length === 0) return null;
  return {
    sql: `UPDATE ${table} SET ${columns.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
    values: columns.map((c) => body[c]), // eslint-disable-line security/detect-object-injection -- idem
  };
}
