import { supabaseAdmin } from '@/config/supabaseAdmin'
import { extractStoragePath } from '@/utils/deleteNoteFiles'

const BUCKETS = ['note-files', 'note-previews'] as const
const GRACE_PERIOD_MS = 60 * 60 * 1000 // don't touch files created in the last hour

const PAGE_SIZE = 1000 // Supabase Storage's max per list() call

async function listUserFolders(bucket: string): Promise<string[]> {
  const folders: string[] = []
  let offset = 0
  while (true) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list('', { limit: PAGE_SIZE, offset })
    if (error) throw error
    for (const entry of data ?? []) {
      if (entry.id === null) folders.push(entry.name) // folders have id === null
    }
    if (!data || data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }
  return folders
}

async function listFolderFiles(bucket: string, folder: string) {
  const files: { path: string; createdAt: string }[] = []
  let offset = 0
  while (true) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list(folder, { limit: PAGE_SIZE, offset })
    if (error) throw error
    for (const file of data ?? []) {
      files.push({
        path: `${folder}/${file.name}`,
        createdAt: file.created_at ?? new Date().toISOString(),
      })
    }
    if (!data || data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }
  return files
}

async function listAllObjects(bucket: string) {
  const folders = await listUserFolders(bucket)
  const perFolder = await Promise.all(
    folders.map((folder) => listFolderFiles(bucket, folder))
  )
  return perFolder.flat()
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
