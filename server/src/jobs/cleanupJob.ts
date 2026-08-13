import cron from 'node-cron'
import { cleanupOrphanedFiles } from '@/services/cleanupService'

export function scheduleCleanupJob() {
  // Runs daily at 3am
  cron.schedule('0 3 * * *', async () => {
    try {
      const count = await cleanupOrphanedFiles()
      console.log(`[cleanup] removed ${count} orphaned file(s)`)
    } catch (err) {
      console.error('[cleanup] failed:', err)
    }
  })
}
