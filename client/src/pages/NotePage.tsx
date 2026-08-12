import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'
import { formatSize } from '@/lib/formatFileSize'

import { Sidebar, ErrorDisplay } from '@/components'
import type { User } from '@supabase/supabase-js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faExpand,
  faCompress,
  faEllipsisVertical,
} from '@fortawesome/free-solid-svg-icons'

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

  async function handleDelete() {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this note?'
    )

    if (!confirmDelete) return

    const { data } = await supabase.from('notes').delete().eq('id', id)

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

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', data.user_id)
        .single()

      setState({
        status: 'ready',
        note: { ...data, author: profile?.display_name ?? data.author },
      })
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
        const { note } = state
        const publishedDate = new Date(note.created_at).toLocaleDateString(
          undefined,
          { year: 'numeric', month: 'long', day: 'numeric' }
        )

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
                className="absolute top-4 right-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
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
                <div className="flex h-full items-center justify-center text-gray-400">
                  No content attached.
                </div>
              )}
            </div>

            {!isExpanded && (
              <div className="flex flex-1 flex-col gap-3 bg-zinc-50 px-6 py-5 shadow-md">
                <div className="flex gap-4 border-b border-gray-200">
                  {(['details', 'comments', 'related'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`cursor-pointer border-b-2 px-1 pb-1 text-sm font-medium capitalize ${
                        activeTab === tab
                          ? 'border-black text-black'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
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
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                      >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                      </button>

                      {showMenu && (
                        <div className="absolute right-0 z-10 mt-1 w-36 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                          <button
                            onClick={() => {
                              setShowMenu(false)
                              navigate(`/notes/${id}/edit`)
                            }}
                            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
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
                    <h1 className="text-3xl font-bold">{note.title}</h1>

                    {note.subject && (
                      <span className="w-fit rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-600">
                        {note.subject}
                      </span>
                    )}

                    <p className="text-sm text-gray-600">
                      Author: {note.author}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date published: {publishedDate}
                    </p>
                    {fileSize !== null && (
                      <p className="text-sm text-gray-600">
                        File size: {formatSize(fileSize)}
                      </p>
                    )}

                    <p className="mt-2 text-gray-800">{note.description}</p>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <p className="pt-6 text-sm text-gray-400">
                    Comments coming soon.
                  </p>
                )}

                {activeTab === 'related' && (
                  <p className="pt-6 text-sm text-gray-400">
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

  return <div className="flex-1 bg-zinc-50">{renderContent()}</div>
}

export default NotePage
