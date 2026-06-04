import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { supabase } from '../lib/supabase'

import { Rightbar, Sidebar, NoteCard, UploadModal } from '../components'
import type { Note } from '../components/Types'

function App() {
  const [notes, setNotes] = useState<Note[]>([])

  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  console.log(notes)

  const fetchNotes = async () => {
    const res = await fetch('http://localhost:3000/api/notes')
    const data = await res.json()
    setNotes(data)
  }

  const uploadFile = async (file: File) => {
    const filePath = `${Date.now()}-${file.name}`

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
      // Upload file to Supabase Storage
      const [fileName, fileUrl] = await uploadFile(newNote.file)
      console.log(fileUrl)

      // Create note in backend
      const res = await fetch('http://localhost:3000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newNote.title,
          subject: newNote.subject,
          description: newNote.description,
          author: newNote.author,
          content_url: fileUrl,
        }),
      })

      if (!res.ok) throw new Error('Failed to creat note')

      const savedNote: Note = await res.json()

      // Insert file metadata into "files" table
      const { error } = await supabase
        .from('files')
        .insert({
          user_id: 1, // TODO: USER AUTH ID
          note_id: savedNote.id,
          file_name: fileName,
          file_url: fileUrl,
          file_type: newNote.file.type,
        })
        .select()
        .single()

      if (error) throw error

      // Update UI
      setNotes((prev) => [...prev, savedNote])
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
