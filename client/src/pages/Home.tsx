import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import type { User } from '@supabase/supabase-js'

import { NoteCard, Rightbar, Sidebar, UploadModal } from '@/components'
import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  // const [error, setError] = useState<string | null>()

  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase.from('notes').select('*')
      if (error) {
        console.log(error.message)
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
      console.log(fileError.message)
      return
    }

    return [fileData, fileError]
  }

  const uploadFile = async (file: File, user: User) => {
    const filePath = `${user.id}/${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from('note-files')
      .upload(filePath, file)

    if (error) throw error

    const { data } = supabase.storage.from('note-files').getPublicUrl(filePath)

    return [filePath, data.publicUrl]
  }

  const handleSubmit = async (newNote: {
    title: string
    subject: string
    description: string
    file: File
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

      // Upload file to Supabase Storage
      const fileUrl = await uploadFile(newNote.file, session.user)
      console.log(fileUrl)

      // Create note in backend
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .insert([
          {
            title: newNote.title,
            subject: newNote.subject,
            description: newNote.description,
            content_url: fileUrl,
            author: newNote.author,
            user_id: session.user.id,
          },
        ])
        .select()
        .single()

      if (noteError) {
        console.log(noteError.message)
        return
      }

      console.log('Note and file created:', noteData)

      setNotes((prev) => [...prev, noteData])
      setShowUpload(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex h-screen font-sans">
      <Sidebar />

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
            placeholder="Search notes, classes, subjects..."
            className="w-full rounded-lg border border-gray-200 bg-zinc-50 px-3 py-2 text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
          />
          <div className="flex gap-x-4">
            {/* <button className="w-40 text-pink-500 p-2 rounded-md border border-pink-600 hover:bg-pink-100 cursor-pointer">
              English
            </button> */}
          </div>
        </div>

        <div className="flex flex-col items-start gap-y-2">
          <div className="mx-1 text-xl">Continue studying</div>
          {notes.map((note) => (
            <Link
              key={note.id}
              to={`/notes/${note.id}`}
              className="block w-full"
            >
              <NoteCard note={note} preview={note.content_url} />
            </Link>
          ))}
        </div>
      </div>

      <Rightbar notes={notes} />
    </div>
  )
}

export default App
