import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { NoteCard, Title } from '@/components'
import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { useSavedNotes } from '@/lib/useSavedNotes'
import { resolveAuthors } from '@/lib/resolveAuthors'

const NOTES_PER_SECTION = 8

function Explore() {
  const [popularNotes, setPopularNotes] = useState<Note[]>([])
  const [newNotes, setNewNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { savedIds, toggleSave } = useSavedNotes()

  usePageTitle('Explore | StudyNote')

  useEffect(() => {
    async function loadNotes() {
      setLoading(true)

      const [popularRes, newRes] = await Promise.all([
        supabase
          .from('notes')
          .select('*, subject:subjects(id, name, category)')
          .order('saves', { ascending: false })
          .limit(NOTES_PER_SECTION),
        supabase
          .from('notes')
          .select('*, subject:subjects(id, name, category)')
          .order('created_at', { ascending: false })
          .limit(NOTES_PER_SECTION),
      ])

      if (popularRes.error || newRes.error) {
        setError(
          popularRes.error?.message ??
            newRes.error?.message ??
            'Failed to load notes'
        )
        setLoading(false)
        return
      }

      const [resolvedPopular, resolvedNew] = await Promise.all([
        resolveAuthors(popularRes.data ?? []),
        resolveAuthors(newRes.data ?? []),
      ])

      setPopularNotes(resolvedPopular)
      setNewNotes(resolvedNew)
      setLoading(false)
    }

    loadNotes()
  }, [])

  function renderSection(title: string, notes: Note[]) {
    console.log(savedIds)
    return (
      <div className="mb-8">
        <div className="mb-3 font-serif text-xl font-medium text-slate-800">
          {title}
        </div>
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16 text-center">
            <p className="text-sm text-slate-500">No notes yet</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {notes.map((note) => (
              <Link key={note.id} to={`/notes/${note.id}`}>
                <NoteCard
                  note={note}
                  isSaved={savedIds.has(note.id)}
                  onToggleSave={toggleSave}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-1">
      <div className="flex-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-gutter-stable flex-col overflow-y-auto bg-slate-50 p-6">
        <Title
          title="Explore"
          description="Discover notes made by the community"
        />

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-400">
            Loading...
          </div>
        ) : (
          <>
            {renderSection('Popular', popularNotes)}
            {renderSection('New', newNotes)}
          </>
        )}
      </div>
    </div>
  )
}

export default Explore
