import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'

import { DragDropProvider } from '@dnd-kit/react'
import { isSortable, useSortable } from '@dnd-kit/react/sortable'

import { supabase } from '@/lib/supabase'
import '@/lib/pdf'
import { useSubjects } from '@/lib/subjects'

import type { Note } from '@/types'

import { formatSize } from '@/lib/formatFileSize'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSpinner,
  faCircleExclamation,
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

function getStagedNewFileSize(pages: PageEntry[]): number {
  const seen = new Set<File>()
  let total = 0
  for (const entry of pages) {
    if (entry.source === 'new' && !seen.has(entry.file)) {
      seen.add(entry.file)
      total += entry.file.size
    }
  }
  return total
}

function attachId<T extends object>(entry: T): T & { id: string } {
  return { ...entry, id: crypto.randomUUID() }
}

async function renderPdfThumbnails(
  source: { url: string } | { data: ArrayBuffer },
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const pdf = await pdfjsLib.getDocument(source).promise
  const thumbnails: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 0.2 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const context = canvas.getContext('2d')!
    await page.render({ canvasContext: context, canvas, viewport }).promise
    thumbnails.push(canvas.toDataURL())
    onProgress?.(i, pdf.numPages)
  }

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
      className={`flex cursor-grab items-center gap-3 rounded-lg border border-gray-200 bg-white p-2 transition-shadow select-none active:cursor-grabbing ${isDragging ? 'z-20 shadow-xl' : ''}`}
    >
      <span className="w-5 text-center text-xs text-gray-400">
        {displayPosition + 1}
      </span>
      <img
        src={entry.thumbnail}
        alt={`Page ${displayPosition + 1}`}
        className="h-32 w-auto rounded border border-gray-200"
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
  const [baselineSize, setBaselineSize] = useState(0)

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
      })
      .finally(() => {
        setLoadingFiles(false)
        setPageProgress(null)
      })
  }, [state])

  useEffect(() => {
    if (state.status !== 'ready') return
    fetch(state.note.content_url, { method: 'HEAD' }).then((r) =>
      setBaselineSize(Number(r.headers.get('content-length')) || 0)
    )
  }, [state])

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

    const newFilesSize = files.reduce((sum, f) => sum + f.size, 0)
    const projectedSize =
      baselineSize + getStagedNewFileSize(pages) + newFilesSize
    if (projectedSize > MAX_PDF_SIZE) {
      showError(
        `Failure: This would bring the PDF to roughly ${formatSize(projectedSize)}, over the ${formatSize(MAX_PDF_SIZE)} limit.`
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

  async function handleReplacePdf(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return
    if (
      !confirm(
        'This discards every page currently listed and replaces them with the new file. Continue?'
      )
    )
      return

    setError(null)
    setLoadingFiles(true)
    try {
      const entries = await extractPageEntries(file, (current, total) =>
        setPageProgress({ current, total })
      )
      setPages(entries)
    } catch {
      showError("Could not read this file — make sure it's a valid PDF.")
    } finally {
      setLoadingFiles(false)
      setPageProgress(null)
    }
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
    if (state.status !== 'ready' || loadingFiles || saving) return
    const { note } = state
    setSaving(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        alert('Not authenticated!')
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
      formData.append('noteTitle', title)
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
        alert(body?.error ?? 'Failed to update PDF pages.')
        return
      }

      const { content_url, preview_url } = await res.json()

      const { error: updateError } = await supabase
        .from('notes')
        .update({
          title,
          subject,
          description,
          content_url,
          preview_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', note.id)

      if (updateError) {
        alert(updateError.message)
        return
      }

      navigate(`/notes/${note.id}`)
    } finally {
      setSaving(false)
    }
  }

  if (state.status === 'loading') return <div>Loading...</div>
  if (state.status === 'error') return <div>{state.message}</div>

  return (
    <div className="flex h-full w-full gap-8 p-6">
      <div className="flex h-full w-[50%] flex-col gap-3">
        <div className="w-full flex-1 flex-col gap-2 space-y-2 overflow-y-auto rounded-2xl border border-gray-200 bg-zinc-50 p-3">
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

        <div className="flex items-center gap-2">
          <label
            className={`cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-xs ${loadingFiles ? 'pointer-events-none opacity-50' : ''}`}
          >
            Add page(s)
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              multiple
              className="hidden"
              disabled={loadingFiles}
              onChange={(e) => handleAddFiles(e.target.files)}
            />
          </label>
          <label
            className={`cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-xs ${loadingFiles ? 'pointer-events-none opacity-50' : ''}`}
          >
            Replace PDF
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={loadingFiles}
              onChange={(e) => handleReplacePdf(e.target.files)}
            />
          </label>

          {loadingFiles ? (
            <span className="flex flex-1 items-center gap-1.5 text-xs text-gray-500">
              <FontAwesomeIcon icon={faSpinner} spinPulse />
              {fileProgress
                ? `Processing file ${fileProgress.current} of ${fileProgress.total}`
                : pageProgress
                  ? `Loading page ${pageProgress.current} of ${pageProgress.total}`
                  : 'Processing files…'}
            </span>
          ) : error ? (
            <span
              className={`flex-1 text-xs text-red-600 transition-opacity duration-500 ${errorVisible ? 'opacity-100' : 'opacity-0'}`}
            >
              <FontAwesomeIcon icon={faCircleExclamation} className="mr-1" />
              {error}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-gray-200 p-2 text-2xl font-bold focus:border-gray-300 focus:outline-none"
        />

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={`rounded-lg border border-gray-300 px-2 py-2 focus:border-gray-300 focus:outline-none ${subject === '' ? 'text-zinc-400' : 'text-zinc-800'}`}
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

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 resize-none rounded-lg border border-gray-200 p-2 focus:border-gray-300 focus:outline-none"
        />

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/notes/${id}`)}
            className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm"
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
  )
}

export default NoteEditPage
