import 'dotenv/config'
import { cleanupOrphanedFiles } from '@/services/cleanupService'

cleanupOrphanedFiles()
  .then((count) => console.log(`Deleted ${count} orphaned file(s)`))
  .catch((err) => console.error(err))

// npx tsx server/src/scripts/debugCleanup.ts
