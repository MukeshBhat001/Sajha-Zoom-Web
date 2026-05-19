import express from 'express';
import { env } from '../config/env.js';
import { getSyncStatus, runZoomSync } from '../services/scheduler.js';

const router = express.Router();

router.get('/status', (_req, res) => {
  res.json(getSyncStatus());
});

router.post('/zoom', async (_req, res, next) => {
  if (!env.ENABLE_PUBLIC_SYNC_ENDPOINT) {
    return res.status(404).json({ message: 'Manual sync endpoint is disabled.' });
  }

  try {
    const result = await runZoomSync();
    res.json({ message: 'Zoom sync completed.', result });
  } catch (error) {
    next(error);
  }
});

export default router;
