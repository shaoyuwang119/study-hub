import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Rightbar, Sidebar, NoteCard } from '../components'
import type { Note } from '../components/Types'
import UploadModal from '../components/UploadModal'

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

  const handleSubmit = async (newNote: {
    title: string
    subject: string
    description: string
    url: string
    author: string
  }) => {
    console.log('Sending to backend:', newNote)

    const res = await fetch('http://localhost:3000/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newNote),
    })

    const savedNote: Note = await res.json()
    console.log(savedNote)

    setNotes((prev) => [...prev, savedNote])
  }

  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar />

      <div className="flex-1 flex-col bg-zinc-50 p-6">
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
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-300 focus:outline-none"
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
            <Link to={`/notes/${note.id}`} className="block w-full">
              <NoteCard key={note.id} note={note} preview={note.content_url} />
            </Link>
          ))}
        </div>
      </div>

      <Rightbar notes={notes} />
    </div>
  )
}

export default App
