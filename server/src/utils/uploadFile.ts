import { SupabaseClient } from '@supabase/supabase-js'

async function uploadPdfToSupabase(
  file: Uint8Array,
  userId: string,
  noteTitle: string,
  supabaseClient: SupabaseClient
): Promise<string> {
  const filePath = `${userId}/${Date.now()}-${noteTitle}.pdf`

  const { error: uploadError } = await supabaseClient.storage
    .from('note-files')
    .upload(filePath, Buffer.from(file), {
      contentType: 'application/pdf',
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data: publicUrlData } = supabaseClient.storage
    .from('note-files')
    .getPublicUrl(filePath)

  return publicUrlData.publicUrl
}

async function uploadPreviewToSupabase(
  file: Buffer,
  userId: string,
  noteTitle: string,
  supabaseClient: SupabaseClient
): Promise<string> {
  const filePath = `${userId}/${Date.now()}-${noteTitle}-preview.png`

  const { error: uploadError } = await supabaseClient.storage
    .from('note-previews')
    .upload(filePath, file, {
      contentType: 'image/png',
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data: publicUrlData } = supabaseClient.storage
    .from('note-previews')
    .getPublicUrl(filePath)

  return publicUrlData.publicUrl
}

export { uploadPdfToSupabase, uploadPreviewToSupabase }
