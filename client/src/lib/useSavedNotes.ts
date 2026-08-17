import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

export function useSavedNotes() {
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    async function fetchSaved() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('note_saves')
        .select('note_id')
        .eq('user_id', user.id)

      if (data) setSavedIds(new Set(data.map((row) => row.note_id)))
    }

    fetchSaved()
  }, [])

  const toggleSave = useCallback(async (noteId: number, isSaved: boolean) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (isSaved) {
      setSavedIds((prev) => {
        const next = new Set(prev)
        next.delete(noteId)
        return next
      })
      await supabase
        .from('note_saves')
        .delete()
        .eq('user_id', user.id)
        .eq('note_id', noteId)
    } else {
      setSavedIds((prev) => new Set(prev).add(noteId))
      const { data, error } = await supabase
        .from('note_saves')
        .insert({ user_id: user.id, note_id: noteId })
    }
  }, [])

  return { savedIds, toggleSave }
}
