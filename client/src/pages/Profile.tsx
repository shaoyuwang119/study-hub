import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { NoteCard, ErrorDisplay } from '@/components'
import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { useSavedNotes } from '@/lib/useSavedNotes'

function Profile() {
  const [displayName, setDisplayName] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { savedIds, toggleSave } = useSavedNotes()

  usePageTitle('Profile | StudyNote')

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const [{ data: profile }, { data: userNotes, error: notesError }] =
        await Promise.all([
          supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user.id)
            .single(),
          supabase
            .from('notes')
            .select('*, subject:subjects(id, name, category)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
        ])

      if (notesError) {
        setError(notesError.message)
        setLoading(false)
        return
      }

      setDisplayName(profile?.display_name ?? 'Unknown User')
      setNotes(userNotes ?? [])
      setLoading(false)
    }

    fetchProfile()
  }, [])

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="mb-6 flex items-center gap-4">
        <div className="bg-sea-sky text-sea-teal-dark flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold">
          {displayName ? displayName.charAt(0).toUpperCase() : '?'}
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold text-slate-900">
            {loading ? 'Loading...' : displayName}
          </h1>
          <p className="text-sm text-slate-500">
            {notes.length} note{notes.length === 1 ? '' : 's'} created
          </p>
        </div>
      </div>

      {error && <ErrorDisplay message={error} />}

      {!loading && !error && notes.length === 0 && (
        <p className="text-sm text-slate-400">
          You haven't created any notes yet.
        </p>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-4">
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
    </div>
  )
}

export default Profile
