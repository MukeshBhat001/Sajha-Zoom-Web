import compression from 'compression';
import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import recordingsRouter from './routes/recordings.js';
import syncRouter from './routes/sync.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, '../../dist/client');
const clientPublicPath = path.resolve(__dirname, '../../client/public');
const allowedOrigins = env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
const serverOrigin = `http://localhost:${env.PORT}`;

app.use(compression());
app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        env.NODE_ENV !== 'production' ||
        origin === serverOrigin ||
        allowedOrigins.includes(origin) ||
        origin.includes('onrender.com')

      ) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    }
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/recordings', recordingsRouter);
app.use('/api/sync', syncRouter);

if (env.NODE_ENV === 'production') {
  app.use(express.static(clientPublicPath));
  app.use(express.static(clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use((error, _req, res, _next) => {
  console.error(error);

  const status = error.status && Number.isInteger(error.status) ? error.status : 500;
  const message = env.NODE_ENV === 'production' && status === 500 ? 'Server error.' : error.message;

  res.status(status).json({
    message,
    details: env.NODE_ENV === 'production' ? undefined : error.details
  });
});

export default app;
