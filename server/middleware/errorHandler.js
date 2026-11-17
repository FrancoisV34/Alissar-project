import multer from 'multer';

/**
 * Last middleware of the chain. Turns every error into a JSON response and
 * never leaks a stack trace or an internal message to the client: details are
 * only written to the server log.
 */
export function errorHandler(err, req, res, _next) {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Fichier trop volumineux (8 Mo maximum)' : 'Envoi de fichier invalide';
    return res.status(400).json({ error: message });
  }
  if (err.status === 400 && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON invalide' });
  }
  if (err.status === 413) {
    return res.status(413).json({ error: 'Requête trop volumineuse' });
  }
  if (err.expose && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
}

/** JSON 404 for unknown API routes (instead of Express' HTML page). */
export function notFound(_req, res) {
  res.status(404).json({ error: 'Ressource introuvable' });
}
