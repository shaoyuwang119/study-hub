import { useEffect, useState } from 'react'

import { NoteCard, Sidebar } from '@/components'
import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'

function ExplorePage() {
  const [query, setQuery] = useState('')
  const [author, setAuthor] = useState('')
  const [results, setResults] = useState<Note[]>([])
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // Load all notes on first visit so the page isn't empty
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)

      // Fetches notes from supabase
      const { data, error } = await supabase.from('notes').select('*')
      if (error) {
        setError(error.message)
        return
      }

      setAllNotes(data)
      setResults(data)
      setLoading(false)
    }
    loadAll()
  }, [])

  const handleSearch = async () => {
    try {
      setLoading(true)
      setSearched(true)

      // Build the query string from whichever fields are filled in
      const params = new URLSearchParams()
      if (query.trim()) {
        params.append('q', query.trim())
      }
      if (author.trim()) {
        params.append('author', author.trim())
      }

      // TEMPORARY: do nothing & return if search fields are blank
      const queryString = params.toString()
      if (queryString.length == 0) {
        return
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .ilike('title', `%${query}%`)
        .ilike('author', `%${author}%`)

      if (error) {
        setError(error.message)
        return
      }

      setResults(data || [])
      console.log(data)
      setLoading(false)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error occured')
      }
    } finally {
      setLoading(false)
    }
  }

  // Allow pressing Enter in either input to trigger search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const displayedNotes = results

  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar />
      <div className="flex-1 flex-col bg-zinc-50 p-6">
        {/* Page header */}
        <div className="mb-6">
          <div className="text-4xl font-medium text-zinc-900">Explore</div>
          <p className="mt-1 text-sm text-zinc-400">
            Search notes shared by the community
          </p>
        </div>

        {/* Search bar area */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <div className="flex flex-col gap-3">
            {/* Title search */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-500">
                Search by title
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Calculus derivatives, WW2 notes..."
                className="w-full rounded-lg border border-gray-200 bg-zinc-50 px-3 py-2 text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
            </div>

            {/* Author search */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-500">
                Search by author
              </label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. John D..."
                className="w-full rounded-lg border border-gray-200 bg-zinc-50 px-3 py-2 text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
            </div>

            {/* Search button + clear */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSearch}
                className="cursor-pointer rounded-lg bg-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
              >
                Search
              </button>
              {searched && (
                <button
                  onClick={() => {
                    setQuery('')
                    setAuthor('')
                    setResults(allNotes)
                    setSearched(false)
                  }}
                  className="cursor-pointer rounded-lg border border-gray-200 px-5 py-2 text-sm text-zinc-500 transition hover:bg-zinc-100"
                >
                  Clear
                </button>
              )}
              {searched && !loading && (
                <span className="ml-auto text-xs text-zinc-400">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        {/* Results section */}
        <div>
          <div className="mb-3 text-sm font-medium text-zinc-500">
            {searched ? 'Search results' : 'All notes'}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-zinc-400">
              Loading...
            </div>
          ) : displayedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
              <p className="text-sm text-zinc-500">No notes found</p>
              <p className="mt-1 text-xs text-zinc-400">
                Try a different title or author name
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-y-2">
              {displayedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  preview={note.content_url}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExplorePage
