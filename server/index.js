import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sectionsRouter from './routes/sections.js';
import formationsRouter from './routes/formations.js';
import pecRouter from './routes/pec.js';
import tarifsRouter from './routes/tarifs.js';
import horairesRouter from './routes/horaires.js';
import contactRouter from './routes/contact.js';
import authRouter from './routes/auth.js';
import adminTarifsRouter from './routes/admin/tarifs.js';
import adminHorairesRouter from './routes/admin/horaires.js';
import adminFormationsRouter from './routes/admin/formations.js';
import adminUsersRouter from './routes/admin/users.js';
import adminConsultationsRouter from './routes/admin/consultations.js';
import adminStatsRouter from './routes/admin/stats.js';
import adminPatientsRouter from './routes/admin/patients.js';
import adminOsteoRouter from './routes/admin/osteo.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/sections', sectionsRouter);
app.use('/api/formations', formationsRouter);
app.use('/api/pec', pecRouter);
app.use('/api/tarifs', tarifsRouter);
app.use('/api/horaires', horairesRouter);
app.use('/api/contact', contactRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin/tarifs', adminTarifsRouter);
app.use('/api/admin/horaires', adminHorairesRouter);
app.use('/api/admin/formations', adminFormationsRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/admin/consultations', adminConsultationsRouter);
app.use('/api/admin/stats', adminStatsRouter);
app.use('/api/admin/patients', adminPatientsRouter);
app.use('/api/admin/osteo', adminOsteoRouter);

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
