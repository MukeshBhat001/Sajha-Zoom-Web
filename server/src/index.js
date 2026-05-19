import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { startAutoSync } from './services/scheduler.js';

async function startServer() {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`API server running on http://localhost:${env.PORT}`);
    startAutoSync();
  });
}

startServer().catch((error) => {
  console.error('Unable to start server:', error);
  process.exit(1);
});
