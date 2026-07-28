import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'

import { Sidebar } from '@/components'

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
      setLoading(true)

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .select()
        .single()

      if (error) {
        setError(error.message)
        console.log('error!')
        return
      }

      setNote(data)
      setLoading(false)
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
    <div className="flex h-screen font-sans">
      <Sidebar />
      {loading && <div>Loading...</div>}
      <div className="ml-5">
        <h1 className="mb-4 text-3xl font-bold">{note.title}</h1>
        <h2>Author: {note.author}</h2>
        <p>Description: {note.description}</p>
        <img src={note.content_url} className="my-2 border"></img>
        <button
          onClick={handleDelete}
          className="transition-shadows w-40 cursor-pointer rounded-md bg-red-500 px-4 py-2 text-white duration-200 hover:bg-red-600 hover:shadow-sm"
        >
          Delete Note
        </button>
      </div>
    </div>
  )
}

export default NotePage
