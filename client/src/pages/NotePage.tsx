import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'
import { formatSize } from '@/lib/formatFileSize'

import { Sidebar, ErrorDisplay, Loading } from '@/components'
import type { User } from '@supabase/supabase-js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faExpand,
  faCompress,
  faEllipsisVertical,
} from '@fortawesome/free-solid-svg-icons'
import { usePageTitle } from '@/lib/usePageTitle'

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
  const [fileSize, setFileSize] = useState<number | null>(null)

  const [activeTab, setActiveTab] = useState<
    'details' | 'comments' | 'related'
  >('details')
  const [isExpanded, setIsExpanded] = useState(false)

  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  usePageTitle(
    state.status === 'ready'
      ? `${state.note.title} | StudyNote`
      : 'Loading... | StudyNote'
  )

  async function handleDelete() {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this note?'
    )

    if (!confirmDelete) return

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })

    if (!res.ok) {
      alert('Failed to delete note.')
      return
    }

    navigate('/')
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (state.status !== 'ready') return

    fetch(state.note.content_url, { method: 'HEAD' })
      .then((r) => setFileSize(Number(r.headers.get('content-length')) || null))
      .catch(() => setFileSize(null))
  }, [state])

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
        .select('*, subject:subjects(id, name, category)')
        .eq('id', id)
        .maybeSingle()

      if (error) {
        setState({ status: 'error', message: error.message })
        console.log('error!')
        return
      }

      if (!data) {
        setState({ status: 'not-found' })
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', data.user_id)
        .single()

      setState({
        status: 'ready',
        note: { ...data, author: profile?.display_name ?? 'Unknown User' },
      })
    }

    fetchNote()
  }, [id])

  function renderContent() {
    switch (state.status) {
      case 'loading':
        return <Loading />
      case 'not-found':
        return (
          <div className="w-full p-4">
            <ErrorDisplay message="This note doesn't exist or has been deleted." />
          </div>
        )
      case 'error':
        return (
          <div className="w-full p-4">
            <ErrorDisplay message={state.message}></ErrorDisplay>
          </div>
        )
      case 'ready': {
        const { note } = state
        const publishedDate = new Date(note.created_at).toLocaleDateString(
          undefined,
          { year: 'numeric', month: 'long', day: 'numeric' }
        )
        const editedDate = note.updated_at
          ? new Date(note.updated_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : null

        return (
          <div className="flex h-full w-full gap-2">
            <div
              className={`overflow-hidden bg-black transition-all duration-200 ${
                isExpanded
                  ? 'fixed inset-0 z-50 h-screen w-screen'
                  : 'sticky h-full w-[70%]'
              }`}
            >
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-label={isExpanded ? 'Exit fullscreen' : 'Expand preview'}
                className="absolute right-8 bottom-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <FontAwesomeIcon icon={isExpanded ? faCompress : faExpand} />
              </button>

              {note.content_url ? (
                <iframe
                  src={note.content_url}
                  title={note.title}
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  No content attached.
                </div>
              )}
            </div>

            {!isExpanded && (
              <div className="flex flex-1 flex-col gap-3 bg-slate-50 px-6 py-5 shadow-md">
                <div className="flex gap-4 border-b border-slate-200">
                  {(['details', 'comments', 'related'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`cursor-pointer border-b-2 px-1 pb-1 text-sm font-medium capitalize ${
                        activeTab === tab
                          ? 'border-black text-black'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}

                  {note.user_id === user?.id && (
                    <div className="relative mb-1 ml-auto" ref={menuRef}>
                      <button
                        onClick={() => setShowMenu((prev) => !prev)}
                        aria-label="Note options"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                      >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                      </button>

                      {showMenu && (
                        <div className="absolute right-0 z-10 mt-1 w-36 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                          <button
                            onClick={() => {
                              setShowMenu(false)
                              navigate(`/notes/${id}/edit`)
                            }}
                            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                          >
                            Edit Note
                          </button>
                          <button
                            onClick={() => {
                              setShowMenu(false)
                              handleDelete()
                            }}
                            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete Note
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {activeTab === 'details' && (
                  <div className="flex flex-col gap-3 pt-1">
                    <h1 className="font-serif text-3xl font-medium">
                      {note.title}
                    </h1>

                    {note.subject && (
                      <span className="w-fit rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-600">
                        {note.subject.name}
                      </span>
                    )}

                    <p className="text-sm text-slate-600">
                      Author: {note.author}
                    </p>
                    <p className="text-sm text-slate-600">
                      Date published: {publishedDate}
                    </p>
                    {editedDate && (
                      <p className="text-sm text-slate-600">
                        Date edited: {editedDate}
                      </p>
                    )}
                    {fileSize !== null && (
                      <p className="text-sm text-slate-600">
                        File size: {formatSize(fileSize)}
                      </p>
                    )}

                    <p className="mt-2 text-slate-800">{note.description}</p>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <p className="pt-6 text-sm text-slate-400">
                    Comments coming soon.
                  </p>
                )}

                {activeTab === 'related' && (
                  <p className="pt-6 text-sm text-slate-400">
                    Related notes coming soon.
                  </p>
                )}
              </div>
            )}
          </div>
        )
      }
    }
  }

  return <div className="flex flex-1 bg-slate-50">{renderContent()}</div>
}

export default NotePage
