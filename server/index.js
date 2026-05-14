import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
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

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

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
app.use('/', sitemapRouter);

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
