import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = process.env.UPLOADS_PATH || path.join(__dirname, '../../../public/uploads');

// eslint-disable-next-line security/detect-non-literal-fs-filename -- chemin issu de la configuration, pas de l'utilisateur
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

/**
 * Accepted image types, identified by their first bytes ("magic numbers").
 * The MIME type sent by the browser is not trusted: a file is only kept if
 * its content really is one of these formats. SVG is refused because it can
 * embed JavaScript.
 */
const SIGNATURES = [
  { ext: 'jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'png', test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: 'gif', test: (b) => b.subarray(0, 4).toString('ascii') === 'GIF8' },
  { ext: 'webp', test: (b) => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP' },
];

/** @param {Buffer} buffer @returns {string | null} file extension or null */
export function detectImageType(buffer) {
  return SIGNATURES.find((s) => buffer.length >= 12 && s.test(buffer))?.ext ?? null;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});

const router = Router();
router.use(authenticate, requireRole('admin', 'praticien'));

// POST /api/admin/upload  (single file, field "image")
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
  const ext = detectImageType(req.file.buffer);
  if (!ext) return res.status(400).json({ error: 'Format non supporté (JPEG, PNG, WebP ou GIF)' });

  // Random name: the original file name is never used on disk.
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- nom généré par le serveur
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), req.file.buffer);
  res.json({ url: `/uploads/${filename}`, filename });
});

export default router;
