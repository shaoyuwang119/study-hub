import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import type { User } from '@supabase/supabase-js'

import { NoteCard, Rightbar, UploadModal, ErrorDisplay } from '@/components'

import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [error, setError] = useState<string | null>()
  const [searchQuery, setSearchQuery] = useState('')

  const [showUpload, setShowUpload] = useState(false)

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase()
    return (
      note.title.toLowerCase().includes(query) ||
      note.subject?.toLowerCase().includes(query) ||
      note.description?.toLowerCase().includes(query)
    )
  })

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase.from('notes').select('*')
      if (error) {
        setError(error.message)
        return
      }
      setNotes(data)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      console.log(user)
    }

    fetchNotes()
  }, [])

  // not sure whether this function will be useful yet -- but keeping it just in case.
  const uploadFileMetadata = async (
    user: User,
    noteData: any,
    fileName: string,
    fileUrl: string,
    fileType: string
  ) => {
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .insert({
        user_id: user.id,
        note_id: noteData.id,
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType,
      })
      .select()
      .single()

    if (fileError) {
      setError(fileError.message)
      return
    }

    return [fileData, fileError]
  }

  const handleSubmit = async (newNote: {
    title: string
    subject: string
    description: string
    files: File[]
    author: string
  }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        console.log('Not authenticated!')
        return
      }

      // Upload files to server to convert them to PDF
      const formData = new FormData()
      formData.append('title', newNote.title)
      formData.append('subject', newNote.subject)
      formData.append('description', newNote.description)
      formData.append('author', newNote.author)
      newNote.files.forEach((file) => formData.append('files', file))

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.error ?? 'Failed to upload note.')
        return
      }

      const noteData = await res.json()
      setNotes((prev) => [...prev, noteData])
      setShowUpload(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex-col overflow-y-auto bg-zinc-50 p-6">
        <div className="mb-4 flex flex-row justify-between">
          <div className="text-4xl font-medium text-zinc-900">Home</div>
          <button
            onClick={() => setShowUpload(true)}
            className="transition-shadows w-40 cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white duration-200 hover:bg-blue-600 hover:shadow-sm"
          >
            Upload Notes
          </button>
        </div>
        <UploadModal
          open={showUpload}
          onSubmit={handleSubmit}
          onClose={() => setShowUpload(false)}
        />

        <div className="mb-2 space-y-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, classes, subjects..."
            className="w-full rounded-lg border border-gray-200 bg-zinc-50 px-3 py-2 text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
          />
          <div className="flex gap-x-4">
            {/* <button className="w-40 text-pink-500 p-2 rounded-md border border-pink-600 hover:bg-pink-100 cursor-pointer">
              English
            </button> */}
          </div>
        </div>

        <div className="flex flex-col items-start gap-y-3">
          <div className="mx-1 text-xl">Continue studying</div>
          {error && <ErrorDisplay message={error} />}
          <div className="flex flex-wrap gap-4">
            {filteredNotes.map((note) => (
              <Link key={note.id} to={`/notes/${note.id}`}>
                <NoteCard note={note} preview={note.content_url} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Rightbar notes={notes} />
    </div>
  )
}

export default App
