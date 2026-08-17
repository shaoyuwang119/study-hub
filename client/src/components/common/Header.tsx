import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBookBookmark,
  faMagnifyingGlass,
  faBell,
} from '@fortawesome/free-solid-svg-icons'
import { faSquarePlus } from '@fortawesome/free-regular-svg-icons'

import { supabase } from '@/lib/supabase'
import { useSubjects } from '@/lib/subjects'

type HeaderProps = {
  profileName: string
  onCreateClick: () => void
}

type NoteSuggestion = {
  id: number
  title: string
  author: string | null
}

export default function Header({ profileName, onCreateClick }: HeaderProps) {
  const navigate = useNavigate()
  const subjects = useSubjects()
  const location = useLocation()

  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [noteSuggestions, setNoteSuggestions] = useState<NoteSuggestion[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery('')
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setNoteSuggestions([])
      return
    }

    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('notes')
        .select('id, title, author')
        .ilike('title', `%${query}%`)
        .limit(5)

      setNoteSuggestions(data ?? [])
    }, 250)

    return () => clearTimeout(timeout)
  }, [query])

  const subjectSuggestions = query.trim()
    ? subjects
        .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 6)
    : []

  const runSearch = () => {
    if (!query.trim()) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setIsOpen(false)
  }

  const showDropdown =
    isOpen &&
    query.trim() &&
    (noteSuggestions.length > 0 || subjectSuggestions.length > 0)

  return (
    <header className="flex h-16 w-full shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-6">
      <NavLink
        to={'/'}
        className="text-sea-navy shrink-0 font-serif text-2xl font-bold select-none"
      >
        <FontAwesomeIcon icon={faBookBookmark} className="mr-1.5" />
        StudyNote
      </NavLink>

      <div className="flex flex-1 justify-center">
        <div className="relative w-full max-w-150" ref={containerRef}>
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSearch()
            }}
            placeholder="Search notes, classes, subjects..."
            className="focus:border-sea-teal focus:ring-sea-lavender w-full rounded-full border border-slate-200 bg-slate-100 py-2 pr-3 pl-9 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:outline-none"
          />

          {showDropdown && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {noteSuggestions.length > 0 && (
                <div>
                  <div className="px-3 pt-2 text-xs font-medium text-slate-400">
                    Notes
                  </div>
                  {noteSuggestions.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => {
                        navigate(`/notes/${note.id}`)
                        setIsOpen(false)
                        setQuery('')
                      }}
                      className="flex w-full flex-col px-3 py-2 text-left hover:bg-slate-100"
                    >
                      <span className="text-sm font-medium text-slate-800">
                        {note.title}
                      </span>
                      {note.author && (
                        <span className="text-xs text-slate-400">
                          {note.author}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {subjectSuggestions.length > 0 && (
                <div className="border-t border-slate-100">
                  <div className="px-3 pt-2 text-xs font-medium text-slate-400">
                    Subjects
                  </div>
                  {subjectSuggestions.map((subject) => (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => {
                        navigate(`/search?subject=${subject.id}`)
                        setIsOpen(false)
                        setQuery('')
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <span>{subject.name}</span>
                      <span className="text-xs text-slate-400">
                        {subject.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          onClick={onCreateClick}
          className="border-sea-teal text-sea-teal hover:bg-sea-teal flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-base font-medium transition-all duration-200 hover:text-white"
        >
          <FontAwesomeIcon icon={faSquarePlus} />
          Create
        </button>

        <button
          title="Notifications"
          className="flex size-10 cursor-pointer items-center justify-center rounded-full text-base text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          <FontAwesomeIcon icon={faBell} />
        </button>

        <div
          onClick={() => navigate('/profile')}
          className="transition:color flex h-10 cursor-pointer items-center gap-3 rounded-full px-1 duration-200 hover:bg-slate-100"
        >
          <div className="bg-sea-sky text-sea-teal-dark flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
            {profileName ? profileName.charAt(0).toUpperCase() : '?'}
          </div>
          <span className="mr-2 text-sm font-medium whitespace-nowrap text-slate-900">
            {profileName || 'Loading...'}
          </span>
        </div>
      </div>
    </header>
  )
}
