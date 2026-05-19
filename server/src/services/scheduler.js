import { env, hasZoomConfig } from '../config/env.js';
import { syncZoomRecordings } from './zoomSync.js';

let running = false;
let lastSync = {
  running: false,
  success: null,
  message: 'Sync has not run yet.',
  result: null,
  finishedAt: null
};

export function getSyncStatus() {
  return { ...lastSync, running };
}

export async function runZoomSync() {
  if (running) {
    return {
      skipped: true,
      message: 'A Zoom sync is already running.'
    };
  }

  running = true;
  lastSync = {
    ...lastSync,
    running: true,
    message: 'Zoom sync is running.'
  };

  try {
    const result = await syncZoomRecordings();
    lastSync = {
      running: false,
      success: true,
      message: 'Zoom sync completed.',
      result,
      finishedAt: new Date()
    };
    return result;
  } catch (error) {
    lastSync = {
      running: false,
      success: false,
      message: error.message,
      result: null,
      finishedAt: new Date()
    };
    throw error;
  } finally {
    running = false;
  }
}

export function startAutoSync() {
  if (!hasZoomConfig()) {
    console.log('Zoom sync disabled because credentials are not configured.');
    return;
  }

  if (env.SYNC_ON_START) {
    setTimeout(() => {
      runZoomSync().catch((error) => console.error('Startup Zoom sync failed:', error.message));
    }, 1000);
  }

  if (env.SYNC_INTERVAL_MINUTES > 0) {
    setInterval(() => {
      runZoomSync().catch((error) => console.error('Scheduled Zoom sync failed:', error.message));
    }, env.SYNC_INTERVAL_MINUTES * 60 * 1000);

    console.log(`Zoom auto sync scheduled every ${env.SYNC_INTERVAL_MINUTES} minute(s).`);
  }
}
