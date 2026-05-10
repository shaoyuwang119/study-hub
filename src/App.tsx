import { useEffect, useState } from 'react'
import Header from './components/Header'

type Note = {
  id: number
  title: string
  author: string
  imageUrl: string
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>([])

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    fetch('http://localhost:3000/api/notes')
      .then((res) => res.json())
      .then((data) => setNotes(data))
  }, [])

  async function handleSubmit(e: React.SubmitEvent) {
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
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <Header />

      <div className="flex flex-row my-6 space-y-4 space-x-4">
        {notes.map((note) => (
          <div key={note.id} className="rounded-xl bg-zinc-800 w-1/3 h-1/1 p-4">
            <img
              src={note.imageUrl}
              alt={note.title}
              className="mb-4 w-full rounded-lg"
            />

            <h2 className="text-xl font-semibold">{note.title}</h2>
            <p className="text-zinc-400">Uploaded by {note.author}</p>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 max-w-md text-white"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="w-full border border-zinc-300 rounded-lg p-2 text-white"
        />

        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
          className="w-full border border-zinc-300 rounded-lg p-2 text-white"
        />

        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Image URL"
          className="w-full border border-zinc-300 rounded-lg p-2 text-white"
        />

        <button className="m-1 w-50 text-white px-4 py-2 rounded-md border-b-blue-900 bg-blue-600 hover:bg-blue-700 active:bg-blue-600 cursor-pointer">
          Add Note
        </button>
      </form>

      <div className="flex flex-col">
        <button className="m-1 w-50 text-white px-4 py-2 rounded-md border-2 border-blue-700 hover:bg-blue-600 active:bg-blue-700 cursor-pointer">
          Browse Library
        </button>
      </div>
    </div>
  )
}
