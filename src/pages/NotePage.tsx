import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Note } from '../components/Types'

function NotePage() {
  const { id } = useParams()

  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNote() {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:3000/api/notes/${id}`)

        if (!res.ok) {
          throw new Error('Failed to fetch note')
        }

        const data = await res.json()

        setNote(data.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchNote()
  })

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
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-3xl font-bold">{note.title}</h1>
    </div>
  )
}

export default NotePage
