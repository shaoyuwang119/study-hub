import { useEffect, useState } from 'react'
import { Rightbar, Sidebar, NoteCard } from './components'

import type { Note } from './components/Types'

function App() {
  const [notes, setNotes] = useState<Note[]>([])

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    fetch('http://localhost:3000/api/notes')
      .then((res) => res.json())
      .then((data) => setNotes(data))
  }, [])

  console.log(notes)

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()

    const res = await fetch('http://localhost:3000/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        author,
        imageUrl,
      }),
    })

    const newNote = await res.json()

    setNotes([...notes, newNote])

    setTitle('')
    setAuthor('')
    setImageUrl('')
  }

  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar />

      <div className="flex-1 flex-col p-6 bg-zinc-50">
        <div className="flex flex-row mb-4 justify-between">
          <div className="text-4xl font-medium text-zinc-800">Home</div>
          <button className="w-40 text-white px-4 py-2 rounded-md hover:shadow-2xl bg-blue-500 hover:bg-blue-600 cursor-pointer">
            Upload Notes
          </button>
        </div>

        <div className="space-y-2 mb-2">
          <input
            placeholder="Search notes, classes, subjects..."
            className="w-full bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-300"
          />
          <div className="flex gap-x-4">
            {/* <button className="w-40 text-pink-500 p-2 rounded-md border border-pink-600 hover:bg-pink-100 cursor-pointer">
              English
            </button> */}
          </div>
        </div>

        <div className="flex flex-col items-start gap-y-2">
          <div className="mx-1 text-xl">Continue studying</div>
          {notes.map((note, index) => (
            <NoteCard
              key={index}
              title={note.title}
              subject={note.title}
              author={note.author}
              preview={note.content_url}
              saves={note.saves}
            />
          ))}
        </div>
      </div>

      <Rightbar notes={notes} />
    </div>
  )
}

export default App
