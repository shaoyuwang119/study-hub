import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'

export async function resolveAuthors(notes: Note[]): Promise<Note[]> {
  const userIds = [...new Set(notes.map((note) => note.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds)

  const authorById = new Map(profiles?.map((p) => [p.id, p.display_name]))
  return notes.map((note) => ({
    ...note,
    author: authorById.get(note.user_id) ?? note.author,
  }))
}
