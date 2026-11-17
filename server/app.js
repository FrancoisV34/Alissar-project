import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { contentSecurityPolicy, UPLOADS_CSP, allowedOrigins } from './config/security.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
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
import adminUploadRouter, { UPLOADS_DIR } from './routes/admin/upload.js';
import adminPecRouter from './routes/admin/pec.js';
import faqsRouter from './routes/faqs.js';
import adminFaqsRouter from './routes/admin/faqs.js';
import sitemapRouter from './routes/sitemap.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Builds the Express application without starting it, so that tests can
 * drive it with Supertest.
 *
 * Layers, in order: security headers → CORS → body parsing → rate limiting →
 * routes (public, then admin protected by JWT + role) → front-end → errors.
 *
 * @param {object} [options]
 * @param {boolean} [options.serveFrontend] - serve `dist/` (production build).
 * @param {number} [options.loginMaxAttempts] - login attempts per 15 minutes.
 * @returns {import('express').Express}
 */
export function createApp({ serveFrontend = process.env.NODE_ENV === 'production', loginMaxAttempts = 20 } = {}) {
  const app = express();

  // Fly.io sits in front of the app: trust exactly one proxy for req.ip.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // gzip: divides the size of JS/CSS/JSON responses by about 3 (eco-design).
  app.use(compression());

  app.use(helmet({ contentSecurityPolicy, crossOriginEmbedderPolicy: false }));

  const origins = allowedOrigins();
  app.use(cors({ origin: (origin, cb) => cb(null, Boolean(origin) && origins.includes(origin)) }));

  app.use(express.json({ limit: '1mb' }));

  // Anti brute force on login.
  app.use('/api/auth/login', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: loginMaxAttempts,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  }));

  // Uploaded files: served with a CSP that forbids any script.
  app.use('/uploads', express.static(UPLOADS_DIR, {
    maxAge: '7d',
    setHeaders: (res) => res.setHeader('Content-Security-Policy', UPLOADS_CSP),
  }));

  // Public API
  app.use('/api/formations', formationsRouter);
  app.use('/api/pec', pecRouter);
  app.use('/api/tarifs', tarifsRouter);
  app.use('/api/horaires', horairesRouter);
  app.use('/api/site-config', siteConfigRouter);
  app.use('/api/external-links', externalLinksRouter);
  app.use('/api/faqs', faqsRouter);
  app.use('/api/auth', authRouter);

  // Admin API (each router starts with authenticate + requireRole)
  app.use('/api/admin/tarifs', adminTarifsRouter);
  app.use('/api/admin/horaires', adminHorairesRouter);
  app.use('/api/admin/formations', adminFormationsRouter);
  app.use('/api/admin/users', adminUsersRouter);
  app.use('/api/admin/site-config', adminSiteConfigRouter);
  app.use('/api/admin/external-links', adminExternalLinksRouter);
  app.use('/api/admin/upload', adminUploadRouter);
  app.use('/api/admin/pec', adminPecRouter);
  app.use('/api/admin/faqs', adminFaqsRouter);
  app.use('/api', notFound);

  // SEO (robots.txt + sitemap.xml)
  app.use('/', sitemapRouter);

  // Health check used by Fly.io and the CI smoke test.
  app.get('/healthz', (_req, res) => res.json({ ok: true }));

  if (serveFrontend) {
    const distDir = path.join(__dirname, '../dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir, { maxAge: '1h', index: false }));
      app.get(/^(?!\/api|\/uploads|\/robots\.txt|\/sitemap\.xml|\/healthz).*/, (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.use(errorHandler);
  return app;
}
