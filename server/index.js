import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { bootstrap } from './lib/bootstrap.js';
import formationsRouter from './routes/formations.js';
import pecRouter from './routes/pec.js';
import tarifsRouter from './routes/tarifs.js';
import horairesRouter from './routes/horaires.js';
import authRouter from './routes/auth.js';
import adminTarifsRouter from './routes/admin/tarifs.js';
import adminHorairesRouter from './routes/admin/horaires.js';
import adminFormationsRouter from './routes/admin/formations.js';
import adminUsersRouter from './routes/admin/users.js';
import siteConfigRouter from './routes/siteConfig.js';
import adminSiteConfigRouter from './routes/admin/siteConfig.js';
import externalLinksRouter from './routes/externalLinks.js';
import adminExternalLinksRouter from './routes/admin/externalLinks.js';
import adminUploadRouter from './routes/admin/upload.js';
import adminPecRouter from './routes/admin/pec.js';
import faqsRouter from './routes/faqs.js';
import adminFaqsRouter from './routes/admin/faqs.js';
import sitemapRouter from './routes/sitemap.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';

// Bootstrap : seed si vide + auto-create admin si aucun
bootstrap();

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

// Sécurité
app.use(helmet({
  contentSecurityPolicy: false, // le SPA frontend a besoin de inline scripts pour gtag, etc.
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Rate-limit sur auth (anti-brute-force)
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
}));

// Statique uploads
const UPLOADS_DIR = process.env.UPLOADS_PATH || path.join(__dirname, '../public/uploads');
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

// API
app.use('/api/formations', formationsRouter);
app.use('/api/pec', pecRouter);
app.use('/api/tarifs', tarifsRouter);
app.use('/api/horaires', horairesRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin/tarifs', adminTarifsRouter);
app.use('/api/admin/horaires', adminHorairesRouter);
app.use('/api/admin/formations', adminFormationsRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/site-config', siteConfigRouter);
app.use('/api/admin/site-config', adminSiteConfigRouter);
app.use('/api/external-links', externalLinksRouter);
app.use('/api/admin/external-links', adminExternalLinksRouter);
app.use('/api/admin/upload', adminUploadRouter);
app.use('/api/admin/pec', adminPecRouter);
app.use('/api/faqs', faqsRouter);
app.use('/api/admin/faqs', adminFaqsRouter);

// SEO (robots.txt + sitemap.xml)
app.use('/', sitemapRouter);

// Health check (pour Fly.io et autres)
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// En prod : sert le frontend buildé (dist/)
if (isProd) {
  const distDir = path.join(__dirname, '../dist');
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir, { maxAge: '1h', index: false }));
    app.get(/^(?!\/api|\/uploads|\/robots\.txt|\/sitemap\.xml|\/healthz).*/, (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT} (${isProd ? 'production' : 'dev'})`);
});
