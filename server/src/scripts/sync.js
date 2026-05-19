import { connectDatabase } from '../config/db.js';
import { syncZoomRecordings } from '../services/zoomSync.js';

async function main() {
  await connectDatabase();
  const result = await syncZoomRecordings();
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
