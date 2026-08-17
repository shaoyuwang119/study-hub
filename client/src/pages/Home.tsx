import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'

import { NoteCard, ErrorDisplay, Loading } from '@/components'

import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { useSavedNotes } from '@/lib/useSavedNotes'
import type { LayoutContext } from '@/components/auth/ProtectedRoute'

function Home() {
  const { searchQuery } = useOutletContext<LayoutContext>()
  const [notes, setNotes] = useState<Note[]>([])
  const [error, setError] = useState<string | null>()

  const [loading, setLoading] = useState(true)

  const { savedIds, toggleSave } = useSavedNotes()

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase()
    return (
      note.title.toLowerCase().includes(query) ||
      note.subject?.name.toLowerCase().includes(query) ||
      note.description?.toLowerCase().includes(query)
    )
  })

  usePageTitle('Home | StudyNote')

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*, subject:subjects(id, name, category)')
      if (error) {
        setError(error.message)
        return
      }

      const userIds = [...new Set(data.map((note) => note.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds)

      const authorById = new Map(profiles?.map((p) => [p.id, p.display_name]))
      setNotes(
        data.map((note) => ({
          ...note,
          author: authorById.get(note.user_id) ?? note.author,
        }))
      )

      const {
        data: { user },
      } = await supabase.auth.getUser()
      setLoading(false)
    }

    fetchNotes()
  }, [])

  return (
    <div className="flex h-full flex-1">
      <div className="flex-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-gutter-stable flex-col overflow-y-auto bg-slate-50 p-6">
        <div className="mb-4 font-serif text-4xl font-medium text-slate-900">
          Home
        </div>

        <div className="flex flex-col gap-y-3">
          <div className="mx-1 text-xl text-slate-800">Continue studying</div>
          {error && <ErrorDisplay message={error} />}
          <div className="flex flex-wrap gap-x-3 gap-y-4">
            {loading ? (
              <div className="flex h-50 w-full items-center justify-center">
                <Loading />
              </div>
            ) : (
              filteredNotes.map((note) => (
                <Link key={note.id} to={`/notes/${note.id}`}>
                  <NoteCard
                    note={note}
                    isSaved={savedIds.has(note.id)}
                    onToggleSave={toggleSave}
                  />
                </Link>
              ))
            )}
            {}
          </div>
        </div>
      </div>

      <aside className="w-72 overflow-y-auto border-l border-slate-200 bg-slate-50 px-4 py-8">
        <div className="text-xl text-slate-800">My saved</div>
        <div className="mt-4 flex flex-col gap-y-2">
          <div className="text-sm text-slate-500">
            No notes saved currently.
          </div>
          {/* {notes.map((note) => (
          <Link key={note.id} to={`/notes/${note.id}`} className="block">
            <NoteCardMini note={note} />
          </Link>
        ))} */}
        </div>
      </aside>
    </div>
  )
}

export default Home
