import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Note } from '../components/Types'

function NotePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this note?'
    )

    if (!confirmDelete) return

    try {
      const res = await fetch(`http://localhost:3000/api/notes/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message)
      }

      navigate('/')
    } catch (err) {
      console.error(err)
      alert('Something went wrong while deleting the note.')
    }
  }

  useEffect(() => {
    async function fetchNote() {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:3000/api/notes/${id}`)

        if (!res.ok) {
          throw new Error('Failed to fetch note')
        }

        const data = await res.json()

        setNote(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchNote()
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!note) {
    return <div>Page not found</div>
  }

  return (
    <div className="mx-auto p-6">
      <h1 className="mb-4 text-3xl font-bold">{note.title}</h1>
      <h2>Author: {note.author}</h2>
      <p>Description: {note.description}</p>
      <button
        onClick={handleDelete}
        className="transition-shadows w-40 cursor-pointer rounded-md bg-red-500 px-4 py-2 text-white duration-200 hover:bg-red-600 hover:shadow-sm"
      >
        Delete Note
      </button>
    </div>
  )
}

export default NotePage
