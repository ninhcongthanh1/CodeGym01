import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { initDatabase } from './db';
import { swaggerDocument } from './swagger';
import { internsRouter } from './routes/interns';
import { tasksRouter } from './routes/tasks';
import { reportsRouter } from './routes/reports';
import { evaluationsRouter } from './routes/evaluations';
import { attendanceRouter } from './routes/attendance';
import { leavesRouter } from './routes/leaves';
import { allowancesRouter } from './routes/allowances';
import { ticketsRouter } from './routes/tickets';
import { programsRouter } from './routes/programs';
import { mentorsRouter } from './routes/mentors';
import { systemRouter } from './routes/system';
import { permissionsRouter } from './routes/permissions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  if (!req.url.startsWith('/api-docs')) {
    console.log(`[${new Date().toISOString().substring(11, 19)}] ${req.method} ${req.url}`);
  }
  next();
});

// Initialize SQLite database
initDatabase();

// Swagger Documentation endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'IMS Enterprise - Swagger API Documentation',
  customCss: '.swagger-ui .topbar { background-color: #0f172a !important; }'
}));

// Raw OpenAPI JSON
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerDocument);
});

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'IMS Enterprise Backend Server is running',
    swaggerDocs: `http://localhost:${PORT}/api-docs`,
    timestamp: new Date().toISOString(),
    version: '2.6.0'
  });
});

// API Routes
app.use('/api/interns', internsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/evaluations', evaluationsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/leaves', leavesRouter);
app.use('/api/allowances', allowancesRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/programs', programsRouter);
app.use('/api/mentors', mentorsRouter);
app.use('/api/system/permissions', permissionsRouter);
app.use('/api/system', systemRouter);

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 IMS Backend Server listening on http://localhost:${PORT}`);
  console.log(`📑 Swagger UI Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`💾 SQLite Database connected: data/ims.db`);
  console.log(`=======================================================`);
});
