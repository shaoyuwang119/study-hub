import { supabaseAdmin } from '@/config/supabaseAdmin'

const BUCKETS = ['note-files', 'note-previews'] as const
const GRACE_PERIOD_MS = 60 * 60 * 1000 // don't touch files created in the last hour

function extractStoragePath(url: string | null, bucket: string): string | null {
  if (!url) return null
  const marker = `/object/public/${bucket}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(url.slice(idx + marker.length))
}

async function listAllObjects(bucket: string) {
  const { data: topLevel, error } = await supabaseAdmin.storage
    .from(bucket)
    .list()
  if (error) throw error

  const all: { path: string; createdAt: string }[] = []
  for (const entry of topLevel ?? []) {
    if (entry.id !== null) continue // only recurse into user-id "folders"
    const { data: files, error: filesError } = await supabaseAdmin.storage
      .from(bucket)
      .list(entry.name)
    if (filesError) throw filesError
    for (const file of files ?? []) {
      all.push({
        path: `${entry.name}/${file.name}`,
        createdAt: file.created_at ?? new Date().toISOString(),
      })
    }
  }

  return all
}

export async function cleanupOrphanedFiles(): Promise<number> {
  const { data: notes, error } = await supabaseAdmin
    .from('notes')
    .select('content_url, preview_url')
  if (error) throw error

  const referenced = new Set<string>()
  for (const note of notes ?? []) {
    const filePath = extractStoragePath(note.content_url, 'note-files')
    const previewPath = extractStoragePath(note.preview_url, 'note-previews')
    if (filePath) referenced.add(`note-files:${filePath}`)
    if (previewPath) referenced.add(`note-previews:${previewPath}`)
  }

  const now = Date.now()
  let deletedCount = 0

  for (const bucket of BUCKETS) {
    const objects = await listAllObjects(bucket)
    const orphanPaths = objects
      .filter((obj) => {
        const isReferenced = referenced.has(`${bucket}:${obj.path}`)
        const age = now - new Date(obj.createdAt).getTime()
        return !isReferenced && age > GRACE_PERIOD_MS
      })
      .map((obj) => obj.path)

    if (orphanPaths.length === 0) continue

    const { error: removeError } = await supabaseAdmin.storage
      .from(bucket)
      .remove(orphanPaths)
    if (removeError) {
      console.error(`Failed to remove orphans from ${bucket}:`, removeError)
      continue
    }
    deletedCount += orphanPaths.length
    console.log(
      `Cleaned up ${orphanPaths.length} orphaned file(s) from ${bucket}`
    )
  }

  return deletedCount
}
