import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { startAutoSync } from './services/scheduler.js';

async function startServer() {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`API server running on http://localhost:${env.PORT}`);
    startAutoSync();
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${env.PORT} is already in use. Stop the other process or set a different PORT in .env.`);
    } else {
      console.error('API server failed:', error);
    }

    process.exit(1);
  });
}

startServer().catch((error) => {
  console.error('Unable to start server:', error);
  process.exit(1);
});
