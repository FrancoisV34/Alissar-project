// Exécuté avant chaque fichier de test serveur, AVANT l'import des modules testés :
// chaque fichier reçoit sa propre base SQLite temporaire.
import os from 'os';
import path from 'path';
import crypto from 'crypto';

process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = path.join(os.tmpdir(), `alissar-test-${process.pid}-${crypto.randomBytes(4).toString('hex')}.sqlite`);
process.env.UPLOADS_PATH = path.join(os.tmpdir(), `alissar-uploads-${process.pid}`);
process.env.JWT_SECRET = 'secret-de-test-uniquement-0123456789abcdef';
