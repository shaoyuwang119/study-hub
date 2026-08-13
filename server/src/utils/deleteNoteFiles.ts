import { supabaseAdmin } from '@/config/supabaseAdmin'

const BUCKETS = { content: 'note-files', preview: 'note-previews' } as const

export function extractStoragePath(
  url: string | null,
  bucket: string
): string | null {
  if (!url) return null
  const marker = `/object/public/${bucket}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(url.slice(idx + marker.length))
}

export async function deleteNoteFiles(
  contentUrl: string | null,
  previewUrl: string | null
) {
  const filePath = extractStoragePath(contentUrl, BUCKETS.content)
  const previewPath = extractStoragePath(previewUrl, BUCKETS.preview)

  if (filePath) {
    const { error } = await supabaseAdmin.storage
      .from(BUCKETS.content)
      .remove([filePath])
    if (error) console.error('Failed to delete note file:', error)
  }
  if (previewPath) {
    const { error } = await supabaseAdmin.storage
      .from(BUCKETS.preview)
      .remove([previewPath])
    if (error) console.error('Failed to delete note preview:', error)
  }
}
