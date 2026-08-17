import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { NoteCard, NoteCardMini, ErrorDisplay, Loading } from '@/components'

import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { useSavedNotes } from '@/lib/useSavedNotes'
import { resolveAuthors } from '@/lib/resolveAuthors'
import Title from '@/components/common/Title'

function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [savedNotes, setSavedNotes] = useState<Note[]>([])
  const [error, setError] = useState<string | null>()
  const [loading, setLoading] = useState(true)

  const { savedIds, toggleSave } = useSavedNotes()

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

      setNotes(await resolveAuthors(data))
      setLoading(false)
    }

    fetchNotes()
  }, [])

  useEffect(() => {
    async function fetchSavedNotes() {
      if (savedIds.size === 0) {
        setSavedNotes([])
        return
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*, subject:subjects(id, name, category)')
        .in('id', [...savedIds])

      if (error || !data) return

      setSavedNotes(await resolveAuthors(data))
    }

    fetchSavedNotes()
  }, [savedIds])

  return (
    <div className="flex h-full flex-1">
      <div className="flex-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-gutter-stable flex-col overflow-y-auto bg-slate-50 p-6">
        <Title title="Home" description="" />

        <div className="flex flex-col gap-y-3">
          <div className="font-serif text-xl font-medium text-slate-800">
            Continue studying
          </div>
          {error && <ErrorDisplay message={error} />}
          <div className="flex flex-wrap gap-x-3 gap-y-4">
            {loading ? (
              <div className="flex h-50 w-full items-center justify-center">
                <Loading />
              </div>
            ) : (
              notes.map((note) => (
                <Link key={note.id} to={`/notes/${note.id}`}>
                  <NoteCard
                    note={note}
                    isSaved={savedIds.has(note.id)}
                    onToggleSave={toggleSave}
                  />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <aside className="w-72 overflow-y-auto border-l border-slate-200 bg-slate-50 px-4 py-8">
        <div className="text-xl text-slate-800">My saved</div>
        <div className="mt-4 flex flex-col gap-y-2">
          {savedNotes.length === 0 ? (
            <div className="text-sm text-slate-500">
              No notes saved currently.
            </div>
          ) : (
            savedNotes.map((note) => (
              <Link key={note.id} to={`/notes/${note.id}`} className="block">
                <NoteCardMini note={note} />
              </Link>
            ))
          )}
        </div>
      </aside>
    </div>
  )
}

export default Home
