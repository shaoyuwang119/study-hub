import { useEffect, useState } from 'react'
import { Header, Sidebar, NoteCard } from './components'

type Note = {
  id: number
  title: string
  author: string
  imageUrl: string
}

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

  async function removeLastNote() {
    const res = await fetch('http://localhost:3000/api/notes/last', {
      method: 'DELETE',
    })

    const data = await res.json()

    if (!res.ok) {
      console.log('No notes to delete')
      return
    }

    setNotes(data.notes)
  }

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

      <div className="flex flex-col gap-y-6 p-6 w-1/2 bg-zinc-50">
        <div className="text-4xl font-medium text-zinc-800">Home</div>

        <div className="space-y-2">
          <input
            placeholder="Search notes, classes, subjects..."
            className="w-full bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-300"
          />
          <div className="flex gap-x-4">
            <button className="w-40 text-pink-500 p-2 rounded-md border border-pink-600 bg-pink-white hover:bg-pink-100 cursor-pointer">
              English
            </button>
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
              preview={note.imageUrl}
              saves={67}
            />
          ))}
        </div>
        <button className="w-50 text-white px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 cursor-pointer">
          Upload Notes
        </button>
      </div>

      <aside className="w-96 border-l border-gray-200 bg-zinc-white px-6 py-8">
        <div className="text-2xl text-zinc-800">My saved</div>
        <div className="flex flex-col items-start mt-4 gap-y-4">
          {notes.map((note, index) => (
            <NoteCard
              key={index}
              title={note.title}
              subject={note.title}
              author={note.author}
              preview={note.imageUrl}
              saves={67}
            />
          ))}
        </div>
      </aside>

      {/* <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 max-w-md text-white"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="w-full border border-zinc-300 rounded-lg p-2 text-black"
        />

        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
          className="w-full border border-zinc-300 rounded-lg p-2 text-black"
        />

        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Image URL"
          className="w-full border border-zinc-300 rounded-lg p-2 text-black"
        />

        
      </form>

      <div className="mt-2 space-y-2 flex flex-col">
        <button
          onClick={removeLastNote}
          className="rounded-lg w-50 bg-red-500 px-4 py-2 hover:bg-red-600 active:bg-red-500 cursor-pointer"
        >
          Remove Last Note
        </button>
        <button className="w-50 text-black px-4 py-2 rounded-md border-2 border-blue-600 hover:bg-blue-500 active:bg-white cursor-pointer">
          Browse Library
        </button>
      </div> */}
    </div>
  )
}

export default App
