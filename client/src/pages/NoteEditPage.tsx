import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'

import { DragDropProvider } from '@dnd-kit/react'
import { isSortable, useSortable } from '@dnd-kit/react/sortable'

import { supabase } from '@/lib/supabase'
import { ErrorDisplay, Loading } from '@/components'
import '@/lib/pdf'
import { useSubjects } from '@/lib/subjects'

import type { Note } from '@/types'

import { formatSize } from '@/lib/formatFileSize'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSpinner,
  faCircleExclamation,
  faFileLines,
  faPlus,
  faTrashCan,
  faArrowUp,
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons'

type FetchState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; note: Note }

type PageSource =
  | { source: 'existing'; index: number }
  | { source: 'new'; file: File; pageIndex: number }

type PageEntry = { id: string; thumbnail: string } & PageSource

const MAX_PDF_SIZE = 50 * 1024 * 1024

function attachId<T extends object>(entry: T): T & { id: string } {
  return { ...entry, id: crypto.randomUUID() }
}

async function renderPdfThumbnails(
  source: { url: string } | { data: ArrayBuffer },
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const startTime = performance.now()
  const pdf = await pdfjsLib.getDocument(source).promise
  const thumbnails: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 0.35 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const context = canvas.getContext('2d')!
    await page.render({ canvasContext: context, canvas, viewport }).promise
    thumbnails.push(canvas.toDataURL())
    onProgress?.(i, pdf.numPages)
  }

  console.log(
    `Rendered ${pdf.numPages} page(s) in ${(performance.now() - startTime).toFixed(2)}ms`
  )

  return thumbnails
}

function SortablePage({
  entry,
  displayPosition,
  onDelete,
}: {
  entry: PageEntry
  displayPosition: number
  onDelete: (id: string) => void
}) {
  const { ref, isDragging } = useSortable({
    id: entry.id,
    index: displayPosition,
  })

  return (
    <div
      ref={ref}
      className={`flex h-36 cursor-grab items-center gap-3 rounded-lg border border-gray-200 bg-white p-2 transition-shadow select-none active:cursor-grabbing ${isDragging ? 'z-20 shadow-xl' : ''}`}
    >
      <span className="w-5 text-center text-xs text-gray-400">
        {displayPosition + 1}
      </span>
      <img
        src={entry.thumbnail}
        alt={`Page ${displayPosition + 1}`}
        className="max-h-32 max-w-25 border border-gray-200"
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(entry.id)
        }}
        className="ml-auto cursor-pointer rounded-full px-2 py-1 text-xs text-gray-400 hover:bg-red-50 hover:text-red-500"
      >
        ✕
      </button>
    </div>
  )
}

function NoteEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const SUBJECTS = useSubjects()

  const [state, setState] = useState<FetchState>({ status: 'loading' })
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  const [pages, setPages] = useState<PageEntry[]>([])
  const [saving, setSaving] = useState(false)
  const [loadingFiles, setLoadingFiles] = useState(false)

  const pageListRef = useRef<HTMLDivElement>(null)
  const [pageListScrolled, setPageListScrolled] = useState(false)
  const prevPageCountRef = useRef<number>(0)
  const originalPageCountRef = useRef<number | null>(null)

  const [pageProgress, setPageProgress] = useState<{
    current: number
    total: number
  } | null>(null)
  const [fileProgress, setFileProgress] = useState<{
    current: number
    total: number
  } | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [errorVisible, setErrorVisible] = useState(false)
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const removeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  function showError(message: string) {
    setError(message)
    setErrorVisible(true)

    clearTimeout(fadeTimeoutRef.current)
    fadeTimeoutRef.current = setTimeout(() => setErrorVisible(false), 6000)

    clearTimeout(removeTimeoutRef.current)
    removeTimeoutRef.current = setTimeout(() => setError(null), 6500)
  }

  // Scroll to bottom when new pages are added
  useEffect(() => {
    if (pages.length > prevPageCountRef.current) {
      scrollToBottom()
    }
    prevPageCountRef.current = pages.length
  }, [pages])

  // Fetch note data on mount
  useEffect(() => {
    async function fetchNote() {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setState({
          status: 'error',
          message: error?.message ?? 'Note not found',
        })
        return
      }
      setState({ status: 'ready', note: data })
      setTitle(data.title)
      setSubject(data.subject)
      setDescription(data.description)
    }

    fetchNote()
  }, [id])

  // Render thumbnails for existing pages
  useEffect(() => {
    if (state.status !== 'ready') return

    setLoadingFiles(true)
    renderPdfThumbnails({ url: state.note.content_url }, (current, total) =>
      setPageProgress({ current, total })
    )
      .then((thumbnails) => {
        setPages(
          thumbnails.map((thumbnail, index) =>
            attachId({ thumbnail, source: 'existing', index })
          )
        )
        originalPageCountRef.current = thumbnails.length
      })
      .finally(() => {
        setLoadingFiles(false)
        setPageProgress(null)
      })
  }, [state])

  const justSavedRef = useRef(false)

  function metadataChanged() {
    if (state.status !== 'ready') return false
    return (
      title !== state.note.title ||
      subject !== state.note.subject ||
      description !== state.note.description
    )
  }

  function pagesChanged() {
    if (originalPageCountRef.current === null) return false
    if (pages.length !== originalPageCountRef.current) return true
    return pages.some((p, i) => p.source !== 'existing' || p.index !== i)
  }

  function isDirty() {
    if (justSavedRef.current) return false
    return metadataChanged() || pagesChanged()
  }

  // Warn before closing the tab, refreshing, or typing a new URL
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty()) return
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [state, title, subject, description, pages])

  // Warn before navigating to a different page within the app
  // (Sidebar links, the Cancel button, browser back/forward)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty() && currentLocation.pathname !== nextLocation.pathname
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (window.confirm('Changes you made may not be saved.')) {
      blocker.proceed()
    } else {
      blocker.reset()
    }
  }, [blocker])

  async function extractPageEntries(
    file: File,
    onProgress?: (current: number, total: number) => void
  ): Promise<PageEntry[]> {
    if (file.type === 'application/pdf') {
      const buffer = await file.arrayBuffer()
      const thumbnails = await renderPdfThumbnails({ data: buffer }, onProgress)
      return thumbnails.map((thumbnail, pageIndex) =>
        attachId({ source: 'new' as const, file, pageIndex, thumbnail })
      )
    }

    return [
      attachId({
        source: 'new' as const,
        file,
        pageIndex: 0,
        thumbnail: URL.createObjectURL(file),
      }),
    ]
  }

  async function handleAddFiles(fileList: FileList | null) {
    if (!fileList?.length) return
    const files = Array.from(fileList)
    setError(null)

    const oversized = files.find((f) => f.size > MAX_PDF_SIZE)
    if (oversized) {
      showError(
        `"${oversized.name}" is ${formatSize(oversized.size)}, over the ${formatSize(MAX_PDF_SIZE)} limit.`
      )
      return
    }

    setLoadingFiles(true)
    try {
      const newEntries: PageEntry[] = []
      for (let i = 0; i < files.length; i++) {
        setFileProgress({ current: i + 1, total: files.length })
        const entries = await extractPageEntries(files[i])
        newEntries.push(...entries)
      }
      setPages((prev) => [...prev, ...newEntries])
    } catch {
      showError(
        "Could not read one of the selected files — make sure it's a valid PDF, PNG, or JPEG."
      )
    } finally {
      setLoadingFiles(false)
      setFileProgress(null)
    }
  }

  function handleDeletePage(id: string) {
    setPages((prev) => prev.filter((p) => p.id !== id))
  }

  function handleClearAll() {
    if (!pages.length) return
    if (!confirm('Remove all pages from this note?')) return
    setPages([])
  }

  function scrollToTop() {
    pageListRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function scrollToBottom() {
    const el = pageListRef.current
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  function handlePageListScroll(e: React.UIEvent<HTMLDivElement>) {
    setPageListScrolled(e.currentTarget.scrollTop > 0)
  }

  const handleDragEnd: NonNullable<
    ComponentProps<typeof DragDropProvider>['onDragEnd']
  > = (event) => {
    if (event.canceled) return

    const { source } = event.operation
    if (!isSortable(source)) return

    const { initialIndex, index } = source
    if (initialIndex === index) return

    setPages((prev) => {
      const newOrder = [...prev]
      const [moved] = newOrder.splice(initialIndex, 1)
      newOrder.splice(index, 0, moved)
      return newOrder
    })
  }

  async function handleSave() {
    const startTime = performance.now()
    if (state.status !== 'ready' || loadingFiles || saving) return
    const { note } = state
    setSaving(true)
    setLoadingFiles(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        showError('Not authenticated!')
        return
      }

      // Pages/files are untouched - skip rebuilding the PDF entirely and
      // just update the note's metadata
      if (!pagesChanged()) {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/notes/${note.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ title, subject, description }),
          }
        )

        if (!res.ok) {
          const body = await res.json().catch(() => null)
          showError(body?.error ?? 'Failed to update note.')
          return
        }

        justSavedRef.current = true
        navigate(`/notes/${note.id}`)
        return
      }

      if (pages.length === 0) {
        showError('Note has no pages.')
        return
      }

      const fileList: File[] = []
      const fileIndexByFile = new Map<File, number>()

      const spec = pages.map((entry) => {
        if (entry.source === 'existing')
          return { source: 'existing', index: entry.index }

        let fileIndex = fileIndexByFile.get(entry.file)
        if (fileIndex === undefined) {
          fileIndex = fileList.length
          fileList.push(entry.file)
          fileIndexByFile.set(entry.file, fileIndex)
        }
        return { source: 'new', fileIndex, pageIndex: entry.pageIndex }
      })

      const formData = new FormData()
      formData.append(
        'newNoteData',
        JSON.stringify({
          title,
          subject,
          description,
        })
      )
      formData.append('pages', JSON.stringify(spec))
      fileList.forEach((file) => formData.append('files', file))

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notes/${note.id}/edit`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: formData,
        }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        showError(body?.error ?? 'Failed to update PDF pages.')
        return
      }

      justSavedRef.current = true
      navigate(`/notes/${note.id}`)
    } finally {
      const endTime = performance.now()
      console.log(`Save operation took ${(endTime - startTime).toFixed(2)}ms`)
      setLoadingFiles(false)
      setSaving(false)
    }
  }

  if (state.status === 'loading') return <Loading />
  if (state.status === 'error')
    return (
      <div className="flex-1 bg-zinc-50 p-6">
        <ErrorDisplay message={state.message} />
      </div>
    )

  return (
    <div className="flex flex-1 flex-col gap-6 bg-zinc-50 p-6">
      <div className="flex items-baseline gap-2 font-bold text-zinc-900">
        <span className="text-3xl font-medium text-zinc-800">Edit / </span>
        <span className="text-2xl font-medium text-zinc-600">
          {state.note.title}
        </span>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left column - page list */}
        <div className="flex w-1/2 flex-col gap-2">
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border-2 border-gray-200 bg-zinc-100">
            <div
              className={`z-10 flex shrink-0 items-center justify-between border-b-2 border-gray-200 bg-white px-4 py-3 transition-shadow ${
                pageListScrolled ? 'shadow-md' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faFileLines}
                  className="text-lg font-medium text-zinc-600"
                />
                <span className="font-semibold text-zinc-800">Pages</span>
              </div>

              {(loadingFiles || error) && (
                <div className="flex items-center px-1">
                  {loadingFiles ? (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <FontAwesomeIcon icon={faSpinner} spin />
                      {fileProgress
                        ? `Processing file ${fileProgress.current} of ${fileProgress.total}`
                        : pageProgress
                          ? `Loading page ${pageProgress.current} of ${pageProgress.total}`
                          : 'Processing files…'}
                    </span>
                  ) : error ? (
                    <span
                      className={`text-xs text-red-600 transition-opacity duration-500 ${errorVisible ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <FontAwesomeIcon
                        icon={faCircleExclamation}
                        className="mr-1"
                      />
                      {error}
                    </span>
                  ) : null}
                </div>
              )}

              <div className="flex items-center gap-2 text-zinc-500">
                <label
                  title="Add files"
                  className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 text-blue-600 hover:bg-gray-50 ${loadingFiles ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    multiple
                    className="hidden"
                    disabled={loadingFiles}
                    onChange={(e) => handleAddFiles(e.target.files)}
                  />
                </label>

                <button
                  type="button"
                  title="Remove all files"
                  onClick={handleClearAll}
                  disabled={loadingFiles || !pages.length}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 px-2 text-xs text-red-500 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faTrashCan} size="lg" />
                </button>

                <div className="mx-1 h-7 w-px bg-gray-200" />

                <button
                  type="button"
                  title="Scroll to top"
                  onClick={scrollToTop}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faArrowUp} />
                </button>
                <button
                  type="button"
                  title="Scroll to bottom"
                  onClick={scrollToBottom}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faArrowDown} />
                </button>
              </div>
            </div>

            <div
              ref={pageListRef}
              onScroll={handlePageListScroll}
              className="flex-1 scrollbar-thin [scrollbar-color:var(--color-zinc-300)_transparent] space-y-2 overflow-y-auto p-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent"
            >
              <DragDropProvider onDragEnd={handleDragEnd}>
                {pages.map((entry, displayPosition) => (
                  <SortablePage
                    key={entry.id}
                    entry={entry}
                    displayPosition={displayPosition}
                    onDelete={handleDeletePage}
                  />
                ))}
              </DragDropProvider>
            </div>
          </div>
        </div>

        {/* Right column - note metadata */}
        <div className="flex flex-1 flex-col gap-3">
          <div className="-mb-1 text-lg text-zinc-600">Title</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="-mt-1 rounded-lg border border-gray-300 bg-white p-2 text-2xl font-medium text-zinc-800 focus:outline-gray-300"
          />

          <div className="-mb-1 text-lg text-zinc-600">Subject</div>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={`rounded-lg border border-gray-300 bg-white px-2 py-2 focus:border-gray-300 focus:outline-none ${subject === '' ? 'text-zinc-400' : 'text-zinc-800'}`}
          >
            <option value="" disabled>
              Subject (required)
            </option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s} className="text-zinc-700">
                {s}
              </option>
            ))}
          </select>

          <div className="-mb-1 text-lg text-zinc-600">Description</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 resize-none rounded-lg border border-gray-300 bg-white p-2 text-gray-800 focus:outline-gray-300"
          />

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/notes/${id}`)}
              className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loadingFiles}
              className="cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoteEditPage
