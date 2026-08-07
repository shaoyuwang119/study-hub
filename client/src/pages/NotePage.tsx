import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'

import { Sidebar, ErrorDisplay } from '@/components'
import type { User } from '@supabase/supabase-js'

type FetchState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'not-found' }
  | { status: 'ready'; note: Note }

function NotePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [state, setState] = useState<FetchState>({ status: 'loading' })
  const [user, setUser] = useState<User>()

  async function handleDelete() {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this note?'
    )

    if (!confirmDelete) return

    const { data } = await supabase.from('notes').delete().eq('id', id)

    navigate('/')
  }

  useEffect(() => {
    async function fetchNote() {
      setState({ status: 'loading' })

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (!user) {
        setState({ status: 'error', message: userError!.message })
        return
      }

      setUser(user)

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .select()
        .single()

      if (error) {
        setState({ status: 'error', message: error.message })
        console.log('error!')
        return
      }

      if (!data) {
        setState({ status: 'not-found' })
        return
      }
      setState({ status: 'ready', note: data })
    }

    fetchNote()
  }, [id])

  function renderContent() {
    switch (state.status) {
      case 'loading':
        return <div>Loading...</div>
      case 'error':
        return (
          <div>
            <ErrorDisplay message={state.message}></ErrorDisplay>
          </div>
        )
      case 'ready': {
        return (
          <>
            <h1 className="mb-4 text-3xl font-bold">{state.note.title}</h1>
            <h2>Author: {state.note.author}</h2>
            <p>Description: {state.note.description}</p>

            {state.note.content_url ? (
              <img src={state.note.content_url} className="my-2 border"></img>
            ) : (
              <p>No content attached.</p>
            )}

            {state.note.user_id == user!.id && (
              <button
                onClick={handleDelete}
                className="transition-shadows w-40 cursor-pointer rounded-md bg-red-500 px-4 py-2 text-white duration-200 hover:bg-red-600 hover:shadow-sm"
              >
                Delete Note
              </button>
            )}
          </>
        )
      }
    }
  }

  return (
    <div className="flex h-screen font-sans">
      <Sidebar />
      <div className="ml-5">{renderContent()} </div>
    </div>
  )
}

export default NotePage
