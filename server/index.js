import 'dotenv/config';
import { bootstrap } from './lib/bootstrap.js';
import { createApp } from './app.js';

const isProd = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET) {
  console.error('[startup] JWT_SECRET manquant : arrêt. Définissez une valeur aléatoire d\'au moins 32 caractères.');
  process.exit(1);
}

// Migrations + seed if empty + admin account if none.
bootstrap();

const PORT = process.env.PORT || 3001;
createApp().listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT} (${isProd ? 'production' : 'dev'})`);
});
